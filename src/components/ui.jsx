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
// Ô số có 2 mũi tên tăng/giảm
export function Stepper({ value, onChange, min = 0 }) {
  const v = parseInt(value) || 0;
  const set = (n) => onChange(String(Math.max(min, n)));
  const btn = { width: 34, height: 38, border: "none", background: T.surfaceAlt, color: T.primary, fontSize: 18, fontWeight: 800, cursor: "pointer", fontFamily: FONT };
  return (
    <div style={{ display: "flex", alignItems: "stretch", border: `1.5px solid ${T.border}`, borderRadius: 12, overflow: "hidden", background: T.surfaceAlt }}>
      <button onClick={() => set(v - 1)} style={{ ...btn, borderRight: `1px solid ${T.border}` }}>−</button>
      <input inputMode="numeric" value={value} placeholder="0" onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))} style={{ width: 44, textAlign: "center", border: "none", background: "transparent", fontSize: 15, fontWeight: 700, fontFamily: FONT, outline: "none", color: T.text }} />
      <button onClick={() => set(v + 1)} style={{ ...btn, borderLeft: `1px solid ${T.border}` }}>+</button>
    </div>
  );
}
export function SuggestChips({ items, onPick, active }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
      {items.map((it) => (<button key={it} onClick={() => onPick(it)} style={{ padding: "6px 12px", borderRadius: 999, border: `1px solid ${active === it ? T.accent : T.border}`, background: active === it ? T.accentSoft : T.surfaceAlt, color: T.soil, cursor: "pointer", fontFamily: FONT, fontWeight: 600, fontSize: 13 }}>{it}</button>))}
    </div>
  );
}

// QuoteBar: mặc định chỉ hiện câu nói + người nói. tone "nlp" -> nền vàng đất + nhãn nhỏ.
export function QuoteBar({ quote, tone = "ceo", label }) {
  if (!quote) return null;
  const bg = tone === "nlp"
    ? `linear-gradient(135deg, ${T.soil}, #7a6149)`
    : `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`;
  const accent = tone === "nlp" ? "#F0D79B" : T.accent;
  return (
    <div style={{ background: bg, color: "#fff", borderRadius: 18, padding: "16px 18px", boxShadow: T.shadow, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -22, right: 8, fontSize: 96, opacity: .12, fontWeight: 900, lineHeight: 1 }}>”</div>
      {label && <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: accent, marginBottom: 6 }}>{label}</div>}
      <div style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.5, fontStyle: "italic" }}>"{quote.text}"</div>
      <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 700, color: accent }}>— {quote.author}</div>
    </div>
  );
}

// Mặt trời mọc/lặn — thiết kế lại đẹp hơn (tia nắng, quầng sáng, đồi, mây).
export function SunArc({ pct, caption = "đã hoàn thành" }) {
  const w = 300, h = 150, cx = w / 2, cy = h - 24, r = 116;
  const a = Math.PI * (1 - Math.min(100, Math.max(0, pct)) / 100);
  const sx = cx + r * Math.cos(a), sy = cy - r * Math.sin(a);
  const dawn = pct < 40, noon = pct >= 40 && pct < 80;
  const sky = dawn ? ["#fde4c0", "#f9cf9b"] : noon ? ["#bfe3ff", "#dff0ff"] : ["#ffd49a", "#f6b46b"];
  const sun = dawn ? "#FF9E45" : noon ? "#FFC93C" : "#FF8A3D";
  const rays = Array.from({ length: 12 });
  return (
    <div style={{ borderRadius: 18, overflow: "hidden", position: "relative", boxShadow: T.shadowSm, border: `1px solid ${T.border}` }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sky[0]} /><stop offset="100%" stopColor={sky[1]} /></linearGradient>
          <radialGradient id="sung" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FFF3C4" /><stop offset="60%" stopColor={sun} /><stop offset="100%" stopColor={sun} /></radialGradient>
          <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2E7D4F" /><stop offset="100%" stopColor="#1E5C3A" /></linearGradient>
        </defs>
        <rect width={w} height={h} fill="url(#sky)" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(0,0,0,.10)" strokeWidth="2" strokeDasharray="4 7" />
        {/* mây nhẹ */}
        <g fill="rgba(255,255,255,.55)"><ellipse cx="60" cy="42" rx="26" ry="9" /><ellipse cx="80" cy="38" rx="18" ry="8" /><ellipse cx="238" cy="30" rx="22" ry="8" /></g>
        {/* tia nắng */}
        <g stroke={sun} strokeWidth="2.2" strokeLinecap="round" opacity={dawn ? .5 : noon ? .85 : .6}>
          {rays.map((_, i) => { const ang = (i / rays.length) * Math.PI * 2; const r1 = 20, r2 = 27; return (<line key={i} x1={sx + r1 * Math.cos(ang)} y1={sy + r1 * Math.sin(ang)} x2={sx + r2 * Math.cos(ang)} y2={sy + r2 * Math.sin(ang)} />); })}
        </g>
        <circle cx={sx} cy={sy} r="30" fill={sun} opacity=".18" />
        <circle cx={sx} cy={sy} r="16" fill="url(#sung)" stroke="#fff" strokeWidth="1.5" opacity=".95" />
        {/* đồi */}
        <path d={`M0 ${cy} Q ${w * .25} ${cy - 16} ${w * .5} ${cy} T ${w} ${cy} V ${h} H0 Z`} fill="url(#hill)" />
        <path d={`M0 ${cy + 6} Q ${w * .3} ${cy - 4} ${w * .6} ${cy + 8} T ${w} ${cy + 4} V ${h} H0 Z`} fill="rgba(20,73,45,.55)" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 12, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#14492D", textShadow: "0 1px 0 rgba(255,255,255,.4)" }}>{Math.round(pct)}%</div>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "#3a5a45" }}>{caption}</div>
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
