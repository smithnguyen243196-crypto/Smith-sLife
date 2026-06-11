import { queryDS, createPage, archivePage, txt, title, rich, json, readBody, qs } from "./_notion.js";
const DS = () => process.env.DS_VI;
const P = { title: "Name", type: "Loại", amount: "Số tiền", category: "Danh mục", account: "Ví", date: "Ngày", note: "Ghi chú" };

export default async function handler(req, res) {
  try {
    if (!DS()) return json(res, 200, []);
    if (req.method === "GET") {
      const data = await queryDS(DS(), { sorts: [{ property: P.date, direction: "descending" }], page_size: 100 });
      const txs = data.results.map((p) => {
        const pr = p.properties;
        return {
          id: p.id,
          type: pr[P.type]?.select?.name === "Thu" ? "thu" : "chi",
          account: pr[P.account]?.select?.name || "Tiền mặt",
          category: txt(pr[P.category]?.rich_text) || "Khác",
          amount: pr[P.amount]?.number || 0,
          note: txt(pr[P.note]?.rich_text) || txt(pr[P.title]?.title),
          date: pr[P.date]?.date?.start || "",
        };
      });
      return json(res, 200, txs);
    }
    if (req.method === "POST") {
      const t = await readBody(req);
      const label = t.note || `${t.category} · ${t.type === "thu" ? "Thu" : "Chi"}`;
      const created = await createPage(DS(), {
        [P.title]: { title: title(label) },
        [P.type]: { select: { name: t.type === "thu" ? "Thu" : "Chi" } },
        [P.amount]: { number: t.amount },
        [P.category]: { rich_text: rich(t.category) },
        [P.account]: { select: { name: t.account } },
        [P.note]: { rich_text: rich(t.note || "") },
        [P.date]: { date: { start: t.date } },
      });
      return json(res, 200, { id: created.id, ...t });
    }
    if (req.method === "DELETE") { await archivePage(qs(req, "id")); return json(res, 200, { ok: true }); }
    json(res, 405, { error: "method" });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
