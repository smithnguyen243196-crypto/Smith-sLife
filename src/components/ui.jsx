import React, { useState, useEffect } from "react";
import { T, R, FONT, SERIF } from "../lib/theme.js";
import { Icon } from "./icons.jsx";

/* ---------- Mặt phẳng ---------- */
export const Card = ({ children, style, hover, ...p }) => (
  <div {...p} className={hover ? "lift" : undefined}
    style={{ background: T.surface, borderRadius: R.card, boxShadow: T.shadowSm, border: `1px solid ${T.line}`, padding: 16, ...style }}>
    {children}
  </div>
);

export const Eyebrow = ({ children, color = T.grain, style }) => (
  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color, ...style }}>{children}</div>
);

export const SectionTitle = ({ children, right, icon }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12, minWidth: 0 }}>
    <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
      {icon && <span style={{ color: T.ink, display: "flex", flexShrink: 0 }}><Icon name={icon} size={17} /></span>}
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: T.ink }}>{children}</span>
    </span>
    {right && <span style={{ flexShrink: 0, whiteSpace: "nowrap" }}>{right}</span>}
  </div>
);

/* ---------- Nút ---------- */
export const Btn = ({ children, onClick, variant = "primary", style, disabled, full, type }) => {
  const s = {
    primary: { background: `linear-gradient(135deg, ${T.ink}, ${T.inkDeep})`, color: "#fff", boxShadow: "0 6px 16px rgba(16,58,36,.22)" },
    accent: { background: `linear-gradient(135deg, ${T.grain}, ${T.grainDeep})`, color: "#2c2105", boxShadow: "0 6px 16px rgba(167,126,28,.25)" },
    leaf: { background: T.leaf, color: "#fff" },
    ghost: { background: T.surface, color: T.ink, border: `1.5px solid ${T.line}` },
    soft: { background: T.inkSoft, color: T.inkDeep },
    danger: { background: T.dangerSoft, color: T.danger },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} type={type} className="press"
      style={{ padding: "11px 16px", borderRadius: R.ctrl, border: "none", fontWeight: 700, fontSize: 14.5, cursor: disabled ? "default" : "pointer", opacity: disabled ? .5 : 1, fontFamily: FONT, width: full ? "100%" : undefined, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, ...s, ...style }}>
      {children}
    </button>
  );
};

export const IconBtn = ({ icon, onClick, title, color = T.muted, size = 18, style }) => (
  <button onClick={onClick} title={title} aria-label={title} className="press"
    style={{ border: "none", background: "transparent", color, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 6, borderRadius: 9, ...style }}>
    <Icon name={icon} size={size} />
  </button>
);

/* ---------- Nhập liệu ---------- */
export const inputStyle = { width: "100%", minWidth: 0, maxWidth: "100%", padding: "12px 13px", borderRadius: R.ctrl, border: `1.5px solid ${T.line}`, fontSize: 15, fontFamily: FONT, outline: "none", background: T.surfaceAlt, color: T.text, boxSizing: "border-box", transition: "border-color .15s, background .15s" };

export const Field = ({ label, children, hint }) => (
  <label style={{ display: "block", minWidth: 0 }}>
    {label && <div style={{ fontSize: 12.5, color: T.muted, fontWeight: 700, marginBottom: 5 }}>{label}</div>}
    {children}
    {hint && <div style={{ fontSize: 11.5, color: T.faint, marginTop: 4 }}>{hint}</div>}
  </label>
);

export function MoneyInput({ value, onChange, placeholder }) {
  const display = value ? Number(value).toLocaleString("vi-VN") : "";
  return (
    <div style={{ position: "relative" }}>
      <input inputMode="numeric" value={display} placeholder={placeholder} onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))} style={{ ...inputStyle, paddingRight: 32, fontWeight: 800, fontSize: 16 }} />
      <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: T.muted, fontWeight: 800, fontSize: 14 }}>đ</span>
    </div>
  );
}

