// Truy cập nhanh — cấu hình KiotViet (retailer) + danh sách liên kết, lưu Upstash.
import { kvGet, kvSet } from "./_kv.js";
import { json, readBody } from "./_notion.js";
const KEY = "links:config";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") return json(res, 200, (await kvGet(KEY)) || null);
    if (req.method === "POST") {
      const body = await readBody(req);
      const cfg = { retailer: body.retailer || "", items: Array.isArray(body.items) ? body.items : [] };
      await kvSet(KEY, cfg);
      return json(res, 200, { ok: true });
    }
    json(res, 405, { error: "method" });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
