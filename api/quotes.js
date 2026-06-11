import { queryDS, txt, json } from "./_notion.js";
// GET /api/quotes — 📌 Câu Nói Hay, lọc Độ tin = "Cao".
export default async function handler(req, res) {
  try {
    const data = await queryDS(process.env.DS_QUOTES, {
      filter: { property: "Độ tin", select: { equals: "Cao" } }, page_size: 100,
    });
    const quotes = data.results.map((p) => {
      const pr = p.properties;
      return { text: txt(pr["Bản dịch (TV)"]?.rich_text) || txt(pr["Câu gốc"]?.title), author: pr["Người"]?.select?.name || txt(pr["Nguồn"]?.rich_text) || "Khuyết danh" };
    }).filter((q) => q.text);
    json(res, 200, quotes);
  } catch (e) { json(res, 200, []); }
}
