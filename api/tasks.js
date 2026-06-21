import { queryDS, createPage, updatePage, archivePage, retrieveDS, txt, title, rich, json, readBody, qs } from "./_notion.js";
import { kvGet, kvSet } from "./_kv.js";
const DS = () => process.env.DS_NHIEMVU;
// Schema thật: title "Nhiệm Vụ", checkbox "Hoàn Thành", select "Trạng Thái", date "Ngày Thực Hiện", date "Ngày Hoàn Thành", relation "Dự Án"
const T = { title: "Nhiệm Vụ", done: "Hoàn Thành", status: "Trạng Thái", due: "Ngày Thực Hiện", doneDate: "Ngày Hoàn Thành", project: "Dự Án" };
const today = () => new Date().toISOString().slice(0, 10);

// Dò cột ghi chú (rich_text có tên kiểu ghi chú). Không có thì lưu Upstash.
const NOTE_RE = /ghi\s*ch|m[oô]\s*t|ghi\s*nh|note|description|n[oộ]i\s*dung/i;
const NOTE_KEY = "tasknotes"; // fallback: { [pageId]: text }
let _noteProp; // cache trong lambda ấm
async function noteProp() {
  if (_noteProp !== undefined) return _noteProp;
  try { const ds = await retrieveDS(DS()); const props = ds?.properties || {}; _noteProp = Object.keys(props).find((n) => props[n].type === "rich_text" && NOTE_RE.test(n)) || null; }
  catch { _noteProp = null; }
  return _noteProp;
}

export default async function handler(req, res) {
  try {
    const NP = await noteProp();

    if (req.method === "GET") {
      const data = await queryDS(DS(), {
        filter: { and: [
          { property: T.status, select: { equals: "Hoạt Động" } },
          { or: [
            { property: T.done, checkbox: { equals: false } },
            { property: T.doneDate, date: { equals: today() } },
          ] },
        ] },
        sorts: [{ property: T.due, direction: "ascending" }],
        page_size: 100,
      });
      const kv = NP ? null : ((await kvGet(NOTE_KEY)) || {});
      const tasks = data.results.map((p) => ({
        id: p.id,
        name: txt(p.properties[T.title]?.title),
        done: !!p.properties[T.done]?.checkbox,
        due: p.properties[T.due]?.date?.start || null,
        dueEnd: p.properties[T.due]?.date?.end || null,
        doneDate: p.properties[T.doneDate]?.date?.start || null,
        projectId: p.properties[T.project]?.relation?.[0]?.id || null,
        note: NP ? txt(p.properties[NP]?.rich_text) : (kv[p.id] || ""),
      }));
      return json(res, 200, tasks);
    }

    if (req.method === "POST") {
      const { name, projectId, due, dueEnd, note } = await readBody(req);
      const startDate = due || today();
      const validEnd = dueEnd && dueEnd > startDate ? dueEnd : null; // end phải sau start mới là khoảng
      const props = {
        [T.title]: { title: title(name) },
        [T.status]: { select: { name: "Hoạt Động" } },
        [T.done]: { checkbox: false },
        [T.due]: { date: { start: startDate, ...(validEnd ? { end: validEnd } : {}) } },
      };
      if (projectId) props[T.project] = { relation: [{ id: projectId }] };
      if (NP && note) props[NP] = { rich_text: rich(note) };
      const created = await createPage(DS(), props);
      if (!NP && note) { const m = (await kvGet(NOTE_KEY)) || {}; m[created.id] = note; await kvSet(NOTE_KEY, m); }
      return json(res, 200, { id: created.id, name, done: false, due: startDate, dueEnd: validEnd, doneDate: null, projectId: projectId || null, note: note || "" });
    }

    if (req.method === "PATCH") {
      const b = await readBody(req);
      const props = {};
      if (b.done !== undefined) { props[T.done] = { checkbox: !!b.done }; props[T.doneDate] = b.done ? { date: { start: today() } } : { date: null }; }
      if (b.name !== undefined) props[T.title] = { title: title(b.name) };
      if (b.due !== undefined || b.dueEnd !== undefined) {
        const start = b.due !== undefined ? b.due : undefined;
        // Đổi ngày: gửi kèm cả due và dueEnd. start rỗng -> xoá ngày.
        if (b.due !== undefined && !b.due) props[T.due] = { date: null };
        else if (start) {
          const end = b.dueEnd && b.dueEnd > start ? b.dueEnd : null;
          props[T.due] = { date: { start, ...(end ? { end } : {}) } };
        }
      }
      if (b.projectId !== undefined) props[T.project] = { relation: b.projectId ? [{ id: b.projectId }] : [] };
      if (b.note !== undefined && NP) props[NP] = { rich_text: rich(b.note) };
      if (Object.keys(props).length) await updatePage(b.id, props);
      if (b.note !== undefined && !NP) { const m = (await kvGet(NOTE_KEY)) || {}; m[b.id] = b.note; await kvSet(NOTE_KEY, m); }
      return json(res, 200, { ok: true, doneDate: b.done !== undefined ? (b.done ? today() : null) : undefined });
    }

    if (req.method === "DELETE") {
      const id = qs(req, "id");
      await archivePage(id);
      if (!NP) { const m = (await kvGet(NOTE_KEY)) || {}; if (m[id]) { delete m[id]; await kvSet(NOTE_KEY, m); } }
      return json(res, 200, { ok: true });
    }
    json(res, 405, { error: "method" });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
