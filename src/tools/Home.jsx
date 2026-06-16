import React, { useEffect, useState } from "react";
import { T, R, FONT, SERIF, todayKey } from "../lib/theme.js";
import { NGAY_HABITS } from "../lib/config.js";
import { api } from "../lib/api.js";
import { Card, Eyebrow, QuoteBar, SunRing, ProgressBar, Btn } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";
import QuickLinks from "../components/QuickLinks.jsx";
import MonthCalendar from "../components/MonthCalendar.jsx";
import AnalogClock from "../components/AnalogClock.jsx";
import QuickActions from "../components/QuickActions.jsx";
import TaskBoard from "../components/TaskBoard.jsx";

const TOOLS = [
  { id: "tasks", icon: "tasks", title: "Nhiệm Vụ Ngày", desc: "Thói quen & việc cần làm" },
  { id: "kiemket", icon: "kiemket", title: "Kiểm Két", desc: "Đếm két · thu chi · kết quả" },
  { id: "notes", icon: "notes", title: "Ghi Chú", desc: "Ghi nhanh việc vừa làm" },
  { id: "vi", icon: "vi", title: "Ví Cá Nhân", desc: "Ngân hàng & tiền mặt" },
  { id: "tinhlai", icon: "tinhlai", title: "Tính Lãi", desc: "Theo ngày & lãi suất" },
];

export default function Home({ quote, nlpQuote, now, go, linkProps, compact }) {
  const [habitMap, setHabitMap] = useState({});
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    api.getNgay(todayKey(now)).then((d) => { if (d && d.habits) setHabitMap(d.habits); });
    api.getTasks().then((t) => Array.isArray(t) && setTasks(t));
  }, [now]);
  const doneHabits = NGAY_HABITS.filter((k) => habitMap[k]).length;
  const habitPct = (doneHabits / NGAY_HABITS.length) * 100;

  const addTask = async (name) => { const t = await api.addTask(name); setTasks((p) => [...p, t || { id: Date.now(), name, done: false }]); };
  const toggleTask = (id) => setTasks((p) => { const n = p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)); const it = n.find((x) => x.id === id); api.toggleTask(id, it.done); return n; });
  const delTask = (id) => { setTasks((p) => p.filter((t) => t.id !== id)); api.deleteTask(id); };

  /* ---- nhịp ngày (đồng hồ + tóm tắt thói quen) ---- */
  const pulse = (clockSize) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <AnalogClock size={clockSize} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <Eyebrow>Nhịp ngày hôm nay</Eyebrow>
            <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: T.text, marginTop: 3 }}>{doneHabits}/{NGAY_HABITS.length} thói quen</div>
          </div>
          <SunRing pct={habitPct} size={52} />
        </div>
        <div style={{ marginTop: 9 }}><ProgressBar pct={habitPct} height={8} /></div>
        <Btn variant="soft" onClick={() => go("tasks")} style={{ marginTop: 10, padding: "7px 13px", fontSize: 13 }}>Mở nhật ký</Btn>
      </div>
    </div>
  );

  const toolGrid = (cols, pad) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 12 }}>
      {TOOLS.map((t) => (
        <button key={t.id} onClick={() => go(t.id)} className="lift press"
          style={{ textAlign: "left", background: T.surface, border: `1px solid ${T.line}`, borderRadius: R.card, padding: pad, cursor: "pointer", fontFamily: FONT, boxShadow: T.shadowSm }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.inkSoft, display: "flex", alignItems: "center", justifyContent: "center", color: T.ink, marginBottom: 9 }}><Icon name={t.icon} size={24} /></div>
          <div style={{ fontWeight: 800, fontSize: 14.5, color: T.text }}>{t.title}</div>
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{t.desc}</div>
        </button>
      ))}
    </div>
  );

  /* ====================== DESKTOP ====================== */
  if (compact) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {/* lịch (trái) · đồng hồ + thói quen + thao tác nhanh (phải) */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            <div style={{ flex: "1 1 0", minWidth: 300, padding: "16px 20px", borderRight: `1px solid ${T.line}` }}>
              <MonthCalendar now={now} compact />
            </div>
            <div style={{ flex: "1.12 1 0", minWidth: 360, padding: "16px 20px", display: "grid", gap: 13, alignContent: "start", background: `linear-gradient(150deg, ${T.surface}, ${T.surfaceAlt})` }}>
              {pulse(104)}
              <div>
                <Eyebrow style={{ marginBottom: 8 }}>Thao tác nhanh</Eyebrow>
                <QuickActions onAddTask={addTask} />
              </div>
            </div>
          </div>
        </Card>

        {toolGrid(5, 13)}

        {/* nhiệm vụ cần làm (trái) · truy cập nhanh (phải) */}
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 12, alignItems: "start" }}>
          <TaskBoard tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={delTask} />
          <QuickLinks {...linkProps} />
        </div>

        {/* câu trích */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "stretch" }}>
          <QuoteBar quote={quote} style={{ height: "100%" }} />
          <QuoteBar quote={nlpQuote} tone="nlp" center hideAuthor style={{ height: "100%" }} />
        </div>
      </div>
    );
  }

  /* ====================== MOBILE ====================== */
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>{pulse(96)}</Card>

      <Card>
        <Eyebrow style={{ marginBottom: 10 }}>Thao tác nhanh</Eyebrow>
        <QuickActions onAddTask={addTask} />
      </Card>

      <TaskBoard tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={delTask} maxList={320} />

      <Card><MonthCalendar now={now} compact /></Card>

      <QuoteBar quote={quote} />

      {toolGrid(2, 15)}

      <QuickLinks {...linkProps} />

      <QuoteBar quote={nlpQuote} tone="nlp" center hideAuthor />
    </div>
  );
}
