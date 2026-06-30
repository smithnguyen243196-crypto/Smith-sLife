// Doanh Số nhân viên — lưu trong Notion (database "Doanh Số"), mỗi trang = 1 nhân viên / 1 ngày.
import { queryDS, createPage, updatePage, archivePage, title, json, readBody, qs } from "./_notion.js";
const DS = () => process.env.DS_DOANHSO;
const P = { title: "Tên", date: "Ngày", staff: "Nhân viên", cc: "Sản phẩm CC", ss: "Sản phẩm SS", total: "Tổng Sản phẩm" };

async function findRecord(date, staff) {
  const d = await queryDS(DS(), { filter: { and: [{ property: P.date, date: { equals: date } }, { property: P.staff, select: { equals: staff } }] }, page_size: 1 });
  return d.results[0] || null;
}

export default async function handler(req, res) {
  try {
    if (!DS()) return json(res, 200, []);

    if (req.method === "GET") {
      const data = await queryDS(DS(), { sorts: [{ property: P.date, direction: "descending" }], page_size: 200 });
      const records = data.results.map((p) => {
        const pr = p.properties;
        return {
          id: p.id,
          date: pr[P.date]?.date?.start || "",
          staff: pr[P.staff]?.select?.name || "",
          cc: pr[P.cc]?.number || 0,
          ss: pr[P.ss]?.number || 0,
          total: pr[P.total]?.number || 0,
        };
      });
      return json(res, 200, records);
    }

    if (req.method === "POST") {
      const r = await readBody(req);
      if (!r.date || !r.staff) return json(res, 400, { error: "missing date/staff" });
      const cc = Number(r.cc) || 0, ss = Number(r.ss) || 0;
      const total = r.total !== "" && r.total != null ? Number(r.total) || 0 : cc + ss;
      const props = {
        [P.date]: { date: { start: r.date } },
        [P.staff]: { select: { name: r.staff } },
        [P.cc]: { number: cc },
        [P.ss]: { number: ss },
        [P.total]: { number: total },
      };
      const existing = await findRecord(r.date, r.staff);
      let page;
      if (existing) { await updatePage(existing.id, props); page = existing; }
      else { page = await createPage(DS(), { ...props, [P.title]: { title: title(`${r.date} · ${r.staff}`) } }); }
      return json(res, 200, { id: page.id, date: r.date, staff: r.staff, cc, ss, total });
    }

    if (req.method === "DELETE") { await archivePage(qs(req, "id")); return json(res, 200, { ok: true }); }

    json(res, 405, { error: "method" });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
