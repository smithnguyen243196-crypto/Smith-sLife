import React from "react";
// Bộ icon line tự thiết kế, đồng bộ nét 1.7, theo currentColor.
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
export function Icon({ name, size = 24, ...p }) {
  const paths = {
    // Nhiệm Vụ — bảng ghi + tick
    tasks: (<><rect x="5" y="3.5" width="14" height="17" rx="2.5" /><path d="M9 3.5h6v2.2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" /><path d="M8.6 12.2l1.6 1.6 3-3.2" /><path d="M8.5 17h7" /></>),
    // Kiểm Két — ngăn kéo tiền
    kiemket: (<><rect x="3.5" y="9.5" width="17" height="9" rx="2" /><path d="M5.5 9.5l1.6-3.4a2 2 0 0 1 1.8-1.1h6.2a2 2 0 0 1 1.8 1.1l1.6 3.4" /><path d="M10 13.5h4" /></>),
    // Tính Lãi — đường tăng + %
    tinhlai: (<><path d="M4 16.5l4-4 3 2.4 5-5.4" /><path d="M14 9.5h2.5V12" /><circle cx="7" cy="19" r="0.6" fill="currentColor" stroke="none" /><circle cx="17" cy="19" r="0.6" fill="currentColor" stroke="none" /></>),
    // Ví
    vi: (<><rect x="3.5" y="6" width="17" height="13" rx="2.5" /><path d="M3.5 10h17" /><circle cx="16.5" cy="14" r="1.1" /></>),
    // Ghi Chú — trang giấy + dòng + góc gập
    notes: (<><path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" /><path d="M14 3.5V8h4" /><path d="M8.5 12.5h7M8.5 16h5" /></>),
    // Home — mầm/lá vươn lên
    home: (<><path d="M12 21v-7" /><path d="M12 14c0-3 2-5 5-5 0 3-2 5-5 5z" /><path d="M12 16c0-2.6-1.8-4.5-4.5-4.5 0 2.6 1.8 4.5 4.5 4.5z" /></>),
    // Mặt trời (FAB)
    sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" /></>),
    // Mở liên kết ngoài
    external: (<><path d="M14 4h6v6" /><path d="M20 4l-8.5 8.5" /><path d="M19 13.5V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.5" /></>),
    plus: (<><path d="M12 5v14M5 12h14" /></>),
    pin: (<><path d="M9 4h6l-1 6 3 2.5H7L10 10z" /><path d="M12 12.5V20" /></>),
    edit: (<><path d="M4 20h4l10-10-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>),
    trash: (<><path d="M5 7h14" /><path d="M9 7V5h6v2" /><path d="M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" /><path d="M10 11v6M14 11v6" /></>),
    check: (<><path d="M5 12.5l4.2 4.2L19 7" /></>),
    chevron: (<><path d="M6 9l6 6 6-6" /></>),
    cog: (<><circle cx="12" cy="12" r="3" /><path d="M12 2.5l1.3 2.2 2.5-.5.3 2.5 2.2 1.2-1 2.4 1 2.4-2.2 1.2-.3 2.5-2.5-.5L12 21.5l-1.3-2.2-2.5.5-.3-2.5-2.2-1.2 1-2.4-1-2.4 2.2-1.2.3-2.5 2.5.5z" /></>),
    moon: (<><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></>),
    dawn: (<><path d="M3 18h18" /><path d="M7.5 18a4.5 4.5 0 0 1 9 0" /><path d="M12 6.5V4M5.5 9l-1.4-1.4M18.5 9l1.4-1.4M3 13.5h2M19 13.5h2" /></>),
  }[name];
  return (<svg viewBox="0 0 24 24" width={size} height={size} {...S} {...p}>{paths}</svg>);
}
