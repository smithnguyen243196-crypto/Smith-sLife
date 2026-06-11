import { queryDS, txt, json, qs } from "./_notion.js";
// GET /api/quotes            -> CEO & Tỷ Phú (Độ tin = Cao)
// GET /api/quotes?topic=NLP  -> lọc theo Chủ đề chứa "NLP" (vd "NLP Phát triển bản thân")
export default async function handler(req, res) {
  try {
    const topic = qs(req, "topic");
    const filter = topic
      ? { property: "Chủ đề", select: { equals: "NLP Phát triển bản thân" } }
      : { property: "Độ tin", select: { equals: "Cao" } };
    const data = await queryDS(process.env.DS_QUOTES, { filter, page_size: 100 });
    const quotes = data.results.map((p) => {
      const pr = p.properties;
      return { text: txt(pr["Bản dịch (TV)"]?.rich_text) || txt(pr["Câu gốc"]?.title), author: pr["Người"]?.select?.name || txt(pr["Nguồn"]?.rich_text) || "Khuyết danh" };
    }).filter((q) => q.text);
    json(res, 200, quotes);
  } catch (e) { json(res, 200, []); }
}
