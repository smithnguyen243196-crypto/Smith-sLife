// Vercel Marketplace (Upstash) inject KV_REST_API_URL / KV_REST_API_TOKEN
// (KHÔNG phải UPSTASH_REDIS_REST_URL như trong docs Upstash). Hỗ trợ cả 2 tên cho chắc.
const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
async function cmd(args) {
  if (!URL || !TOKEN) throw new Error("Upstash chưa cấu hình (KV_REST_API_URL / KV_REST_API_TOKEN)");
  const r = await fetch(URL, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(args) });
  const d = await r.json();
  if (!r.ok) throw new Error(`Upstash ${r.status}: ${JSON.stringify(d)}`);
  return d.result;
}
export const kvGet = async (key) => { const v = await cmd(["GET", key]); return v ? JSON.parse(v) : null; };
export const kvSet = (key, val) => cmd(["SET", key, JSON.stringify(val)]);
