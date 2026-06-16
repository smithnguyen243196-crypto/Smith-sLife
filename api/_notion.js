// Gọi Notion REST API (bản 2025-09-03) qua DATA SOURCE — hỗ trợ cả database multi-source.
const TOKEN = process.env.NOTION_TOKEN;
const BASE = "https://api.notion.com/v1";
const H = () => ({ Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2025-09-03", "Content-Type": "application/json" });

async function call(path, method = "GET", body) {
  const r = await fetch(`${BASE}${path}`, { method, headers: H(), body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Notion ${r.status}: ${data.message || JSON.stringify(data)}`);
  return data;
}
// Truy vấn 1 data source
export const queryDS = (ds, body = {}) => call(`/data_sources/${ds}/query`, "POST", body);
// Lấy schema (properties) của data source
export const retrieveDS = (ds) => call(`/data_sources/${ds}`, "GET");
// Tạo page trong data source
export const createPage = (ds, properties) => call(`/pages`, "POST", { parent: { type: "data_source_id", data_source_id: ds }, properties });
// Cập nhật properties của page
export const updatePage = (id, properties) => call(`/pages/${id}`, "PATCH", { properties });
// Lưu trữ (xoá mềm) page
export const archivePage = (id) => call(`/pages/${id}`, "PATCH", { archived: true });
// Thêm khối nội dung vào page
export const appendChildren = (id, children) => call(`/blocks/${id}/children`, "PATCH", { children });

export const txt = (rich) => (rich || []).map((t) => t.plain_text).join("");
export const title = (s) => [{ type: "text", text: { content: s || "" } }];
export const rich = (s) => [{ type: "text", text: { content: s || "" } }];

export function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise((res) => { let s = ""; req.on("data", (c) => (s += c)); req.on("end", () => { try { res(JSON.parse(s || "{}")); } catch { res({}); } }); });
}
export function json(res, code, payload) { res.statusCode = code; res.setHeader("Content-Type", "application/json"); res.end(payload == null ? "" : JSON.stringify(payload)); }
export const qs = (req, key) => new URL(req.url, "http://x").searchParams.get(key);
