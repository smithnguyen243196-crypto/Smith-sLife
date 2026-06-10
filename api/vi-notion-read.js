// api/vi-notion-read.js — Đọc giao dịch Ví Cá Nhân từ Notion (cấu hình server-first)
import { viConfig } from "./vi-notion.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Chỉ chấp nhận POST" });

  const { token, dbId } = viConfig(req.body);
  if (!token) return res.status(500).json({ error: "Server thiếu VI_NOTION_TOKEN/NOTION_TOKEN" });
  if (!dbId) return res.status(500).json({ error: "Server thiếu VI_DB_ID (Database ID của database thu chi)" });

  try {
    // Đọc toàn bộ, phân trang 100/lần
    let results = [];
    let cursor;
    do {
      const body = {
        sorts: [{ property: "Ngày", direction: "descending" }],
        page_size: 100,
      };
      if (cursor) body.start_cursor = cursor;
      const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data.message || "Lỗi Notion" });
      results = results.concat(data.results || []);
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    const txns = results.map((page) => {
      const p = page.properties || {};
      return {
        id: page.id,
        notionId: page.id,
        type: p["Loại"]?.select?.name === "Thu" ? "income" : "expense",
        wallet: p["Ví"]?.select?.name === "Tiền mặt" ? "cash" : "bank",
        amount: p["Số tiền"]?.number || 0,
        category: p["Danh mục"]?.rich_text?.[0]?.plain_text || "",
        person: p["Người"]?.rich_text?.[0]?.plain_text || "",
        note: p["Name"]?.title?.[0]?.plain_text || "",
        date: p["Ngày"]?.date?.start || "",
        synced: true,
        syncing: false,
      };
    });

    return res.status(200).json({ txns });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
