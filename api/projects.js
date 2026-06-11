import { queryDS, txt, json } from "./_notion.js";
// GET /api/projects -> [{id, name}] từ data source Dự Án (Trạng Thái = Hoạt Động)
const DS = () => process.env.DS_DUAN;
export default async function handler(req, res) {
  try {
    if (!DS()) return json(res, 200, []);
    const data = await queryDS(DS(), {
      filter: { property: "Trạng Thái", select: { equals: "Hoạt Động" } },
      page_size: 100,
    });
    json(res, 200, data.results.map((p) => ({ id: p.id, name: txt(p.properties["Dự Án"]?.title) })).filter((x) => x.name));
  } catch (e) { json(res, 200, []); }
}
