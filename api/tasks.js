import { queryDS, createPage, updatePage, archivePage, txt, title, json, readBody, qs } from "./_notion.js";
const DS = () => process.env.DS_NHIEMVU;
// Schema thật: title "Nhiệm Vụ", checkbox "Hoàn Thành", select "Trạng Thái", date "Ngày Thực Hiện", date "Ngày Hoàn Thành"
const T = { title: "Nhiệm Vụ", done: "Hoàn Thành", status: "Trạng Thái", due: "Ngày Thực Hiện", doneDate: "Ngày Hoàn Thành" };
const today = () => new Date().toISOString().slice(0, 10);

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Lấy nhiệm vụ đang Hoạt Động & chưa Hoàn Thành (giống view "Hôm Nay")
      const data = await queryDS(DS(), {
        filter: { and: [
          { property: T.status, select: { equals: "Hoạt Động" } },
          { property: T.done, checkbox: { equals: false } },
        ] },
        sorts: [{ property: T.due, direction: "ascending" }],
        page_size: 100,
      });
      const tasks = data.results.map((p) => ({
        id: p.id,
        name: txt(p.properties[T.title]?.title),
        done: !!p.properties[T.done]?.checkbox,
        due: p.properties[T.due]?.date?.start || null,
        doneDate: p.properties[T.doneDate]?.date?.start || null,
        projectId: p.properties["Dự Án"]?.relation?.[0]?.id || null,
      }));
      return json(res, 200, tasks);
    }
    if (req.method === "POST") {
      const { name, projectId, due } = await readBody(req);
      const startDate = due || today();
      const props = {
        [T.title]: { title: title(name) },
        [T.status]: { select: { name: "Hoạt Động" } },
        [T.done]: { checkbox: false },
        [T.due]: { date: { start: startDate } },
      };
      if (projectId) props["Dự Án"] = { relation: [{ id: projectId }] };
      const created = await createPage(DS(), props);
      return json(res, 200, { id: created.id, name, done: false, due: startDate, doneDate: null, projectId: projectId || null });
    }
    if (req.method === "PATCH") {
      const { id, done } = await readBody(req);
      const dd = done ? today() : null;
      await updatePage(id, { [T.done]: { checkbox: !!done }, [T.doneDate]: done ? { date: { start: dd } } : { date: null } });
      return json(res, 200, { ok: true, doneDate: dd });
    }
    if (req.method === "DELETE") { await archivePage(qs(req, "id")); return json(res, 200, { ok: true }); }
    json(res, 405, { error: "method" });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
