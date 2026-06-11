import React, { useState } from "react";
import { T, FONT } from "../lib/theme.js";

export const Card = ({ children, style, ...p }) => (
  <div {...p} style={{ background: T.surface, borderRadius: 18, boxShadow: T.shadowSm, border: `1px solid ${T.border}`, padding: 16, ...style }}>{children}</div>
);
export const SectionTitle = ({ children, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
    <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: T.primary }}>{children}</span>{right}
  </div>
);
export const Btn = ({ children, onClick, variant = "primary", style, disabled }) => {
  const s = { primary: { background: T.primary, color: "#fff" }, accent: { background: T.accent, color: "#3a2c06" }, ghost: { background: "transparent", color: T.primary, border: `1.5px solid ${T.border}` }, danger: { background: T.dangerSoft, color: T.danger } }[variant];
  return <button onClick={onClick} disabled={disabled} style={{ padding: "10px 14px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 14, cursor: disabled ? "default" : "pointer", opacity: disabled ? .55 : 1, fontFamily: FONT, ...s, ...style }}>{children}</button>;
};
export const inputStyle = { width: "100%", padding: "11px 12px", borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 15, fontFamily: FONT, outline: "none", background: T.surfaceAlt, color: T.text, boxSizing: "border-box" };

export function MoneyInput({ value, onChange, placeholder }) {
  const display = value ? Number(value).toLocaleString("vi-VN") : "";
  return (
    <div style={{ position: "relative" }}>
      <input inputMode="numeric" value={display} placeholder={placeholder} onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))} style={{ ...inputStyle, paddingRight: 30, fontWeight: 700 }} />
      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: T.textMute, fontWeight: 800, fontSize: 14 }}>đ</span>
    </div>
  );
}
export function SuggestChips({ items, onPick }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
      {items.map((it) => (<button key={it} onClick={() => onPick(it)} style={{ padding: "6px 12px", borderRadius: 999, border: `1px solid ${T.border}`, background: T.surfaceAlt, color: T.soil, cursor: "pointer", fontFamily: FONT, fontWeight: 600, fontSize: 13 }}>{it}</button>))}
    </div>
  );
}
export function QuoteBar({ quote }) {
  if (!quote) return null;
  return (
    <div style={{ background: `linear-gradient(135deg,${T.primaryDark},${T.primary})`, color: "#fff", borderRadius: 18, padding: "16px 18px", boxShadow: T.shadow, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -18, right: 6, fontSize: 90, opacity: .12, fontWeight: 900, lineHeight: 1 }}>”</div>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: T.accent, marginBottom: 6 }}>CÂU NÓI HAY · CEO &amp; TỶ PHÚ</div>
      <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.45, fontStyle: "italic" }}>"{quote.text}"</div>
      <div style={{ marginTop: 8, fontSize: 13, opacity: .85, fontWeight: 600 }}>— {quote.author}</div>
    </div>
  );
}
export function SunArc({ pct }) {
  const w = 280, h = 130, cx = w / 2, cy = h - 18, r = 108, a = Math.PI * (1 - pct / 100);
  const sx = cx + r * Math.cos(a), sy = cy - r * Math.sin(a);
  const sky = pct < 45 ? "linear-gradient(180deg,#fde8c4,#fbd9a3)" : pct < 80 ? "linear-gradient(180deg,#cfe8ff,#aed6f5)" : "linear-gradient(180deg,#ffd9a0,#f6b46b)";
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: sky, position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(0,0,0,.12)" strokeWidth="2" strokeDasharray="5 6" />
        <circle cx={sx} cy={sy} r="26" fill="#FFCF4D" opacity=".25" /><circle cx={sx} cy={sy} r="16" fill="#FFCF4D" stroke="#F2A93B" strokeWidth="2" />
        <rect x="0" y={cy} width={w} height={h - cy} fill="rgba(30,92,58,.18)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 8 }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: T.primaryDark }}>{Math.round(pct)}%</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.soil }}>nhiệm vụ hôm nay đã hoàn thành</div>
      </div>
    </div>
  );
}
export function Collapsible({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: FONT }}>
        <span style={{ fontWeight: 800, color: T.primary, fontSize: 14.5 }}>{title}</span>
        <span style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: ".2s", color: T.textMute }}>▾</span>
      </button>
      {open && <div style={{ padding: "0 16px 16px" }}>{children}</div>}
    </Card>
  );
}
