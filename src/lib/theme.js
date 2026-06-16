// ============ HỆ DESIGN TOKEN — "Nông Lịch Số" (hỗ trợ sáng/tối) ============
// Giá trị thật của token định nghĩa trong index.html (:root = sáng, [data-theme=dark] = tối).
export const T = {
  canvas: "var(--canvas)", canvasDeep: "var(--canvasDeep)",
  surface: "var(--surface)", surfaceAlt: "var(--surfaceAlt)", surfaceSink: "var(--surfaceSink)",
  ink: "var(--ink)", inkDeep: "var(--inkDeep)", inkSoft: "var(--inkSoft)",
  leaf: "var(--leaf)", leafSoft: "var(--leafSoft)",
  grain: "var(--grain)", grainDeep: "var(--grainDeep)", grainSoft: "var(--grainSoft)",
  soil: "var(--soil)", soilSoft: "var(--soilSoft)",
  text: "var(--text)", muted: "var(--muted)", faint: "var(--faint)",
  line: "var(--line)", lineSoft: "var(--lineSoft)",
  danger: "var(--danger)", dangerSoft: "var(--dangerSoft)", success: "var(--success)",
  // token phụ trợ theme
  onInk: "var(--onInk)", accentOnInk: "var(--accentOnInk)", barBg: "var(--barBg)",
  // đổ bóng
  shadowSm: "var(--shadowSm)", shadow: "var(--shadow)", shadowLg: "var(--shadowLg)",
};

// bo góc & nhịp
export const R = { card: 20, ctrl: 13, chip: 10, pill: 999 };

// font: Lora = "tiếng nói" (câu trích, nông lịch) · Be Vietnam Pro = giao diện/số liệu
export const FONT = `"Be Vietnam Pro","Segoe UI",system-ui,-apple-system,Arial,sans-serif`;
export const SERIF = `"Lora",Georgia,"Times New Roman",serif`;

export const fmt = (n) => (isNaN(n) ? "0" : Math.round(n).toLocaleString("vi-VN"));
export const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
export const DESKTOP = 900; // ngưỡng chuyển bố cục
