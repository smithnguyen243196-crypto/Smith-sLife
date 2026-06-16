import React, { useEffect, useState } from "react";
import { T, SERIF } from "../lib/theme.js";

// Đồng hồ kim chạy thời gian thực
export default function AnalogClock({ size = 128 }) {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const s = t.getSeconds(), m = t.getMinutes(), h = t.getHours() % 12;
  const secA = s * 6;
  const minA = m * 6 + s * 0.1;
  const hourA = h * 30 + m * 0.5;
  const cx = size / 2, cy = size / 2, r = size / 2 - 3;

  const hand = (angle, len, w, color) => {
    const rad = (angle - 90) * Math.PI / 180;
    const x = cx + len * Math.cos(rad), y = cy + len * Math.sin(rad);
    const tx = cx - len * 0.18 * Math.cos(rad), ty = cy - len * 0.18 * Math.sin(rad);
    return <line x1={tx} y1={ty} x2={x} y2={y} stroke={color} strokeWidth={w} strokeLinecap="round" />;
  };

  const ticks = [...Array(12)].map((_, i) => {
    const a = (i * 30 - 90) * Math.PI / 180;
    const big = i % 3 === 0;
    const r1 = r - 5, r2 = r - (big ? 12 : 8);
    return <line key={i} x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)} stroke={big ? T.ink : T.line} strokeWidth={big ? 2.4 : 1.5} strokeLinecap="round" />;
  });

  const p2 = (n) => String(n).padStart(2, "0");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill={T.surface} stroke={T.line} strokeWidth="2" />
        <circle cx={cx} cy={cy} r={r - 1.5} fill="none" stroke={T.grainSoft} strokeWidth="1.2" />
        {ticks}
        {hand(hourA, r * 0.5, 4, T.inkDeep)}
        {hand(minA, r * 0.72, 3, T.ink)}
        {hand(secA, r * 0.82, 1.4, T.grain)}
        <circle cx={cx} cy={cy} r="3.6" fill={T.ink} />
        <circle cx={cx} cy={cy} r="1.5" fill={T.grain} />
      </svg>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: T.ink, letterSpacing: ".02em" }}>
        {p2(t.getHours())}:{p2(t.getMinutes())}<span style={{ color: T.grainDeep }}>:{p2(t.getSeconds())}</span>
      </div>
    </div>
  );
}
