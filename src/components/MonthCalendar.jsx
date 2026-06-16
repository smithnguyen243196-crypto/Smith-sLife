import React, { useState } from "react";
import { T, R, FONT, SERIF } from "../lib/theme.js";
import { solar2lunar } from "../lib/lunar.js";
import { projectColor } from "../lib/config.js";
import { Icon } from "./icons.jsx";

const WD = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const p2 = (n) => String(n).padStart(2, "0");

// Lịch tháng kèm ngày âm + chấm màu dự án theo nhiệm vụ trong ngày
export default function MonthCalendar({ now, compact, cell, tasks = [] }) {
  const [vy, setVy] = useState(now.getFullYear());
  const [vm, setVm] = useState(now.getMonth()); // 0–11
  const isThisMonth = vy === now.getFullYear() && vm === now.getMonth();

  const first = new Date(vy, vm, 1);
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const startPad = (first.getDay() + 6) % 7; // tuần bắt đầu Thứ Hai
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // gom màu dự án theo ngày (key = YYYY-MM-DD của "Ngày Thực Hiện")
  const dotsByDay = {};
  tasks.forEach((t) => {
    if (!t.due) return;
    const c = projectColor(t.projectId) || T.faint;
    (dotsByDay[t.due] = dotsByDay[t.due] || []).push(c);
  });

  const shift = (delta) => { const d = new Date(vy, vm + delta, 1); setVy(d.getFullYear()); setVm(d.getMonth()); };
  const goToday = () => { setVy(now.getFullYear()); setVm(now.getMonth()); };

  const navBtn = { width: 30, height: 30, borderRadius: 9, border: `1px solid ${T.line}`, background: T.surfaceAlt, color: T.ink, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: FONT };
  const cellH = cell || (compact ? 48 : 54);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ color: T.ink, display: "flex" }}><Icon name="calendar" size={18} /></span>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: T.ink }}>Tháng {vm + 1}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: T.faint }}>· {vy}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {!isThisMonth && <button onClick={goToday} className="press" style={{ ...navBtn, width: "auto", padding: "0 10px", fontSize: 12, fontWeight: 800 }}>Hôm nay</button>}
          <button onClick={() => shift(-1)} className="press" aria-label="Tháng trước" style={navBtn}><span style={{ transform: "rotate(90deg)", display: "flex" }}><Icon name="chevron" size={16} /></span></button>
          <button onClick={() => shift(1)} className="press" aria-label="Tháng sau" style={navBtn}><span style={{ transform: "rotate(-90deg)", display: "flex" }}><Icon name="chevron" size={16} /></span></button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {WD.map((w, i) => (
          <div key={w} style={{ textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: ".02em", color: i === 6 ? T.danger : T.muted, paddingBottom: 2 }}>{w}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {cells.map((d, idx) => {
          if (!d) return <div key={idx} style={{ height: cellH }} />;
          const sun = idx % 7 === 6;
          const today = isThisMonth && d === now.getDate();
          const l = solar2lunar(d, vm + 1, vy);
          const lunarTxt = l.day === 1 ? `${l.month}/1` : l.day;
          const lunarHi = l.day === 1;
          const key = `${vy}-${p2(vm + 1)}-${p2(d)}`;
          const dots = [...new Set(dotsByDay[key] || [])].slice(0, 4);
          return (
            <div key={idx} style={{ height: cellH, borderRadius: 11, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1, gap: 2,
              background: today ? T.inkSoft : "transparent", border: today ? `1.5px solid ${T.ink}` : "1.5px solid transparent" }}>
              <span style={{ fontSize: 14.5, fontWeight: today ? 900 : 700, color: today ? T.inkDeep : sun ? T.danger : T.text }}>{d}</span>
              <span style={{ fontSize: 10, fontWeight: lunarHi ? 800 : 600, color: lunarHi ? T.grainDeep : T.faint }}>{lunarTxt}</span>
              <div style={{ height: 6, marginTop: 4, display: "flex", justifyContent: "center", gap: 2.5 }}>
                {dots.map((c, i) => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
