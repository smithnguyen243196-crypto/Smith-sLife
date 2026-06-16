// Ghi Chú — lưu cả danh sách trong Upstash để đồng bộ desktop/mobile tức thì.
import { kvGet, kvSet } from "./_kv.js";
import { json, readBody } from "./_notion.js";
const KEY = "notes:list";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") return json(res, 200, (await kvGet(KEY)) || []);
    if (req.method === "POST") {
      const { notes } = await readBody(req);
      await kvSet(KEY, Array.isArray(notes) ? notes : []);
      return json(res, 200, { ok: true });
    }
    json(res, 405, { error: "method" });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
