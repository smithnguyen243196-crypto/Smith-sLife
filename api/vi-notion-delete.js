// api/vi-notion-delete.js — Xoá (archive) giao dịch Ví Cá Nhân (cấu hình server-first)
import { viConfig } from "./vi-notion.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Chỉ chấp nhận POST" });

  const { token, body } = viConfig(req.body);
  const pageId = body.pageId;
  if (!token) return res.status(500).json({ error: "Server thiếu VI_NOTION_TOKEN/NOTION_TOKEN" });
  if (!pageId) return res.status(400).json({ error: "Thiếu pageId" });

  try {
    const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ archived: true }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.message });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
