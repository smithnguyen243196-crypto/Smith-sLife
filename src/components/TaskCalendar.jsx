import React, { useMemo, useState } from "react";
import { T, R, FONT, SERIF } from "../lib/theme.js";
import { solar2lunar } from "../lib/lunar.js";
import { projectColor } from "../lib/config.js";
import { Card } from "./ui.jsx";
import { Icon } from "./icons.jsx";
import TaskModal from "./TaskModal.jsx";

const WD = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const p2 = (n) => String(n).padStart(2, "0");
const keyOf = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfWeekMon = (d) => addDays(d, -((d.getDay() + 6) % 7)); // về Thứ Hai
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dayMs = 86400000;

const MAX_LANES_MONTH = 3;

// Xếp các task vào "lane" để thanh không đè nhau trong một tuần.
function layoutWeek(tasks, weekStart) {
  const weekEnd = addDays(weekStart, 6);
  const ws = weekStart.getTime(), we = weekEnd.getTime();
  const segs = [];
  tasks.forEach((t) => {
    if (!t.due) return;
    const s0 = parse(t.due).getTime();
    const e0 = (t.dueEnd ? parse(t.dueEnd) : parse(t.due)).getTime();
    if (e0 < ws || s0 > we) return; // không giao tuần này
    const colStart = Math.max(0, Math.round((s0 - ws) / dayMs));
    const colEnd = Math.min(6, Math.round((e0 - ws) / dayMs));
    segs.push({ task: t, colStart, colEnd, startsHere: s0 >= ws, endsHere: e0 <= we });
  });
  // việc dài hơn xếp trước -> bám hàng trên, gọn mắt
  segs.sort((a, b) => (a.colStart - b.colStart) || (b.colEnd - b.colStart) - (a.colEnd - a.colStart));
  const lanesEnd = []; // colEnd cuối của mỗi lane
  segs.forEach((sg) => {
    let lane = lanesEnd.findIndex((end) => end < sg.colStart);
    if (lane === -1) { lane = lanesEnd.length; lanesEnd.push(sg.colEnd); }
    else lanesEnd[lane] = sg.colEnd;
    sg.lane = lane;
  });
  return segs;
}

