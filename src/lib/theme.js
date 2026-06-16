// ============ HỆ DESIGN TOKEN — "Nông Lịch Số" ============
// Bản sắc nông nghiệp ĐBSCL: xanh lúa + vàng hạt chín + nâu đất.
export const T = {
  // nền & mặt phẳng
  canvas: "#ECF1E6", canvasDeep: "#E2E9D9",
  surface: "#FFFFFF", surfaceAlt: "#F3F6EE", surfaceSink: "#EAEFE2",
  // xanh lúa (chủ đạo)
  ink: "#1B5235", inkDeep: "#0F3A24", inkSoft: "#DBE8DF",
  leaf: "#3E8E5A", leafSoft: "#E3F1E6",
  // vàng hạt (nhấn)
  grain: "#C79A2C", grainDeep: "#A87E1C", grainSoft: "#F4E9CA",
  // nâu đất (phụ)
  soil: "#6A523E", soilSoft: "#EFE7DD",
  // chữ
  text: "#1C271F", muted: "#69776C", faint: "#9AA79C",
  // đường viền
  line: "#E1E6D7", lineSoft: "#ECEFE3",
  // cảm xúc
  danger: "#B5432B", dangerSoft: "#F4DED7", success: "#2E8B57",
  // đổ bóng (ám xanh, mềm)
  shadowSm: "0 1px 2px rgba(16,58,36,.05), 0 3px 10px rgba(16,58,36,.05)",
  shadow: "0 10px 30px rgba(16,58,36,.12)",
  shadowLg: "0 18px 48px rgba(16,58,36,.16)",
};

// bo góc & nhịp
export const R = { card: 20, ctrl: 13, chip: 10, pill: 999 };

// font: Lora = "tiếng nói" (lời chào, câu trích, nông lịch) · Be Vietnam Pro = giao diện/số liệu
export const FONT = `"Be Vietnam Pro","Segoe UI",system-ui,-apple-system,Arial,sans-serif`;
export const SERIF = `"Lora",Georgia,"Times New Roman",serif`;

export const fmt = (n) => (isNaN(n) ? "0" : Math.round(n).toLocaleString("vi-VN"));
export const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
export const DESKTOP = 900; // ngưỡng chuyển bố cục
