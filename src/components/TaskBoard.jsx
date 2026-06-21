import React, { useState } from "react";
import { T, R, SERIF } from "../lib/theme.js";
import { projectColor } from "../lib/config.js";
import { Card, Btn, IconBtn, EmptyState, inputStyle } from "./ui.jsx";
import { Icon } from "./icons.jsx";
import TaskModal from "./TaskModal.jsx";

const todayD = () => new Date().toISOString().slice(0, 10);
const fmtD = (s) => { if (!s) return ""; const p = s.split("-"); return p.length >= 3 ? `${p[2]}/${p[1]}` : s; };
const fmtRange = (s, e) => (e && e !== s ? `${fmtD(s)} → ${fmtD(e)}` : fmtD(s));

export default function TaskBoard({ tasks, projects = [], onAdd, onEdit, onToggle, onDelete, maxList = 340, featured }) {
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [due, setDue] = useState(todayD());
  const [note, setNote] = useState("");
  const [edit, setEdit] = useState(null); // task đang sửa
  const [hideDone, setHideDone] = useState(false);
  const projName = (id) => projects.find((p) => p.id === id)?.name;

  const add = () => { const n = name.trim(); if (!n) return; onAdd(n, projectId || null, due || null, note.trim() || ""); setName(""); setNote(""); };
  const saveEdit = (fields) => { onEdit(edit.id, fields); setEdit(null); };
  const done = tasks.filter((t) => t.done).length;
  // việc xong xuống dưới (giữ thứ tự trong từng nhóm)
  const ordered = [...tasks].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
  const visible = hideDone ? ordered.filter((t) => !t.done) : ordered;

  const selStyle = { ...inputStyle, padding: "11px 10px" };

  return (
    <Card style={featured ? { borderTop: `3px solid ${T.grain}`, boxShadow: T.shadow } : undefined}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: T.inkSoft, color: T.ink, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="tasks" size={22} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: T.ink, lineHeight: 1.1 }}>Nhiệm vụ cần làm</div>
          <div style={{ fontSize: 12.5, color: T.muted, fontWeight: 600, marginTop: 1 }}>Việc trong ngày & theo dự án</div>
        </div>
        <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 800, color: T.inkDeep, background: T.inkSoft, padding: "5px 12px", borderRadius: 999 }}>{done}/{tasks.length}</span>
        {done > 0 && (
          <button onClick={() => setHideDone((v) => !v)} className="press" title={hideDone ? "Hiện việc đã xong" : "Ẩn việc đã xong"}
            style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 999, border: `1px solid ${T.line}`, background: T.surfaceAlt, color: T.muted, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12 }}>
            <Icon name={hideDone ? "eye" : "eyeOff"} size={15} /> {hideDone ? `Hiện (${done})` : "Ẩn đã xong"}
          </button>
        )}
      </div>

      {/* Thêm nhiệm vụ */}
      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Thêm việc cần làm..." style={inputStyle} />
        <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Ghi chú (không bắt buộc)" style={inputStyle} />
        <div style={{ display: "flex", gap: 8 }}>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ ...selStyle, flex: 1, minWidth: 0 }}>
            <option value="">— Dự án —</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} title="Ngày thực hiện" style={{ ...selStyle, width: 150, flexShrink: 0 }} />
          <Btn onClick={add} variant="accent" style={{ flexShrink: 0 }}><Icon name="plus" size={18} /></Btn>
        </div>
      </div>

      {/* Danh sách */}
      <div style={{ display: "grid", gap: 8, maxHeight: maxList, overflowY: "auto" }}>
        {visible.length === 0 && <EmptyState>{hideDone && tasks.length ? "Đã ẩn việc hoàn thành." : "Chưa có nhiệm vụ nào."}</EmptyState>}
        {visible.map((t) => {
          const pn = projName(t.projectId);
          const pc = projectColor(t.projectId) || T.line;
          return (
            <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "10px 12px 10px 13px", borderRadius: R.ctrl, background: t.done ? T.inkSoft : T.surfaceAlt, border: `1px solid ${t.done ? "transparent" : T.line}`, borderLeft: `4px solid ${pc}` }}>
              <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} style={{ width: 18, height: 18, accentColor: T.ink, flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.muted : T.text, wordBreak: "break-word" }}>{t.name}</span>
                {t.note && <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3, lineHeight: 1.4, wordBreak: "break-word" }}>{t.note}</div>}
                {(pn || t.due || t.doneDate) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5, alignItems: "center" }}>
                    {pn && <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: pc, padding: "2px 9px", borderRadius: 999 }}>{pn}</span>}
                    {t.due && <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, display: "inline-flex", alignItems: "center", gap: 3 }} title={t.dueEnd ? "Khoảng thực hiện" : "Ngày thực hiện"}><Icon name="calendar" size={12} /> {fmtRange(t.due, t.dueEnd)}</span>}
                    {t.doneDate && <span style={{ fontSize: 11, fontWeight: 700, color: T.success, display: "inline-flex", alignItems: "center", gap: 3 }} title="Ngày hoàn thành"><Icon name="check" size={12} /> {fmtD(t.doneDate)}</span>}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                <IconBtn icon="edit" onClick={() => setEdit({ id: t.id, name: t.name, projectId: t.projectId || "", due: t.due || "", dueEnd: t.dueEnd || "", note: t.note || "" })} title="Sửa" color={T.ink} size={16} />
                <IconBtn icon="trash" onClick={() => onDelete(t.id)} title="Xoá" color={T.danger} size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sửa nhiệm vụ */}
      <TaskModal open={!!edit} mode="edit" value={edit} projects={projects} onClose={() => setEdit(null)} onSubmit={saveEdit} />
    </Card>
  );
}
