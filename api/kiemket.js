import { createPage, title, rich, json, readBody } from "./_notion.js";
import { kvGet, kvSet } from "./_kv.js";
const KEY = "kiemket:current";
const DS = () => process.env.DS_KIEMKET;

export default async function handler(req, res) {
  try {
    if (req.method === "GET") return json(res, 200, await kvGet(KEY));
    if (req.method === "POST") {
      const body = await readBody(req);
      const { commit, summary, ...state } = body;
      await kvSet(KEY, state); // luôn đồng bộ desktop/mobile

      if (commit && DS()) {
        const s = summary || {};
        const kq = s.ketQua ?? 0;
        const chiList = (state.entries || []).filter((e) => e.type === "chi").map((e) => `- ${e.reason || "Chi"}: ${Number(e.amount).toLocaleString("vi-VN")}đ${e.person ? ` (${e.person})` : ""}`).join("\n");
        await createPage(DS(), {
          "Tên": { title: title(`Kiểm két ${state.startDate} → ${state.endDate}`) },
          "Tổng tiền trong két": { number: s.tongKet ?? 0 },
          "Tổng thu chi": { number: s.netThuChi ?? 0 },
          "Két và thu chi": { number: s.tongKetVaThuChi ?? 0 },
          "Tiền báo cáo": { number: Number(state.kiotviet) || 0 },
          "Kết quả": { number: kq },
          "Trạng thái": { select: { name: kq === 0 ? "Khớp" : kq > 0 ? "Thừa" : "Thiếu" } },
          "Danh sách chi": { rich_text: rich(chiList) },
          "Ngày bắt đầu": { date: { start: state.startDate } },
          "Ngày tính két": { date: { start: state.endDate } },
        });
      }
      return json(res, 200, { ok: true });
    }
    json(res, 405, { error: "method" });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
