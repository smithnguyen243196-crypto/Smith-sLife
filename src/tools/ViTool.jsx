import React, { useEffect, useState } from "react";
import { T, R, fmt, todayKey } from "../lib/theme.js";
import { VI_CATEGORIES } from "../lib/config.js";
import { api } from "../lib/api.js";
import { Card, SectionTitle, QuoteBar, Btn, IconBtn, MoneyInput, EmptyState, inputStyle } from "../components/ui.jsx";

export default function ViTool({ quote }) {
  const [txs, setTxs] = useState([]);
  const [form, setForm] = useState({ type: "chi", account: "Tiền mặt", amount: "", category: "Ăn uống", note: "" });
  useEffect(() => { api.getVi().then((t) => Array.isArray(t) && setTxs(t)); }, []);

  const bal = (acc) => txs.filter((t) => t.account === acc).reduce((s, t) => s + (t.type === "thu" ? t.amount : -t.amount), 0);
  const bank = bal("Ngân hàng"), cash = bal("Tiền mặt"), total = bank + cash;

  const add = async () => { const amt = parseFloat(form.amount); if (!amt) return; const base = { ...form, amount: amt, date: todayKey() }; const saved = await api.addVi(base); setTxs((p) => [saved || { id: Date.now(), ...base }, ...p]); setForm({ type: form.type, account: form.account, amount: "", category: form.category, note: "" }); };
  const del = (id) => { setTxs((p) => p.filter((x) => x.id !== id)); api.deleteVi(id); };

  const Pill = ({ label, active, onClick }) => (<button onClick={onClick} className="press" style={{ flex: 1, minWidth: 0, padding: 10, borderRadius: R.ctrl, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", background: active ? `linear-gradient(135deg,${T.ink},${T.inkDeep})` : T.surfaceAlt, color: active ? "#fff" : T.muted }}>{label}</button>);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <QuoteBar quote={quote} />
      <Card style={{ background: `linear-gradient(140deg,${T.inkDeep},${T.ink})`, color: "#fff", border: "none", boxShadow: T.shadow }}>
        <div style={{ fontSize: 12, opacity: .82, fontWeight: 700, letterSpacing: ".1em" }}>TỔNG TÀI SẢN</div>
        <div style={{ fontSize: 32, fontWeight: 900, marginTop: 2 }}>{fmt(total)} đ</div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <div style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,.14)", borderRadius: R.ctrl, padding: "10px 13px" }}><div style={{ fontSize: 12, opacity: .82 }}>🏦 Ngân hàng</div><div style={{ fontWeight: 800, fontSize: 16 }}>{fmt(bank)} đ</div></div>
          <div style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,.14)", borderRadius: R.ctrl, padding: "10px 13px" }}><div style={{ fontSize: 12, opacity: .82 }}>💵 Tiền mặt</div><div style={{ fontWeight: 800, fontSize: 16 }}>{fmt(cash)} đ</div></div>
        </div>
      </Card>
      <Card>
        <SectionTitle icon="vi">Ghi giao dịch</SectionTitle>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <Pill label="Thu" active={form.type === "thu"} onClick={() => setForm((f) => ({ ...f, type: "thu" }))} />
          <Pill label="Chi" active={form.type === "chi"} onClick={() => setForm((f) => ({ ...f, type: "chi" }))} />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 9 }}>
          <Pill label="🏦 Ngân hàng" active={form.account === "Ngân hàng"} onClick={() => setForm((f) => ({ ...f, account: "Ngân hàng" }))} />
          <Pill label="💵 Tiền mặt" active={form.account === "Tiền mặt"} onClick={() => setForm((f) => ({ ...f, account: "Tiền mặt" }))} />
        </div>
        <div style={{ display: "grid", gap: 9 }}>
          <MoneyInput placeholder="Số tiền" value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} />
          <div style={{ fontSize: 12.5, color: T.muted, fontWeight: 700 }}>Phân loại</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {VI_CATEGORIES.map((c) => (<button key={c} onClick={() => setForm((f) => ({ ...f, category: c }))} className="press" style={{ padding: "7px 13px", borderRadius: R.pill, border: `1px solid ${form.category === c ? T.grain : T.line}`, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, background: form.category === c ? T.grainSoft : T.surfaceAlt, color: form.category === c ? T.soil : T.muted }}>{c}</button>))}
          </div>
          <input style={inputStyle} placeholder="Ghi chú" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          <Btn onClick={add} variant="accent">Thêm giao dịch</Btn>
        </div>
      </Card>
      <Card>
        <SectionTitle>Lịch sử</SectionTitle>
        <div style={{ display: "grid", gap: 8 }}>
          {txs.length === 0 && <EmptyState>Chưa có giao dịch.</EmptyState>}
          {txs.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: R.ctrl, background: T.surfaceAlt, border: `1px solid ${T.line}` }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: T.soil, background: T.grainSoft, padding: "3px 9px", borderRadius: R.pill, whiteSpace: "nowrap", flexShrink: 0 }}>{t.category}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.note || (t.type === "thu" ? "Khoản thu" : "Khoản chi")}</div>
                <div style={{ fontSize: 12.5, color: T.faint }}>{t.account} · {t.date}</div>
              </div>
              <span style={{ fontWeight: 800, color: t.type === "thu" ? T.success : T.danger, whiteSpace: "nowrap", flexShrink: 0 }}>{t.type === "thu" ? "+" : "−"}{fmt(t.amount)}</span>
              <IconBtn icon="trash" onClick={() => del(t.id)} title="Xoá" color={T.danger} size={16} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
