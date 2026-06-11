import React, { useEffect, useState } from "react";
import { T, WEEKDAYS, todayKey } from "../lib/theme.js";
import { lunarLabel } from "../lib/lunar.js";
import { NGAY_HABITS, MORNING_Q, EVENING_Q } from "../lib/config.js";
import { api } from "../lib/api.js";
import { Card, SectionTitle, QuoteBar, SunArc, Collapsible, Btn, inputStyle } from "../components/ui.jsx";

export default function TasksTool({ quote, now }) {
  const dk = todayKey(now);
  const [habits, setHabits] = useState(NGAY_HABITS.map((h) => ({ name: h, done: false })));
  const [morning, setMorning] = useState(MORNING_Q.map(() => ""));
  const [evening, setEvening] = useState(EVENING_Q.map(() => ""));
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    api.getNgay(dk).then((d) => {
      if (!d) return;
      if (d.habits) setHabits(NGAY_HABITS.map((h) => ({ name: h, done: !!d.habits[h] })));
      if (d.morning) setMorning(MORNING_Q.map((_, i) => d.morning[i] || ""));
      if (d.evening) setEvening(EVENING_Q.map((_, i) => d.evening[i] || ""));
    });
    api.getTasks().then((t) => Array.isArray(t) && setTasks(t));
  }, [dk]);

  const taskPct = tasks.length ? (tasks.filter((t) => t.done).length / tasks.length) * 100 : 0;
  const habitPct = habits.length ? (habits.filter((h) => h.done).length / habits.length) * 100 : 0;

  const toggleHabit = (i) => setHabits((p) => { const n = p.map((x, j) => (j === i ? { ...x, done: !x.done } : x)); api.tickHabit(dk, n[i].name, n[i].done); return n; });
  const addTask = async () => { if (!newTask.trim()) return; const t = await api.addTask(newTask.trim()); setTasks((p) => [...p, t || { id: Date.now(), name: newTask.trim(), done: false }]); setNewTask(""); };
  const toggleTask = (id) => setTasks((p) => { const n = p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)); const t = n.find((x) => x.id === id); api.toggleTask(id, t.done); return n; });
  const delTask = (id) => { setTasks((p) => p.filter((t) => t.id !== id)); api.deleteTask(id); };

  const QA = (qs, arr, set, kind) => (
    <div style={{ display: "grid", gap: 12 }}>
      {qs.map((q, i) => (
        <div key={i}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5, color: T.text }}>{q}</div>
          <textarea value={arr[i]} rows={2} placeholder="..." style={{ ...inputStyle, resize: "vertical" }}
            onChange={(e) => set((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
            onBlur={() => api.saveAnswers(dk, kind, arr)} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <QuoteBar quote={quote} />
      <Card>
        <div style={{ fontSize: 13, color: T.textMute, fontWeight: 600 }}>{WEEKDAYS[now.getDay()]}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>Ngày {now.getDate()} tháng {now.getMonth() + 1} năm {now.getFullYear()}</div>
        <div style={{ fontSize: 13, color: T.accent, fontWeight: 700, marginTop: 2 }}>{lunarLabel(now)}</div>
      </Card>
      <SunArc pct={taskPct} />
      <Card>
        <SectionTitle right={<span style={{ fontWeight: 900, color: T.primary }}>{Math.round(habitPct)}%</span>}>Thói Quen % (như cột @Ngày)</SectionTitle>
        <div style={{ height: 12, borderRadius: 8, background: T.bgDeep, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${habitPct}%`, background: `linear-gradient(90deg,${T.accent},${T.primary})`, transition: ".3s" }} />
        </div>
      </Card>
      <Collapsible title="🌅 Câu hỏi đầu ngày">{QA(MORNING_Q, morning, setMorning, "morning")}</Collapsible>
      <Card>
        <SectionTitle>Thói quen mỗi ngày · @Ngày</SectionTitle>
        <div style={{ display: "grid", gap: 8 }}>
          {habits.map((h, i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, background: h.done ? T.primarySoft : T.surfaceAlt, cursor: "pointer", border: `1px solid ${T.border}` }}>
              <input type="checkbox" checked={h.done} onChange={() => toggleHabit(i)} style={{ width: 18, height: 18, accentColor: T.primary }} />
              <span style={{ fontSize: 14.5, fontWeight: 600, textDecoration: h.done ? "line-through" : "none", color: h.done ? T.textMute : T.text }}>{h.name}</span>
            </label>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle>Nhiệm vụ · @Nhiệm Vụ</SectionTitle>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="Thêm nhiệm vụ..." style={inputStyle} />
          <Btn onClick={addTask} variant="accent">＋</Btn>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {tasks.length === 0 && <div style={{ color: T.textMute, fontSize: 14, textAlign: "center", padding: 8 }}>Chưa có nhiệm vụ.</div>}
          {tasks.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, background: t.done ? T.primarySoft : T.surfaceAlt, border: `1px solid ${T.border}` }}>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ width: 18, height: 18, accentColor: T.primary }} />
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.textMute : T.text }}>{t.name}</span>
              <button onClick={() => delTask(t.id)} style={{ border: "none", background: "transparent", color: T.danger, cursor: "pointer", fontWeight: 800 }}>✕</button>
            </div>
          ))}
        </div>
      </Card>
      <Collapsible title="🌙 Câu hỏi cuối ngày">{QA(EVENING_Q, evening, setEvening, "evening")}</Collapsible>
    </div>
  );
}
