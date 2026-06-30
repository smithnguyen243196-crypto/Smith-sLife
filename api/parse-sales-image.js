// Đọc ảnh báo cáo doanh số (chụp màn hình) và trích số lượng bán theo từng người bán
// bằng Claude Vision API. Body: { image: "data:image/png;base64,..." }
// Trả về: { sellers: [{ name, sl }] } — "name" là tên thô đọc được từ ảnh, FE tự khớp với SALES_STAFF.
import { json, readBody } from "./_notion.js";

const API_KEY = () => process.env.ANTHROPIC_API_KEY;

const PROMPT = `Đây là ảnh chụp bảng báo cáo doanh số bán hàng, mỗi dòng là 1 người bán.
Tên người bán nằm ở cột đầu tiên (có thể kèm số điện thoại, ví dụ "Minh Trí - 0919 502 562" -> chỉ lấy "Minh Trí").
Cột "SL" (số lượng) là cột số nguyên ngay sau tên, thể hiện số lượng sản phẩm đã bán của người đó.
Bỏ qua dòng tổng hợp đầu bảng (vd "SL người bán: 4").
Trả lời CHỈ một JSON object hợp lệ, không kèm giải thích, đúng định dạng:
{"sellers":[{"name":"Tên người bán","sl":123}]}`;

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return json(res, 405, { error: "method" });
    if (!API_KEY()) return json(res, 500, { error: "Chưa cấu hình ANTHROPIC_API_KEY trên server" });

    const { image } = await readBody(req);
    if (!image || typeof image !== "string") return json(res, 400, { error: "missing image" });
    const m = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!m) return json(res, 400, { error: "invalid image data url" });
    const [, mediaType, data] = m;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": API_KEY(), "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data } },
            { type: "text", text: PROMPT },
          ],
        }],
      }),
    });
    const out = await r.json();
    if (!r.ok) return json(res, 502, { error: out.error?.message || "Anthropic API lỗi" });

    const text = (out.content || []).map((b) => b.text || "").join("");
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    let parsed;
    try { parsed = JSON.parse(cleaned); } catch { return json(res, 502, { error: "Không đọc được JSON từ phản hồi AI", raw: text }); }

    return json(res, 200, { sellers: Array.isArray(parsed.sellers) ? parsed.sellers : [] });
  } catch (e) { json(res, 500, { error: String(e.message || e) }); }
}
