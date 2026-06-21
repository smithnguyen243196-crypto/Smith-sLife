import React, { useEffect, useState } from "react";
import { T } from "../lib/theme.js";
import { Btn, Field, Modal, inputStyle } from "./ui.jsx";

const todayD = () => new Date().toISOString().slice(0, 10);
const selStyle = { ...inputStyle, padding: "11px 10px" };

// Modal dùng chung cho cả Thêm và Sửa nhiệm vụ.
// value = task ({id,name,note,projectId,due,dueEnd}) khi sửa, hoặc {due} gợi ý khi thêm.
export default function TaskModal({ open, mode = "edit", value, projects = [], onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [projectId, setProjectId] = useState("");
  const [due, setDue] = useState(todayD());
  const [dueEnd, setDueEnd] = useState("");
  const [multi, setMulti] = useState(false);

  useEffect(() => {
    if (!open) return;
    const v = value || {};
    setName(v.name || "");
    setNote(v.note || "");
    setProjectId(v.projectId || "");
    setDue(v.due || todayD());
    setDueEnd(v.dueEnd || "");
    setMulti(!!v.dueEnd);
  }, [open, value]);

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    const end = multi && dueEnd && dueEnd > due ? dueEnd : null;
    onSubmit({ name: n, note: note.trim(), projectId: projectId || null, due: due || todayD(), dueEnd: end });
  };

  return (
    <Modal open={open} title={mode === "add" ? "Thêm nhiệm vụ" : "Sửa nhiệm vụ"} onClose={onClose}>
      <div style={{ display: "grid", gap: 11 }}>
        <input style={inputStyle} placeholder="Tên nhiệm vụ" value={name} autoFocus
          onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()} />
        <Field label="Ghi chú">
          <textarea rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} placeholder="Ghi chú..."
            value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Field label="Dự án">
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={selStyle}>
            <option value="">— Dự án —</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>

        <div style={{ display: "flex", gap: 10 }}>
          <Field label={multi ? "Bắt đầu" : "Ngày thực hiện"}>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={inputStyle} />
          </Field>
          {multi && (
            <Field label="Kết thúc">
              <input type="date" value={dueEnd} min={due} onChange={(e) => setDueEnd(e.target.value)} style={inputStyle} />
            </Field>
          )}
        </div>

        <label className="press" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13.5, fontWeight: 700, color: T.muted, cursor: "pointer" }}>
          <input type="checkbox" checked={multi} onChange={(e) => { setMulti(e.target.checked); if (e.target.checked && !dueEnd) setDueEnd(due); }}
            style={{ width: 17, height: 17, accentColor: T.ink }} />
          Việc kéo dài nhiều ngày
        </label>

        <div style={{ display: "flex", gap: 9, marginTop: 2 }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Huỷ</Btn>
          <Btn variant="primary" onClick={submit} style={{ flex: 2 }}>{mode === "add" ? "Thêm" : "Lưu"}</Btn>
        </div>
      </div>
    </Modal>
  );
}
