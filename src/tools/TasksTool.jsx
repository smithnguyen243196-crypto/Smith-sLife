import React, { useEffect, useState } from "react";
import { T, R, WEEKDAYS, todayKey } from "../lib/theme.js";
import { lunarLabel } from "../lib/lunar.js";
import { NGAY_HABITS, MORNING_Q, EVENING_Q } from "../lib/config.js";
import { api } from "../lib/api.js";
import { Card, SectionTitle, QuoteBar, SunArc, ProgressBar, Collapsible, Btn, IconBtn, EmptyState, inputStyle } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";
import TaskCalendar from "../components/TaskCalendar.jsx";
import TaskBoard from "../components/TaskBoard.jsx";

export default function TasksTool({ quote, now }) {
  const dk = todayKey(now);
  const [habits, setHabits] = useState(NGAY_HABITS.map((h) => ({ name: h, done: false })));
  const [morning, setMorning] = useState(MORNING_Q.map(() => ""));
  const [evening, setEvening] = useState(EVENING_Q.map(() => ""));
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.getNgay(dk).then((d) => {
      if (!d) return;
      if (d.habits) setHabits(NGAY_HABITS.map((h) => ({ name: h, done: !!d.habits[h] })));
      if (d.morning) setMorning(MORNING_Q.map((_, i) => d.morning[i] || ""));
      if (d.evening) setEvening(EVENING_Q.map((_, i) => d.evening[i] || ""));
    });
    api.getTasks().then((t) => Array.isArray(t) && setTasks(t));
    api.getProjects().then((p) => Array.isArray(p) && setProjects(p));
  }, [dk]);

  const taskPct = tasks.length ? (tasks.filter((t) => t.done).length / tasks.length) * 100 : 0;
  const habitPct = habits.length ? (habits.filter((h) => h.done).length / habits.length) * 100 : 0;

  const toggleHabit = (i) => setHabits((p) => { const n = p.map((x, j) => (j === i ? { ...x, done: !x.done } : x)); api.tickHabit(dk, n[i].name, n[i].done); return n; });

  const addTask = async (name, projectId, due, note, dueEnd) => {
    const t = await api.addTask(name, projectId || null, due || null, note || "", dueEnd || null);
    setTasks((p) => [...p, t || { id: Date.now(), name, done: false, due: due || null, dueEnd: dueEnd || null, doneDate: null, projectId: projectId || null, note: note || "" }]);
  };
  const editTask = (id, fields) => { setTasks((p) => p.map((t) => (t.id === id ? { ...t, ...fields } : t))); api.updateTask(id, fields); };
  const toggleTask = (id) => setTasks((p) => { const today = new Date().toISOString().slice(0, 10); const n = p.map((t) => (t.id === id ? { ...t, done: !t.done, doneDate: !t.done ? today : null } : t)); const it = n.find((x) => x.id === id); api.toggleTask(id, it.done); return n; });
  const delTask = (id) => { setTasks((p) => p.filter((t) => t.id !== id)); api.deleteTask(id); };

  const QA = (qs, arr, set, kind) => (
    <div style={{ display: "grid", gap: 12 }}>
      {qs.map((q, i) => (
        <div key={i}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5, color: T.text }}>{q}</div>
          <textarea value={arr[i]} rows={2} placeholder="..." style={{ ...inputStyle, resize: "vertical" }}
            onChange={(e) => set((p) => p.map((x, j) => (j === i ? e.target.value : x)))} onBlur={() => api.saveAnswers(dk, kind, arr)} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <QuoteBar quote={quote} />
      <Card style={{ background: `linear-gradient(150deg, ${T.surface}, ${T.surfaceAlt})` }}>
        <div style={{ fontSize: 13, color: T.muted, fontWeight: 700 }}>{WEEKDAYS[now.getDay()]}</div>
        <div style={{ fontSize: 21, fontWeight: 900, color: T.text, marginTop: 2 }}>Ngày {now.getDate()} tháng {now.getMonth() + 1} năm {now.getFullYear()}</div>
        <div style={{ fontSize: 13, color: T.grainDeep, fontWeight: 700, marginTop: 2 }}>{lunarLabel(now)}</div>
      </Card>

      {/* Signature: cung mặt trời = % thói quen */}
      <SunArc pct={habitPct} caption="thói quen hôm nay đã làm" />

      <Card>
        <SectionTitle icon="tasks" right={<span style={{ fontWeight: 900, color: T.ink }}>{Math.round(taskPct)}%</span>}>Hoàn thành nhiệm vụ</SectionTitle>
        <ProgressBar pct={taskPct} />
      </Card>

      <Collapsible title="Câu hỏi đầu ngày" icon="🌅">{QA(MORNING_Q, morning, setMorning, "morning")}</Collapsible>

      <Card>
        <SectionTitle right={<span style={{ fontWeight: 900, color: T.ink }}>{Math.round(habitPct)}%</span>}>Thói quen mỗi ngày</SectionTitle>
        <div style={{ display: "grid", gap: 8 }}>
          {habits.map((h, i) => (
            <label key={i} className="press" style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: R.ctrl, background: h.done ? T.inkSoft : T.surfaceAlt, cursor: "pointer", border: `1px solid ${h.done ? "transparent" : T.line}` }}>
              <input type="checkbox" checked={h.done} onChange={() => toggleHabit(i)} style={{ width: 19, height: 19, accentColor: T.ink, flexShrink: 0 }} />
              <span style={{ fontSize: 14.5, fontWeight: 600, textDecoration: h.done ? "line-through" : "none", color: h.done ? T.muted : T.text }}>{h.name}</span>
            </label>
          ))}
        </div>
      </Card>

      <TaskCalendar tasks={tasks} projects={projects} onAdd={addTask} onEdit={editTask} onToggle={toggleTask} />

      <TaskBoard tasks={tasks} projects={projects} onAdd={addTask} onEdit={editTask} onToggle={toggleTask} onDelete={delTask} maxList={420} />

      <Collapsible title="Câu hỏi cuối ngày" icon="🌙">{QA(EVENING_Q, evening, setEvening, "evening")}</Collapsible>
    </div>
  );
}
