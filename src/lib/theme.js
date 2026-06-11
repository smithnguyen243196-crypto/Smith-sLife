export const T = {
  bg: "#EBF0E8", bgDeep: "#E1E8DC", surface: "#FFFFFF", surfaceAlt: "#F5F8F2",
  primary: "#1E5C3A", primaryDark: "#14492D", primarySoft: "#DCEBE0",
  accent: "#C99A2E", accentSoft: "#F4E9CC", soil: "#5B4636",
  text: "#1F2A22", textMute: "#6B7A6E", border: "#DDE4D6",
  danger: "#B5432B", dangerSoft: "#F6E1DB", success: "#2E8B57",
  shadow: "0 8px 28px rgba(30,92,58,.10)", shadowSm: "0 2px 10px rgba(30,92,58,.08)",
};
export const FONT = `"Be Vietnam Pro","Segoe UI",system-ui,-apple-system,Arial,sans-serif`;
export const fmt = (n) => (isNaN(n) ? "0" : Math.round(n).toLocaleString("vi-VN"));
export const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
