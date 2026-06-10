// api/quote.js — Câu nói hay của ngày
// Đọc database "📌 Câu Nói Hay (CEO & Tỷ Phú)" trong Notion (nằm dưới trang Smith's life),
// chọn một câu theo số thứ tự ngày (giờ Việt Nam) — mỗi ngày một câu, xoay vòng hết danh sách.
// Dùng chung NOTION_TOKEN với app Ngày (cùng được chia sẻ qua trang Smith's life).

const DB_ID = "197b284e-457d-44fb-ac29-ded0c1e8bd0b";

export default async function handler(req, res) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Server thiếu biến môi trường NOTION_TOKEN" });
  }

  try {
    // Lấy toàn bộ câu nói (phân trang 100/lần)
    let results = [];
    let cursor;
    do {
      const body = {
        page_size: 100,
        sorts: [{ timestamp: "created_time", direction: "ascending" }],
      };
      if (cursor) body.start_cursor = cursor;

      const r = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) {
        return res.status(r.status).json({ error: data.message || "Notion báo lỗi", detail: data });
      }
      results = results.concat(data.results || []);
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    if (!results.length) {
      return res.status(200).json({ text: null });
    }

    // Số thứ tự ngày theo giờ Việt Nam (UTC+7) → mỗi ngày một câu, cố định trong ngày
    const dayVN = Math.floor((Date.now() + 7 * 3600 * 1000) / 86400000);
    const page = results[dayVN % results.length];
    const p = page.properties || {};

    const plain = (arr) => (arr || []).map((t) => t.plain_text).join("");
    const goc = plain(p["Câu gốc"]?.title);
    const vi = plain(p["Bản dịch (TV)"]?.rich_text);
    const author = p["Người"]?.select?.name || "";

    // Cache ở CDN 1 giờ để không gọi Notion mỗi lượt mở trang
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({
      text: vi || goc, // ưu tiên bản dịch tiếng Việt, không có thì dùng câu gốc
      original: goc,
      author,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Lỗi không xác định" });
  }
}
