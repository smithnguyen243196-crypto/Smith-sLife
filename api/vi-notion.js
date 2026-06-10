// api/vi-notion.js — Ghi giao dịch Ví Cá Nhân vào Notion
// ĐỒNG BỘ MỌI THIẾT BỊ: token và Database ID ưu tiên lấy từ biến môi trường trên server
//   - VI_NOTION_TOKEN (nếu không có thì dùng NOTION_TOKEN)
//   - VI_DB_ID        (Database ID của database thu chi)
// Nếu client gửi kèm token/dbId (cấu hình cũ trong máy) thì vẫn chấp nhận để tương thích ngược.

export function viConfig(body) {
  const b = typeof body === "string" ? JSON.parse(body || "{}") : body || {};
  const token = b.token || process.env.VI_NOTION_TOKEN || process.env.NOTION_TOKEN || "";
  const dbId = b.dbId || process.env.VI_DB_ID || "";
  return { token, dbId, body: b };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Chỉ chấp nhận POST" });

  const { token, dbId, body } = viConfig(req.body);
  const payload = body.payload;
  if (!token) return res.status(500).json({ error: "Server thiếu VI_NOTION_TOKEN/NOTION_TOKEN" });
  if (!dbId) return res.status(500).json({ error: "Server thiếu VI_DB_ID (Database ID của database thu chi)" });
  if (!payload) return res.status(400).json({ error: "Thiếu payload" });

  try {
    const r = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parent: { database_id: dbId }, properties: payload }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.message || "Lỗi Notion", detail: data });
    return res.status(200).json({ success: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
