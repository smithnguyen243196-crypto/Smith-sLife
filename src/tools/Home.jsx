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
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    api.getNgay(todayKey(now)).then((d) => { if (d && d.habits) setHabitMap(d.habits); });
    api.getTasks().then((t) => Array.isArray(t) && setTasks(t));
    api.getProjects().then((p) => Array.isArray(p) && setProjects(p));
    api.getStreak(NGAY_HABITS, todayKey(now)).then((s) => s && typeof s.streak === "number" && setStreak(s.streak));
  }, [now]);
  const doneHabits = NGAY_HABITS.filter((k) => habitMap[k]).length;
  const habitPct = (doneHabits / NGAY_HABITS.length) * 100;
  const todayPerfect = habitPct >= 80; // perfect day = hoàn thành >= 80% thói quen

  const addTask = async (name, projectId, due, note, dueEnd) => { const t = await api.addTask(name, projectId, due, note, dueEnd); setTasks((p) => [...p, t || { id: Date.now(), name, done: false, due: due || null, dueEnd: dueEnd || null, doneDate: null, projectId: projectId || null, note: note || "" }]); };
  const editTask = (id, fields) => { setTasks((p) => p.map((t) => (t.id === id ? { ...t, ...fields } : t))); api.updateTask(id, fields); };
  const toggleTask = (id) => setTasks((p) => { const today = new Date().toISOString().slice(0, 10); const n = p.map((t) => (t.id === id ? { ...t, done: !t.done, doneDate: !t.done ? today : null } : t)); const it = n.find((x) => x.id === id); api.toggleTask(id, it.done); return n; });
  const delTask = (id) => { setTasks((p) => p.filter((t) => t.id !== id)); api.deleteTask(id); };

  const board = (featured, maxList) => <TaskBoard tasks={tasks} projects={projects} onAdd={addTask} onEdit={editTask} onToggle={toggleTask} onDelete={delTask} featured={featured} maxList={maxList} />;

  const streakChip = (
    <div style={{ marginTop: 7, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: streak > 0 ? T.grainDeep : T.muted, background: streak > 0 ? T.grainSoft : T.surfaceAlt, padding: "4px 11px", borderRadius: 999 }}>
      <span>🔥 {streak > 0 ? `${streak} ngày perfect` : "Chưa có chuỗi perfect"}</span>
      {todayPerfect && <span style={{ color: T.success }}>· hôm nay ✓</span>}
    </div>
  );

  const pulse = (clockSize) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <AnalogClock size={clockSize} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <Eyebrow>Nhịp ngày hôm nay</Eyebrow>
            <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: T.text, marginTop: 3 }}>{doneHabits}/{NGAY_HABITS.length} thói quen</div>
            {streakChip}
          </div>
          <SunRing pct={habitPct} size={52} />
        </div>
        <div style={{ marginTop: 10 }}><ProgressBar pct={habitPct} height={8} /></div>
        <Btn variant="soft" onClick={() => go("tasks")} style={{ marginTop: 10, padding: "7px 13px", fontSize: 13 }}>Mở nhật ký</Btn>
      </div>
    </div>
  );

  /* ====================== DESKTOP ====================== */
  if (compact) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "stretch" }}>
          <QuoteBar quote={quote} style={{ height: "100%" }} />
          <QuoteBar quote={nlpQuote} tone="nlp" center hideAuthor style={{ height: "100%" }} />
        </div>

        {/* lịch (trái, hẹp hơn) · đồng hồ + thói quen + thao tác nhanh (phải) */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            <div style={{ flex: "0.9 1 0", minWidth: 280, padding: "16px 20px", borderRight: `1px solid ${T.line}` }}>
              <MonthCalendar now={now} compact tasks={tasks} />
            </div>
            <div style={{ flex: "1.25 1 0", minWidth: 380, padding: "16px 20px", display: "grid", gap: 13, alignContent: "start", background: `linear-gradient(150deg, ${T.surface}, ${T.surfaceAlt})` }}>
              {pulse(104)}
              <div>
                <Eyebrow style={{ marginBottom: 8 }}>Thao tác nhanh</Eyebrow>
                <QuickActions onAddTask={addTask} projects={projects} />
              </div>
            </div>
          </div>
        </Card>

        <QuickLinks {...linkProps} />

        {board(true, 420)}
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

      <QuickLinks {...linkProps} />

      {board(true, 360)}

      <Card><MonthCalendar now={now} compact tasks={tasks} /></Card>
    </div>
  );
}
