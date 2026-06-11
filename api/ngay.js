import { queryDS, createPage, updatePage, appendChildren, title, rich, json, readBody, qs } from "./_notion.js";
const DS = () => process.env.DS_NGAY;
const DATE = "Ngày", TITLE = "Tiêu Đề Ngày";

async function findDay(date) {
  const d = await queryDS(DS(), { filter: { property: DATE, date: { equals: date } }, page_size: 1 });
  return d.results[0] || null;
}
async function ensureDay(date) {
  return (await findDay(date)) || (await createPage(DS(), { [TITLE]: { title: title(`${date} Trí`) }, [DATE]: { date: { start: date } } }));
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const page = await findDay(qs(req, "date"));
      if (!page) return json(res, 200, null);
      const habits = {};
      for (const [k, v] of Object.entries(page.properties)) if (v.type === "checkbox") habits[k] = v.checkbox;
      return json(res, 200, { id: page.id, habits });
    }
    if (req.method === "POST") {
      const b = await readBody(req);
      const page = await ensureDay(b.date);
      if (b.action === "tick") { await updatePage(page.id, { [b.habit]: { checkbox: !!b.value } }); return json(res, 200, { ok: true }); }
      if (b.action === "answers") {
        const heading = b.kind === "morning" ? "🌅 Đầu ngày (app)" : "🌙 Cuối ngày (app)";
        const children = [{ object: "block", type: "heading_3", heading_3: { rich_text: rich(heading) } }];
        for (const a of b.answers) if (a && a.trim()) children.push({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rich(a) } });
        if (children.length > 1) await appendChildren(page.id, children);
        return json(res, 200, { ok: true });
      }
    }
    json(res, 405, { error: "method" });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
