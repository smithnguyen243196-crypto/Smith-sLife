// Doanh Số nhân viên — lưu trong Upstash, mỗi bản ghi = 1 nhân viên / 1 ngày.
import { kvGet, kvSet } from "./_kv.js";
import { json, readBody, qs } from "./_notion.js";
const KEY = "doanhso:list";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") return json(res, 200, (await kvGet(KEY)) || []);

    if (req.method === "POST") {
      const r = await readBody(req);
      if (!r.date || !r.staff) return json(res, 400, { error: "missing date/staff" });
      const list = (await kvGet(KEY)) || [];
      const cc = Number(r.cc) || 0, ss = Number(r.ss) || 0;
      const total = r.total !== "" && r.total != null ? Number(r.total) || 0 : cc + ss;
      const idx = list.findIndex((x) => x.date === r.date && x.staff === r.staff);
      const rec = { id: idx >= 0 ? list[idx].id : (r.id || Date.now()), date: r.date, staff: r.staff, cc, ss, total };
      if (idx >= 0) list[idx] = rec; else list.push(rec);
      await kvSet(KEY, list);
      return json(res, 200, rec);
    }

    if (req.method === "DELETE") {
      const id = qs(req, "id");
      const list = (await kvGet(KEY)) || [];
      await kvSet(KEY, list.filter((x) => String(x.id) !== String(id)));
      return json(res, 200, { ok: true });
    }

    json(res, 405, { error: "method" });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
