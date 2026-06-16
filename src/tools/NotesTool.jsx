import React, { useEffect, useState } from "react";
import { T, R, FONT } from "../lib/theme.js";
import { NOTE_TAGS } from "../lib/config.js";
import { api } from "../lib/api.js";
import { Card, SectionTitle, QuoteBar, Btn, IconBtn, SuggestChips, EmptyState, SavedTag, inputStyle } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";

const stamp = (iso) => {
  if (!iso) return "";
  const d = new Date(iso); if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} · ${p(d.getDate())}/${p(d.getMonth() + 1)}`;
};
const TAG_COLOR = { "Cửa hàng": T.ink, "Đồng ruộng": T.leaf, "Khách hàng": T.grain, "Ý tưởng": T.soil, "Cá nhân": T.muted };

export default function NotesTool({ quote }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [tag, setTag] = useState("Cửa hàng");
  const [filter, setFilter] = useState("Tất cả");
  const [editId, setEditId] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.getNotes().then((n) => Array.isArray(n) && setNotes(n)); }, []);

  // luôn lưu nguyên danh sách lên Upstash (đồng bộ tức thì)
  const persist = (next) => { setNotes(next); api.saveNotes(next); setSaved(true); setTimeout(() => setSaved(false), 1500); };

  const submit = () => {
    const t = text.trim(); if (!t) return;
    if (editId) persist(notes.map((n) => (n.id === editId ? { ...n, text: t, tag } : n)));
    else persist([{ id: Date.now(), text: t, tag, time: new Date().toISOString(), pinned: false }, ...notes]);
    setText(""); setEditId(null);
  };
  const startEdit = (n) => { setEditId(n.id); setText(n.text); setTag(n.tag || "Cửa hàng"); };
  const cancelEdit = () => { setEditId(null); setText(""); };
  const del = (id) => { persist(notes.filter((n) => n.id !== id)); if (editId === id) cancelEdit(); };
  const togglePin = (id) => persist(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));

  const shown = notes
    .filter((n) => filter === "Tất cả" || n.tag === filter)
    .slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <QuoteBar quote={quote} />

      <Card>
        <SectionTitle icon="notes" right={<SavedTag show={saved} />}>{editId ? "Sửa ghi chú" : "Tôi vừa làm gì?"}</SectionTitle>
        <textarea
          value={text} rows={3} autoFocus={!!editId}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
          placeholder="Ghi nhanh việc vừa làm, quan sát đồng ruộng, lời dặn khách..."
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
        <div style={{ margin: "10px 0 12px" }}>
          <SuggestChips items={NOTE_TAGS} active={tag} onPick={setTag} />
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Btn variant="accent" onClick={submit} style={{ flex: 1 }}>
            <Icon name={editId ? "check" : "plus"} size={17} /> {editId ? "Lưu thay đổi" : "Thêm ghi chú"}
          </Btn>
          {editId && <Btn variant="ghost" onClick={cancelEdit}>Huỷ</Btn>}
        </div>
        <div style={{ fontSize: 11.5, color: T.faint, marginTop: 8 }}>Mẹo: nhấn Ctrl/⌘ + Enter để lưu nhanh.</div>
      </Card>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <SuggestChips items={["Tất cả", ...NOTE_TAGS]} active={filter} onPick={setFilter} />
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {shown.length === 0 && <Card><EmptyState>Chưa có ghi chú nào.</EmptyState></Card>}
        {shown.map((n) => {
          const c = TAG_COLOR[n.tag] || T.muted;
          return (
            <Card key={n.id} style={{ padding: 14, borderLeft: `4px solid ${c}`, background: n.pinned ? T.grainSoft + "66" : T.surface }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  {n.tag && <span style={{ fontSize: 11, fontWeight: 800, color: c, background: `${c}1A`, padding: "3px 9px", borderRadius: R.pill, whiteSpace: "nowrap" }}>{n.tag}</span>}
                  <span style={{ fontSize: 12, color: T.faint, fontWeight: 600 }}>{stamp(n.time)}</span>
                </span>
                <span style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  <IconBtn icon="pin" onClick={() => togglePin(n.id)} title={n.pinned ? "Bỏ ghim" : "Ghim"} color={n.pinned ? T.grain : T.faint} size={16} />
                  <IconBtn icon="edit" onClick={() => startEdit(n)} title="Sửa" color={T.ink} size={16} />
                  <IconBtn icon="trash" onClick={() => del(n.id)} title="Xoá" color={T.danger} size={16} />
                </span>
              </div>
              <div style={{ fontSize: 14.5, color: T.text, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: FONT }}>{n.text}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
