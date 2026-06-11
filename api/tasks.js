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
      const tasks = data.results.map((p) => ({ id: p.id, name: txt(p.properties[T.title]?.title), done: !!p.properties[T.done]?.checkbox }));
      return json(res, 200, tasks);
    }
    if (req.method === "POST") {
      const { name } = await readBody(req);
      const created = await createPage(DS(), {
        [T.title]: { title: title(name) },
        [T.status]: { select: { name: "Hoạt Động" } },
        [T.done]: { checkbox: false },
        [T.due]: { date: { start: today() } },
      });
      return json(res, 200, { id: created.id, name, done: false });
    }
    if (req.method === "PATCH") {
      const { id, done } = await readBody(req);
      const props = { [T.done]: { checkbox: !!done } };
      props[T.doneDate] = done ? { date: { start: today() } } : { date: null };
      await updatePage(id, props);
      return json(res, 200, { ok: true });
    }
    if (req.method === "DELETE") { await archivePage(qs(req, "id")); return json(res, 200, { ok: true }); }
    json(res, 405, { error: "method" });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
