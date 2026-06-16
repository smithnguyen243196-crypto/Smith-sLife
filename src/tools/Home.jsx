import React, { useEffect, useState } from "react";
import { T, SERIF, todayKey } from "../lib/theme.js";
import { NGAY_HABITS } from "../lib/config.js";
import { api } from "../lib/api.js";
import { Card, Eyebrow, QuoteBar, SunRing, ProgressBar, Btn } from "../components/ui.jsx";
import QuickLinks from "../components/QuickLinks.jsx";
import MonthCalendar from "../components/MonthCalendar.jsx";
import AnalogClock from "../components/AnalogClock.jsx";
import QuickActions from "../components/QuickActions.jsx";
import TaskBoard from "../components/TaskBoard.jsx";

export default function Home({ quote, nlpQuote, now, go, linkProps, compact }) {
  const [habitMap, setHabitMap] = useState({});
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    api.getNgay(todayKey(now)).then((d) => { if (d && d.habits) setHabitMap(d.habits); });
    api.getTasks().then((t) => Array.isArray(t) && setTasks(t));
    api.getProjects().then((p) => Array.isArray(p) && setProjects(p));
  }, [now]);
  const doneHabits = NGAY_HABITS.filter((k) => habitMap[k]).length;
  const habitPct = (doneHabits / NGAY_HABITS.length) * 100;

  const addTask = async (name, projectId, due) => { const t = await api.addTask(name, projectId, due); setTasks((p) => [...p, t || { id: Date.now(), name, done: false, due: due || null, doneDate: null, projectId: projectId || null }]); };
  const toggleTask = (id) => setTasks((p) => { const today = new Date().toISOString().slice(0, 10); const n = p.map((t) => (t.id === id ? { ...t, done: !t.done, doneDate: !t.done ? today : null } : t)); const it = n.find((x) => x.id === id); api.toggleTask(id, it.done); return n; });
  const delTask = (id) => { setTasks((p) => p.filter((t) => t.id !== id)); api.deleteTask(id); };

  const board = (featured, maxList) => <TaskBoard tasks={tasks} projects={projects} onAdd={addTask} onToggle={toggleTask} onDelete={delTask} featured={featured} maxList={maxList} />;

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

  /* ====================== DESKTOP ====================== */
  if (compact) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {/* câu trích — đầu trang */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "stretch" }}>
          <QuoteBar quote={quote} style={{ height: "100%" }} />
          <QuoteBar quote={nlpQuote} tone="nlp" center hideAuthor style={{ height: "100%" }} />
        </div>

        {/* lịch (trái) · đồng hồ + thao tác nhanh (phải) */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            <div style={{ flex: "1 1 0", minWidth: 300, padding: "16px 20px", borderRight: `1px solid ${T.line}` }}>
              <MonthCalendar now={now} compact tasks={tasks} />
            </div>
            <div style={{ flex: "1.12 1 0", minWidth: 360, padding: "16px 20px", display: "grid", gap: 13, alignContent: "start", background: `linear-gradient(150deg, ${T.surface}, ${T.surfaceAlt})` }}>
              {pulse(104)}
              <div>
                <Eyebrow style={{ marginBottom: 8 }}>Thao tác nhanh</Eyebrow>
                <QuickActions onAddTask={addTask} projects={projects} />
              </div>
            </div>
          </div>
        </Card>

        {/* nhiệm vụ — nổi bật, cả hàng */}
        {board(true, 420)}

        <QuickLinks {...linkProps} />
      </div>
    );
  }

  /* ====================== MOBILE ====================== */
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <QuoteBar quote={quote} />
      <QuoteBar quote={nlpQuote} tone="nlp" center hideAuthor />

      <Card>{pulse(96)}</Card>

      <Card>
        <Eyebrow style={{ marginBottom: 10 }}>Thao tác nhanh</Eyebrow>
        <QuickActions onAddTask={addTask} projects={projects} />
      </Card>

      {board(true, 360)}

      <Card><MonthCalendar now={now} compact tasks={tasks} /></Card>

      <QuickLinks {...linkProps} />
    </div>
  );
}
