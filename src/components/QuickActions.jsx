import React, { useState } from "react";
import { T, R, FONT } from "../lib/theme.js";
import { REASON_SUGGEST, PERSON_SUGGEST, NOTE_TAGS } from "../lib/config.js";
import { api } from "../lib/api.js";
import { Btn, Modal, MoneyInput, SuggestChips, inputStyle } from "./ui.jsx";
import { Icon } from "./icons.jsx";

const nowLocal = () => { const d = new Date(); const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 16); };

// onAddTask(name): thêm nhiệm vụ (do trang chủ quản lý để danh sách cập nhật ngay)
export default function QuickActions({ onAddTask }) {
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [chi, setChi] = useState({ amount: "", reason: "", person: "" });
  const [taskName, setTaskName] = useState("");
  const [note, setNote] = useState({ text: "", tag: NOTE_TAGS[0] });

  const close = () => setModal(null);
  const flash = (m) => { setOkMsg(m); setTimeout(() => setOkMsg(""), 1800); };

  const saveChi = async () => {
    const amt = parseFloat(chi.amount); if (!amt) return;
    setBusy(true);
    const cur = (await api.getKiemKet()) || {};
    const entry = { id: Date.now(), type: "chi", amount: amt, reason: chi.reason, person: chi.person, time: nowLocal() };
    await api.saveKiemKet({ ...cur, entries: [...(cur.entries || []), entry] });
    setBusy(false); setChi({ amount: "", reason: "", person: "" }); close(); flash("Đã thêm phiếu chi vào Kiểm Két");
  };
  const saveTask = async () => {
    const n = taskName.trim(); if (!n) return;
    setBusy(true); await onAddTask(n); setBusy(false); setTaskName(""); close(); flash("Đã thêm nhiệm vụ");
  };
  const saveNote = async () => {
    const t = note.text.trim(); if (!t) return;
    setBusy(true);
    const cur = (await api.getNotes()) || [];
    const item = { id: Date.now(), text: t, tag: note.tag, time: new Date().toISOString(), pinned: false };
    await api.saveNotes([item, ...(Array.isArray(cur) ? cur : [])]);
    setBusy(false); setNote({ text: "", tag: NOTE_TAGS[0] }); close(); flash("Đã thêm ghi chú");
  };

  const ACTIONS = [
    { id: "chi", icon: "kiemket", label: "Thêm phiếu chi", tint: T.danger },
    { id: "task", icon: "tasks", label: "Thêm nhiệm vụ", tint: T.ink },
    { id: "note", icon: "notes", label: "Thêm ghi chú", tint: T.grainDeep },
  ];

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {ACTIONS.map((a) => (
          <button key={a.id} onClick={() => setModal(a.id)} className="lift press"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "11px 8px", borderRadius: R.ctrl, border: `1px solid ${T.line}`, background: T.surface, cursor: "pointer", fontFamily: FONT, boxShadow: T.shadowSm }}>
            <span style={{ position: "relative", width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: T.inkSoft, color: a.tint }}>
              <Icon name={a.icon} size={20} />
              <span style={{ position: "absolute", right: -4, bottom: -4, width: 16, height: 16, borderRadius: "50%", background: a.tint, color: "#fff", display: "grid", placeItems: "center", border: `2px solid ${T.surface}` }}><Icon name="plus" size={10} /></span>
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.text, textAlign: "center", lineHeight: 1.2 }}>{a.label}</span>
          </button>
        ))}
      </div>
      {okMsg && <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700, color: T.success, textAlign: "center" }}>✓ {okMsg}</div>}

      <Modal open={modal === "chi"} title="Thêm phiếu chi" onClose={close}>
        <div style={{ display: "grid", gap: 10 }}>
          <MoneyInput placeholder="Số tiền chi" value={chi.amount} onChange={(v) => setChi((f) => ({ ...f, amount: v }))} />
          <input style={inputStyle} placeholder="Lý do chi" value={chi.reason} onChange={(e) => setChi((f) => ({ ...f, reason: e.target.value }))} />
          <SuggestChips items={REASON_SUGGEST} active={chi.reason} onPick={(v) => setChi((f) => ({ ...f, reason: v }))} />
          <input style={inputStyle} placeholder="Người nhận (nếu có)" value={chi.person} onChange={(e) => setChi((f) => ({ ...f, person: e.target.value }))} />
          <SuggestChips items={PERSON_SUGGEST} active={chi.person} onPick={(v) => setChi((f) => ({ ...f, person: v }))} />
          <Btn variant="accent" full disabled={busy} onClick={saveChi}>{busy ? "Đang lưu..." : "Lưu phiếu chi"}</Btn>
        </div>
      </Modal>

      <Modal open={modal === "task"} title="Thêm nhiệm vụ" onClose={close}>
        <div style={{ display: "grid", gap: 10 }}>
          <input style={inputStyle} autoFocus placeholder="Tên nhiệm vụ..." value={taskName} onChange={(e) => setTaskName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveTask()} />
          <Btn variant="accent" full disabled={busy} onClick={saveTask}>{busy ? "Đang lưu..." : "Thêm nhiệm vụ"}</Btn>
        </div>
      </Modal>

      <Modal open={modal === "note"} title="Thêm ghi chú nhanh" onClose={close}>
        <div style={{ display: "grid", gap: 10 }}>
          <textarea rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} autoFocus placeholder="Ghi nhanh việc vừa làm..." value={note.text} onChange={(e) => setNote((f) => ({ ...f, text: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveNote(); }} />
          <SuggestChips items={NOTE_TAGS} active={note.tag} onPick={(v) => setNote((f) => ({ ...f, tag: v }))} />
          <Btn variant="accent" full disabled={busy} onClick={saveNote}>{busy ? "Đang lưu..." : "Thêm ghi chú"}</Btn>
        </div>
      </Modal>
    </>
  );
}
