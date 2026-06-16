import React, { useState } from "react";
import { T, R } from "../lib/theme.js";
import { Card, SectionTitle, Btn, IconBtn, EmptyState, inputStyle } from "./ui.jsx";
import { Icon } from "./icons.jsx";

// Bảng nhiệm vụ cần làm — trang chủ điều khiển dữ liệu, thao tác thêm/bớt/đánh dấu tại chỗ
export default function TaskBoard({ tasks, onAdd, onToggle, onDelete, maxList = 260 }) {
  const [name, setName] = useState("");
  const add = () => { const n = name.trim(); if (!n) return; onAdd(n); setName(""); };
  const done = tasks.filter((t) => t.done).length;

  return (
    <Card>
      <SectionTitle icon="check" right={<span style={{ fontWeight: 800, color: T.muted, fontSize: 12.5 }}>{done}/{tasks.length}</span>}>Nhiệm vụ cần làm</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Thêm việc cần làm..." style={inputStyle} />
        <Btn onClick={add} variant="accent"><Icon name="plus" size={18} /></Btn>
      </div>
      <div style={{ display: "grid", gap: 8, maxHeight: maxList, overflowY: "auto" }}>
        {tasks.length === 0 && <EmptyState>Chưa có nhiệm vụ nào.</EmptyState>}
        {tasks.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: R.ctrl, background: t.done ? T.inkSoft : T.surfaceAlt, border: `1px solid ${t.done ? "transparent" : T.line}` }}>
            <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} style={{ width: 18, height: 18, accentColor: T.ink, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.muted : T.text, wordBreak: "break-word" }}>{t.name}</span>
            <IconBtn icon="trash" onClick={() => onDelete(t.id)} title="Xoá" color={T.danger} size={16} />
          </div>
        ))}
      </div>
    </Card>
  );
}
