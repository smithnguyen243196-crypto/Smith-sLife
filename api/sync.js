// api/sync.js — Đồng bộ dữ liệu giữa các thiết bị qua Upstash Redis
//
// Hỗ trợ nhiều "ngăn" dữ liệu qua tham số ?key=
//   - kiemket  (mặc định): phiên nháp đếm két   → khóa "kiemket:draft"
//   - tinhlai             : lịch sử tính lãi     → khóa "tinhlai:history"
//
// GET  /api/sync?key=...   → đọc dữ liệu
// POST /api/sync?key=...   → ghi dữ liệu (body JSON)
//
// Hỗ trợ cả 2 kiểu tên biến môi trường:
//   - Vercel Marketplace (Upstash): KV_REST_API_URL, KV_REST_API_TOKEN
//   - Upstash trực tiếp:            UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

import { Redis } from "@upstash/redis";

const STORES = {
  kiemket: "kiemket:draft",
  tinhlai: "tinhlai:history",
};

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    const name = (req.query && req.query.key) || "kiemket";
    const KEY = STORES[name];
    if (!KEY) return res.status(400).json({ error: "key không hợp lệ" });

    if (req.method === "GET") {
      const data = await redis.get(KEY); // SDK tự parse JSON
      // Giữ tương thích ngược với app Kiểm Két cũ: trả về field "draft"
      return res.status(200).json({ ok: true, draft: data || null, data: data || null });
    }

    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

      if (name === "kiemket") {
        const draft = {
          bills: b.bills || {},
          slips: Array.isArray(b.slips) ? b.slips : [],
          reported: b.reported ?? "",
          startDate: b.startDate || "",
          countDate: b.countDate || "",
          updatedAt: Date.now(),
        };
        await redis.set(KEY, draft);
        return res.status(200).json({ ok: true, updatedAt: draft.updatedAt });
      }

      if (name === "tinhlai") {
        const data = {
          items: Array.isArray(b.items) ? b.items.slice(0, 50) : [],
          updatedAt: Date.now(),
        };
        await redis.set(KEY, data);
        return res.status(200).json({ ok: true, updatedAt: data.updatedAt });
      }
    }

    return res.status(405).json({ error: "Chỉ chấp nhận GET hoặc POST" });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Lỗi không xác định" });
  }
}
