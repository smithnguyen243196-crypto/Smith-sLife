import React from "react";
// Bộ icon line tự thiết kế, đồng bộ nét 1.8, theo currentColor.
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
export function Icon({ name, size = 24, ...p }) {
  const paths = {
    // Nhiệm Vụ — bảng ghi + dấu tick
    tasks: (<><rect x="5" y="3.5" width="14" height="17" rx="2.5" /><path d="M9 3.5h6v2.2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" /><path d="M8.6 12.2l1.6 1.6 3-3.2" /><path d="M8.5 17h7" /></>),
    // Kiểm Két — ngăn kéo tiền
    kiemket: (<><rect x="3.5" y="9.5" width="17" height="9" rx="2" /><path d="M5.5 9.5l1.6-3.4a2 2 0 0 1 1.8-1.1h6.2a2 2 0 0 1 1.8 1.1l1.6 3.4" /><path d="M10 13.5h4" /></>),
    // Tính Lãi — đường tăng + %
    tinhlai: (<><path d="M4 16.5l4-4 3 2.4 5-5.4" /><path d="M14 9.5h2.5V12" /><circle cx="7" cy="19" r="0.6" fill="currentColor" stroke="none" /><circle cx="17" cy="19" r="0.6" fill="currentColor" stroke="none" /></>),
    // Ví
    vi: (<><rect x="3.5" y="6" width="17" height="13" rx="2.5" /><path d="M3.5 10h17" /><circle cx="16.5" cy="14" r="1.1" /></>),
    // Home — mái nhà
    home: (<><path d="M4 11l8-6.5L20 11" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></>),
  }[name];
  return (<svg viewBox="0 0 24 24" width={size} height={size} {...S} {...p}>{paths}</svg>);
}
