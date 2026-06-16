import React, { useState } from "react";
import { T, R } from "../lib/theme.js";
import { Card, SectionTitle, Btn, IconBtn, EmptyState, inputStyle } from "./ui.jsx";
import { Icon } from "./icons.jsx";

const todayD = () => new Date().toISOString().slice(0, 10);
const fmtD = (s) => { if (!s) return ""; const p = s.split("-"); return p.length >= 3 ? `${p[2]}/${p[1]}` : s; };

// Bảng nhiệm vụ — thêm/bớt, chọn dự án + hạn, hiện ngày thực hiện & ngày hoàn thành
export default function TaskBoard({ tasks, projects = [], onAdd, onToggle, onDelete, maxList = 280 }) {
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [due, setDue] = useState(todayD());
  const projName = (id) => projects.find((p) => p.id === id)?.name;

  const add = () => { const n = name.trim(); if (!n) return; onAdd(n, projectId || null, due || null); setName(""); };
  const done = tasks.filter((t) => t.done).length;

  return (
    <Card>
      <SectionTitle icon="check" right={<span style={{ fontWeight: 800, color: T.muted, fontSize: 12.5 }}>{done}/{tasks.length}</span>}>Nhiệm vụ cần làm</SectionTitle>

      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Thêm việc cần làm..." style={inputStyle} />
        <div style={{ display: "flex", gap: 8 }}>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 0, padding: "11px 10px" }}>
            <option value="">— Dự án —</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} title="Ngày thực hiện" style={{ ...inputStyle, width: 150, flexShrink: 0, padding: "11px 10px" }} />
          <Btn onClick={add} variant="accent" style={{ flexShrink: 0 }}><Icon name="plus" size={18} /></Btn>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8, maxHeight: maxList, overflowY: "auto" }}>
        {tasks.length === 0 && <EmptyState>Chưa có nhiệm vụ nào.</EmptyState>}
        {tasks.map((t) => {
          const pn = projName(t.projectId);
          return (
            <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "10px 12px", borderRadius: R.ctrl, background: t.done ? T.inkSoft : T.surfaceAlt, border: `1px solid ${t.done ? "transparent" : T.line}` }}>
              <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} style={{ width: 18, height: 18, accentColor: T.ink, flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.muted : T.text, wordBreak: "break-word" }}>{t.name}</span>
                {(pn || t.due || t.doneDate) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5 }}>
                    {pn && <span style={{ fontSize: 11, fontWeight: 700, color: T.soil, background: T.grainSoft, padding: "2px 8px", borderRadius: 999 }}>{pn}</span>}
                    {t.due && <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "inline-flex", alignItems: "center", gap: 3 }} title="Ngày thực hiện"><Icon name="calendar" size={12} /> {fmtD(t.due)}</span>}
                    {t.doneDate && <span style={{ fontSize: 11, fontWeight: 700, color: T.success, display: "inline-flex", alignItems: "center", gap: 3 }} title="Ngày hoàn thành"><Icon name="check" size={12} /> {fmtD(t.doneDate)}</span>}
                  </div>
                )}
              </div>
              <IconBtn icon="trash" onClick={() => onDelete(t.id)} title="Xoá" color={T.danger} size={16} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
