import { queryDS, json, readBody } from "./_notion.js";
const DS = () => process.env.DS_NGAY;
const DATE = "Ngày";
const dstr = (d) => d.toISOString().slice(0, 10);

// Đếm chuỗi "perfect day": ngày hoàn thành >= 80% số thói quen.
// Body: { habits: [tên thói quen], today: "YYYY-MM-DD" }
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return json(res, 405, { error: "method" });
    const { habits = [], today } = await readBody(req);
    const total = habits.length;
    if (!total) return json(res, 200, { streak: 0, todayPerfect: false });

    const data = await queryDS(DS(), {
      filter: { property: DATE, date: { on_or_before: today } },
      sorts: [{ property: DATE, direction: "descending" }],
      page_size: 80,
    });

    // map ngày -> có phải perfect không
    const perfect = {};
    for (const p of data.results) {
      const day = p.properties[DATE]?.date?.start;
      if (!day) continue;
      let done = 0;
      for (const h of habits) if (p.properties[h]?.checkbox) done++;
      perfect[day] = done / total >= 0.8;
    }
    const isP = (k) => perfect[k] === true;

    // đếm chuỗi liên tục lùi từ hôm nay (nếu hôm nay chưa perfect thì tính từ hôm qua, không phá chuỗi)
    const cur = new Date(today + "T00:00:00Z");
    const todayPerfect = isP(today);
    if (!todayPerfect) cur.setUTCDate(cur.getUTCDate() - 1);
    let streak = 0;
    while (streak <= 366) {
      if (isP(dstr(cur))) { streak++; cur.setUTCDate(cur.getUTCDate() - 1); }
      else break;
    }
    return json(res, 200, { streak, todayPerfect });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