export function Stepper({ value, onChange, min = 0 }) {
  const v = parseInt(value) || 0;
  const set = (n) => onChange(String(Math.max(min, n)));
  const btn = { width: 36, height: 40, border: "none", background: "transparent", color: T.ink, fontSize: 19, fontWeight: 800, cursor: "pointer", fontFamily: FONT };
  return (
    <div style={{ display: "flex", alignItems: "stretch", border: `1.5px solid ${T.line}`, borderRadius: R.ctrl, overflow: "hidden", background: T.surfaceAlt }}>
      <button onClick={() => set(v - 1)} className="press" style={{ ...btn, borderRight: `1px solid ${T.line}` }}>−</button>
      <input inputMode="numeric" value={value} placeholder="0" onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))} style={{ width: 46, textAlign: "center", border: "none", background: "transparent", fontSize: 15, fontWeight: 800, fontFamily: FONT, outline: "none", color: T.text }} />
      <button onClick={() => set(v + 1)} className="press" style={{ ...btn, borderLeft: `1px solid ${T.line}` }}>+</button>
    </div>
  );
}

export function SuggestChips({ items, onPick, active }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {items.map((it) => {
        const on = active === it;
        return (
          <button key={it} onClick={() => onPick(it)} className="press"
            style={{ padding: "6px 12px", borderRadius: R.pill, border: `1px solid ${on ? T.grain : T.line}`, background: on ? T.grainSoft : T.surfaceAlt, color: on ? T.soil : T.muted, cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 13 }}>
            {it}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Thanh tiến độ ---------- */
export function ProgressBar({ pct, height = 12, from = T.grain, to = T.ink }) {
  const p = Math.max(0, Math.min(100, pct || 0));
  return (
    <div style={{ height, borderRadius: 999, background: T.surfaceSink, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${p}%`, background: `linear-gradient(90deg, ${from}, ${to})`, borderRadius: 999, transition: "width .4s cubic-bezier(.2,.7,.3,1)" }} />
    </div>
  );
}

/* ---------- Câu trích ---------- */
export function QuoteBar({ quote, tone = "ceo", label, style }) {
  if (!quote) return null;
  const bg = tone === "nlp" ? `linear-gradient(135deg, ${T.soil}, #82654c)` : `linear-gradient(140deg, ${T.inkDeep}, ${T.ink})`;
  const accent = tone === "nlp" ? "#F0D79B" : T.grainSoft;
  return (
    <div style={{ background: bg, color: "#fff", borderRadius: R.card, padding: "18px 20px", boxShadow: T.shadow, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", ...style }}>
      <div style={{ position: "absolute", top: -30, right: 10, fontSize: 130, opacity: .1, fontWeight: 700, lineHeight: 1, fontFamily: SERIF }}>”</div>
      {label && <Eyebrow color={accent} style={{ marginBottom: 8, position: "relative" }}>{label}</Eyebrow>}
      <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, fontFamily: SERIF, fontStyle: "italic", position: "relative" }}>{quote.text}</div>
      <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: accent, position: "relative", letterSpacing: ".01em" }}>— {quote.author}</div>
    </div>
  );
}

/* ---------- Signature: Cung mặt trời nhà nông (vẽ khi mount) ---------- */
export function SunArc({ pct, caption = "đã hoàn thành" }) {
  const w = 320, h = 168, cx = w / 2, cy = h - 26, r = 124;
  const clamped = Math.min(100, Math.max(0, pct || 0));
  const a = Math.PI * (1 - clamped / 100);
  const sx = cx + r * Math.cos(a), sy = cy - r * Math.sin(a);
  const dawn = clamped < 38, noon = clamped >= 38 && clamped < 82;
  const sky = dawn ? ["#FBE6C4", "#F7D29E"] : noon ? ["#CDE8FF", "#E6F3FF"] : ["#FFD9A2", "#F6B468"];
  const sun = dawn ? "#FF9E45" : noon ? "#FFC93C" : "#FF8A3D";
  const arcLen = Math.PI * r;
  const rays = Array.from({ length: 12 });
  return (
    <div style={{ borderRadius: R.card, overflow: "hidden", position: "relative", boxShadow: T.shadowSm, border: `1px solid ${T.line}` }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sky[0]} /><stop offset="100%" stopColor={sky[1]} /></linearGradient>
          <radialGradient id="sung" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FFF6D6" /><stop offset="62%" stopColor={sun} /><stop offset="100%" stopColor={sun} /></radialGradient>
          <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3C8A5A" /><stop offset="100%" stopColor="#1B5235" /></linearGradient>
        </defs>
        <rect width={w} height={h} fill="url(#sky)" />
        {/* quỹ đạo mờ */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="2" strokeDasharray="3 8" />
        {/* cung đã đi (vẽ) */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={sun} strokeWidth="3.4" strokeLinecap="round"
          style={{ "--len": arcLen, "--off": arcLen * (1 - clamped / 100), strokeDasharray: arcLen, strokeDashoffset: arcLen * (1 - clamped / 100), animation: "draw 1s cubic-bezier(.2,.7,.3,1) both" }} opacity=".55" />
        {/* mây */}
        <g fill="rgba(255,255,255,.6)"><ellipse cx="62" cy="44" rx="27" ry="9" /><ellipse cx="84" cy="40" rx="18" ry="8" /><ellipse cx="252" cy="32" rx="22" ry="8" /></g>
        {/* tia nắng */}
        <g stroke={sun} strokeWidth="2.2" strokeLinecap="round" opacity={dawn ? .5 : noon ? .85 : .6}>
          {rays.map((_, i) => { const ang = (i / rays.length) * Math.PI * 2; const r1 = 21, r2 = 28; return (<line key={i} x1={sx + r1 * Math.cos(ang)} y1={sy + r1 * Math.sin(ang)} x2={sx + r2 * Math.cos(ang)} y2={sy + r2 * Math.sin(ang)} />); })}
        </g>
        <circle cx={sx} cy={sy} r="32" fill={sun} opacity=".16" />
        <circle cx={sx} cy={sy} r="17" fill="url(#sung)" stroke="#fff" strokeWidth="1.5" opacity=".96" />
        {/* đồi lúa */}
        <path d={`M0 ${cy} Q ${w * .25} ${cy - 18} ${w * .5} ${cy} T ${w} ${cy} V ${h} H0 Z`} fill="url(#hill)" />
        <path d={`M0 ${cy + 6} Q ${w * .3} ${cy - 4} ${w * .6} ${cy + 8} T ${w} ${cy + 4} V ${h} H0 Z`} fill="rgba(15,58,36,.5)" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 14, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#103A24", textShadow: "0 1px 0 rgba(255,255,255,.45)", letterSpacing: "-.02em" }}>{Math.round(clamped)}%</div>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "#2c513e", letterSpacing: ".02em" }}>{caption}</div>
      </div>
    </div>
  );
}

/* vòng cung nhỏ gọn cho Home */
export function SunRing({ pct, size = 64 }) {
  const clamped = Math.min(100, Math.max(0, pct || 0));
  const r = (size - 8) / 2, c = 2 * Math.PI * r, cx = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={T.surfaceSink} strokeWidth="6" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={T.grain} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - clamped / 100)} transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.2,.7,.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: T.ink }}>{Math.round(clamped)}%</div>
    </div>
  );
}

/* ---------- Khác ---------- */
export function Collapsible({ title, icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: FONT }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: T.ink, fontSize: 14.5 }}>{icon && <span>{icon}</span>}{title}</span>
        <span style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: ".2s", color: T.muted, display: "flex" }}><Icon name="chevron" size={18} /></span>
      </button>
      {open && <div style={{ padding: "0 16px 16px" }}>{children}</div>}
    </Card>
  );
}

export const EmptyState = ({ children }) => (
  <div style={{ color: T.faint, fontSize: 14, textAlign: "center", padding: "18px 8px", fontWeight: 600 }}>{children}</div>
);

export function SavedTag({ show, text = "Đã lưu" }) {
  if (!show) return null;
  return <span style={{ fontSize: 12.5, fontWeight: 800, color: T.leaf, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="check" size={14} />{text}</span>;
}

export function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const on = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,58,36,.4)", backdropFilter: "blur(3px)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}>
      <div onClick={(e) => e.stopPropagation()} className="rise"
        style={{ background: T.canvas, width: "100%", maxWidth: 480, borderRadius: "22px 22px 0 0", padding: "18px 16px max(18px,env(safe-area-inset-bottom))", maxHeight: "88vh", overflowY: "auto", boxShadow: T.shadowLg }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 17, color: T.ink }}>{title}</div>
          <IconBtn icon="plus" onClick={onClose} title="Đóng" style={{ transform: "rotate(45deg)" }} />
        </div>
        {children}
      </div>
    </div>
  );
}