export default function TaskCalendar({ tasks = [], projects = [], onAdd, onEdit, onToggle }) {
  const now = new Date();
  const [mode, setMode] = useState("week"); // "week" | "month"
  const [anchor, setAnchor] = useState(new Date());
  const [modal, setModal] = useState(null); // {mode,value}

  // Các tuần cần hiển thị
  const weeks = useMemo(() => {
    if (mode === "week") return [startOfWeekMon(anchor)];
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    let cur = startOfWeekMon(first);
    const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const out = [];
    while (cur <= last) { out.push(new Date(cur)); cur = addDays(cur, 7); }
    return out;
  }, [mode, anchor]);

  const shift = (dir) => setAnchor((a) => (mode === "week" ? addDays(a, 7 * dir) : new Date(a.getFullYear(), a.getMonth() + dir, 1)));
  const goToday = () => setAnchor(new Date());

  const titleTxt = mode === "week"
    ? (() => { const ws = weeks[0], we = addDays(ws, 6); return ws.getMonth() === we.getMonth() ? `${ws.getDate()}–${we.getDate()}/${we.getMonth() + 1}` : `${ws.getDate()}/${ws.getMonth() + 1} – ${we.getDate()}/${we.getMonth() + 1}`; })()
    : `Tháng ${anchor.getMonth() + 1} · ${anchor.getFullYear()}`;

  const openAdd = (dk) => setModal({ mode: "add", value: { due: dk } });
  const openEdit = (t) => setModal({ mode: "edit", value: t });
  const submit = (fields) => {
    if (modal.mode === "add") onAdd(fields.name, fields.projectId, fields.due, fields.note, fields.dueEnd);
    else onEdit(modal.value.id, fields);
    setModal(null);
  };

  const navBtn = { width: 30, height: 30, borderRadius: 9, border: `1px solid ${T.line}`, background: T.surfaceAlt, color: T.ink, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: FONT };
  const segH = mode === "week" ? 30 : 21;
  const maxLanes = mode === "week" ? 99 : MAX_LANES_MONTH;

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      {/* Thanh điều khiển */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "14px 16px", borderBottom: `1px solid ${T.line}` }}>
        <span style={{ color: T.ink, display: "flex" }}><Icon name="calendar" size={19} /></span>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: T.ink, minWidth: 0 }}>{titleTxt}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "inline-flex", background: T.surfaceAlt, border: `1px solid ${T.line}`, borderRadius: 999, padding: 3 }}>
          {[["week", "Tuần"], ["month", "Tháng"]].map(([m, lb]) => (
            <button key={m} onClick={() => setMode(m)} className="press"
              style={{ padding: "5px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 13, fontWeight: 800, background: mode === m ? T.ink : "transparent", color: mode === m ? T.onInk : T.muted }}>{lb}</button>
          ))}
        </div>
        <button onClick={goToday} className="press" style={{ ...navBtn, width: "auto", padding: "0 11px", fontSize: 12.5, fontWeight: 800 }}>Hôm nay</button>
        <button onClick={() => shift(-1)} className="press" aria-label="Trước" style={navBtn}><span style={{ transform: "rotate(90deg)", display: "flex" }}><Icon name="chevron" size={16} /></span></button>
        <button onClick={() => shift(1)} className="press" aria-label="Sau" style={navBtn}><span style={{ transform: "rotate(-90deg)", display: "flex" }}><Icon name="chevron" size={16} /></span></button>
      </div>

      {/* Tên thứ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "8px 8px 0" }}>
        {WD.map((w, i) => (
          <div key={w} style={{ textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: ".02em", color: i === 6 ? T.danger : T.muted }}>{w}</div>
        ))}
      </div>

      {/* Các tuần */}
      <div style={{ padding: "4px 8px 12px" }}>
        {weeks.map((ws, wi) => {
          const segs = layoutWeek(tasks, ws);
          const shown = segs.filter((s) => s.lane < maxLanes);
          const laneCount = shown.reduce((m, s) => Math.max(m, s.lane + 1), 0);
          // đếm việc ẩn theo từng cột (chỉ month)
          const hiddenByCol = Array(7).fill(0);
          segs.filter((s) => s.lane >= maxLanes).forEach((s) => { for (let c = s.colStart; c <= s.colEnd; c++) hiddenByCol[c]++; });

          return (
            <div key={wi} style={{ marginBottom: mode === "month" ? 6 : 0, borderTop: wi ? `1px solid ${T.lineSoft}` : "none", paddingTop: wi ? 6 : 0 }}>
              {/* Hàng số ngày */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
                {Array.from({ length: 7 }).map((_, c) => {
                  const d = addDays(ws, c);
                  const inMonth = mode === "week" || d.getMonth() === anchor.getMonth();
                  const isToday = sameDay(d, now);
                  const sun = c === 6;
                  const l = solar2lunar(d.getDate(), d.getMonth() + 1, d.getFullYear());
                  const lunarTxt = l.day === 1 ? `${l.month}/1` : l.day;
                  return (
                    <div key={c} className="cal-day" style={{ position: "relative", textAlign: "center", padding: "3px 0 4px", opacity: inMonth ? 1 : 0.38 }}>
                      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", lineHeight: 1.05, gap: 1,
                        ...(isToday ? { background: T.ink, color: T.onInk, borderRadius: 9, padding: "2px 7px" } : {}) }}>
                        <span style={{ fontSize: 14, fontWeight: isToday ? 900 : 700, color: isToday ? T.onInk : sun ? T.danger : T.text }}>{d.getDate()}</span>
                        <span style={{ fontSize: 9.5, fontWeight: l.day === 1 ? 800 : 600, color: isToday ? T.accentOnInk : l.day === 1 ? T.grainDeep : T.faint }}>{lunarTxt}</span>
                      </div>
                      <button onClick={() => openAdd(keyOf(d))} className="cal-add press" title="Thêm việc"
                        style={{ position: "absolute", top: 2, right: "50%", marginRight: -24, width: 18, height: 18, borderRadius: 6, border: "none", background: T.inkSoft, color: T.ink, cursor: "pointer", display: "grid", placeItems: "center", opacity: 0, transition: "opacity .12s" }}>
                        <Icon name="plus" size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Thanh nhiệm vụ */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gridAutoRows: `${segH}px`, rowGap: 4, columnGap: 3, minHeight: mode === "month" ? segH + 4 : 8, marginTop: 3, position: "relative" }}>
                {shown.map((s, i) => {
                  const t = s.task;
                  const pc = projectColor(t.projectId) || T.ink;
                  return (
                    <button key={t.id + "-" + i} onClick={() => openEdit(t)} className="press" title={t.name}
                      style={{ gridColumn: `${s.colStart + 1} / ${s.colEnd + 2}`, gridRow: s.lane + 1, display: "flex", alignItems: "center", gap: 5, minWidth: 0,
                        padding: mode === "week" ? "0 8px" : "0 6px", height: segH, cursor: "pointer", textAlign: "left", fontFamily: FONT,
                        background: t.done ? T.surfaceAlt : `${pc}22`, border: `1px solid ${t.done ? T.line : pc + "55"}`,
                        borderLeft: `3px solid ${pc}`,
                        borderTopLeftRadius: s.startsHere ? 8 : 2, borderBottomLeftRadius: s.startsHere ? 8 : 2,
                        borderTopRightRadius: s.endsHere ? 8 : 2, borderBottomRightRadius: s.endsHere ? 8 : 2 }}>
                      <span onClick={(e) => { e.stopPropagation(); onToggle(t.id); }}
                        style={{ flexShrink: 0, width: 14, height: 14, borderRadius: 4, border: `1.5px solid ${t.done ? T.success : pc}`, background: t.done ? T.success : "transparent", display: "grid", placeItems: "center", cursor: "pointer" }}>
                        {t.done && <Icon name="check" size={10} style={{ color: "#fff" }} />}
                      </span>
                      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: mode === "week" ? 12.5 : 11, fontWeight: 700,
                        color: t.done ? T.muted : T.text, textDecoration: t.done ? "line-through" : "none" }}>{t.name}</span>
                    </button>
                  );
                })}
                {/* badge "+N" cho việc bị ẩn (month) */}
                {mode === "month" && hiddenByCol.map((n, c) => n ? (
                  <button key={"h" + c} onClick={() => { setMode("week"); setAnchor(addDays(ws, c)); }} className="press"
                    style={{ gridColumn: `${c + 1} / ${c + 2}`, gridRow: maxLanes + 1, fontSize: 10.5, fontWeight: 800, color: T.muted, background: "transparent", border: "none", cursor: "pointer", fontFamily: FONT, textAlign: "left", padding: "0 6px" }}>
                    +{n}
                  </button>
                ) : null)}
              </div>
            </div>
          );
        })}
      </div>

      <TaskModal open={!!modal} mode={modal?.mode} value={modal?.value} projects={projects} onClose={() => setModal(null)} onSubmit={submit} />
    </Card>
  );
}
