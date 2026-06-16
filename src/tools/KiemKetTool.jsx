import React, { useEffect, useState } from "react";
import { T, R, fmt, todayKey } from "../lib/theme.js";
import { DENOMS, REASON_SUGGEST, PERSON_SUGGEST } from "../lib/config.js";
import { api } from "../lib/api.js";
import { Card, SectionTitle, QuoteBar, Btn, IconBtn, MoneyInput, SuggestChips, Stepper, Field, EmptyState, inputStyle } from "../components/ui.jsx";
import { KiotvietButton } from "../components/QuickLinks.jsx";

const nowLocal = () => { const d = new Date(); const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 16); };
const p2 = (n) => String(n).padStart(2, "0");
const fmtDateTime = (iso) => { if (!iso) return ""; const d = new Date(iso); if (isNaN(d)) return ""; return `${p2(d.getHours())}:${p2(d.getMinutes())} ${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`; };

export default function KiemKetTool({ quote, now, linkCfg, wide }) {
  const [tab, setTab] = useState("dem");
  const [counts, setCounts] = useState(Object.fromEntries(DENOMS.map((d) => [d, ""])));
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ type: "chi", amount: "", reason: "", person: "", time: nowLocal() });
  const [editId, setEditId] = useState(null);
  const [startDate, setStartDate] = useState(todayKey(now));
  const [endDate, setEndDate] = useState(todayKey(now));
  const [kiotviet, setKiotviet] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.getKiemKet().then((d) => { if (!d) return; if (d.counts) setCounts(d.counts); if (d.entries) setEntries(d.entries); if (d.startDate) setStartDate(d.startDate); if (d.endDate) setEndDate(d.endDate); if (d.kiotviet != null) setKiotviet(String(d.kiotviet)); }); }, []);

  const tongKet = DENOMS.reduce((s, d) => s + d * (parseInt(counts[d]) || 0), 0);
  const totalThu = entries.filter((e) => e.type === "thu").reduce((s, e) => s + e.amount, 0);
  const totalChi = entries.filter((e) => e.type === "chi").reduce((s, e) => s + e.amount, 0);
  const netThuChi = totalThu - totalChi;
  const tongKetVaThuChi = tongKet - netThuChi;
  const ketQua = tongKetVaThuChi - (parseFloat(kiotviet) || 0) - 1000000;

  const sync = (next) => api.saveKiemKet({ counts, entries, startDate, endDate, kiotviet, ...next });
  const setCountsSync = (fn) => setCounts((p) => { const n = typeof fn === "function" ? fn(p) : fn; sync({ counts: n }); return n; });
  const setEntriesSync = (fn) => setEntries((p) => { const n = typeof fn === "function" ? fn(p) : fn; sync({ entries: n }); return n; });

  const submitEntry = () => {
    const amt = parseFloat(form.amount); if (!amt) return;
    if (editId) setEntriesSync((p) => p.map((e) => (e.id === editId ? { ...e, type: form.type, amount: amt, reason: form.reason, person: form.person, time: form.time } : e)));
    else setEntriesSync((p) => [...p, { id: Date.now(), type: form.type, amount: amt, reason: form.reason, person: form.person, time: form.time }]);
    setEditId(null); setForm({ type: form.type, amount: "", reason: "", person: "", time: nowLocal() });
  };
  const editEntry = (e) => { setEditId(e.id); setForm({ type: e.type, amount: String(e.amount), reason: e.reason, person: e.person, time: e.time || nowLocal() }); setTab("thuchi"); };

  const saveNotion = async () => { setSaving(true); setSaved(false); await api.saveKiemKet({ counts, entries, startDate, endDate, kiotviet, commit: true, summary: { tongKet, netThuChi, tongKetVaThuChi, ketQua } }); setSaving(false); setSaved(true); };

  const resetAll = () => {
    if (!window.confirm("Xoá hết dữ liệu kiểm két hiện tại và bắt đầu phiên mới?")) return;
    const c = Object.fromEntries(DENOMS.map((d) => [d, ""]));
    const t = todayKey(now);
    setCounts(c); setEntries([]); setStartDate(t); setEndDate(t); setKiotviet(""); setEditId(null);
    setForm({ type: "chi", amount: "", reason: "", person: "", time: nowLocal() });
    setSaved(false);
    api.saveKiemKet({ counts: c, entries: [], startDate: t, endDate: t, kiotviet: "" });
    setTab("dem");
  };

  const TabBtn = ({ id, label }) => (<button onClick={() => setTab(id)} className="press" style={{ flex: 1, minWidth: 0, padding: "10px 0", borderRadius: R.ctrl, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 14, background: tab === id ? `linear-gradient(135deg,${T.ink},${T.inkDeep})` : "transparent", color: tab === id ? "#fff" : T.muted }}>{label}</button>);
  const Row = ({ label, value, strong, color }) => (<div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px dashed ${T.line}` }}><span style={{ color: T.muted, fontSize: 14, fontWeight: strong ? 800 : 600 }}>{label}</span><span style={{ fontWeight: strong ? 900 : 700, fontSize: strong ? 17 : 15, color: color || T.text }}>{fmt(value)} đ</span></div>);

  /* ===================== 3 phần dùng chung ===================== */
  const demSection = (
    <Card>
      <SectionTitle icon="kiemket" right={<span style={{ fontWeight: 900, color: T.ink }}>{fmt(tongKet)} đ</span>}>Đếm tiền trong két</SectionTitle>
      <div style={{ display: "grid", gap: 8 }}>
        {DENOMS.map((d) => { const q = parseInt(counts[d]) || 0; return (
          <div key={d} style={{ display: "grid", gridTemplateColumns: "1fr 132px 1.1fr", gap: 8, alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>{fmt(d)}</span>
            <Stepper value={counts[d]} onChange={(v) => setCountsSync((p) => ({ ...p, [d]: v }))} />
            <span style={{ textAlign: "right", fontWeight: 700, color: q ? T.ink : T.faint }}>{fmt(d * q)} đ</span>
          </div>); })}
      </div>
      <div style={{ marginTop: 14, padding: 14, borderRadius: R.ctrl, background: T.inkSoft, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 800, color: T.inkDeep }}>Tổng tiền trong két</span><span style={{ fontWeight: 900, fontSize: 20, color: T.inkDeep }}>{fmt(tongKet)} đ</span>
      </div>
    </Card>
  );

  const thuChiSection = (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <SectionTitle>{editId ? "Sửa khoản" : "Nhập thu / chi"}</SectionTitle>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {["thu", "chi"].map((tp) => (<button key={tp} onClick={() => setForm((f) => ({ ...f, type: tp }))} className="press" style={{ flex: 1, minWidth: 0, padding: 11, borderRadius: R.ctrl, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 800, background: form.type === tp ? (tp === "thu" ? T.success : T.danger) : T.surfaceAlt, color: form.type === tp ? "#fff" : T.muted }}>{tp === "thu" ? "Thu" : "Chi"}</button>))}
        </div>
        <div style={{ display: "grid", gap: 9 }}>
          <MoneyInput placeholder="Số tiền" value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} />
          <SuggestChips items={REASON_SUGGEST} active={form.reason} onPick={(v) => setForm((f) => ({ ...f, reason: v }))} />
          <input style={inputStyle} placeholder="Lý do thu / chi" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          <input style={inputStyle} placeholder="Người nhận / người nộp" value={form.person} onChange={(e) => setForm((f) => ({ ...f, person: e.target.value }))} />
          <SuggestChips items={PERSON_SUGGEST} active={form.person} onPick={(v) => setForm((f) => ({ ...f, person: v }))} />
          <Field label="Ngày giờ">
            <input type="datetime-local" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} style={inputStyle} />
          </Field>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={submitEntry} variant="accent" style={{ flex: 1 }}>{editId ? "Lưu chỉnh sửa" : "Thêm khoản"}</Btn>
            {editId && <Btn onClick={() => { setEditId(null); setForm({ type: "chi", amount: "", reason: "", person: "", time: nowLocal() }); }} variant="ghost">Huỷ</Btn>}
          </div>
        </div>
      </Card>
      <Card>
        <SectionTitle right={<span style={{ fontWeight: 900, color: netThuChi >= 0 ? T.success : T.danger }}>{fmt(netThuChi)} đ</span>}>Danh sách hôm nay</SectionTitle>
        <div style={{ display: "grid", gap: 8 }}>
          {entries.length === 0 && <EmptyState>Chưa có khoản nào.</EmptyState>}
          {entries.map((e) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: R.ctrl, background: editId === e.id ? T.grainSoft : T.surfaceAlt, border: `1px solid ${T.line}` }}>
              <span style={{ width: 7, height: 36, borderRadius: 4, background: e.type === "thu" ? T.success : T.danger, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                  <span style={{ flex: "1 1 auto", minWidth: 0, fontWeight: 700, fontSize: 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.reason || (e.type === "thu" ? "Khoản thu" : "Khoản chi")}</span>
                  {e.person && <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: T.soil, whiteSpace: "nowrap" }}>{e.person}</span>}
                </div>
                <div style={{ fontSize: 12.5, color: T.faint, marginTop: 2 }}>{fmtDateTime(e.time)}</div>
              </div>
              <span style={{ flexShrink: 0, fontWeight: 800, whiteSpace: "nowrap", color: e.type === "thu" ? T.success : T.danger }}>{e.type === "thu" ? "+" : "−"}{fmt(e.amount)}</span>
              <IconBtn icon="edit" onClick={() => editEntry(e)} title="Sửa" color={T.ink} size={16} />
              <IconBtn icon="trash" onClick={() => setEntriesSync((p) => p.filter((x) => x.id !== e.id))} title="Xoá" color={T.danger} size={16} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 13, color: T.muted, fontWeight: 600 }}>
          <span>Tổng thu: <b style={{ color: T.success }}>{fmt(totalThu)}</b></span><span>Tổng chi: <b style={{ color: T.danger }}>{fmt(totalChi)}</b></span>
        </div>
      </Card>
    </div>
  );

  const ketQuaSection = (
    <Card>
      <SectionTitle icon="tinhlai">Kết quả kiểm két</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <Field label="Ngày bắt đầu"><input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); sync({ startDate: e.target.value }); }} style={inputStyle} /></Field>
        <Field label="Ngày kết két"><input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); sync({ endDate: e.target.value }); }} style={inputStyle} /></Field>
      </div>
      <Row label="Tổng tiền trong két" value={tongKet} />
      <Row label="Tổng thu chi (thu − chi)" value={netThuChi} color={netThuChi >= 0 ? T.success : T.danger} />
      <Row label="Tổng két và thu chi" value={tongKetVaThuChi} strong color={T.ink} />
      <div style={{ margin: "14px 0 6px" }}>
        <Field label="Số tiền báo cáo trên KiotViet">
          <MoneyInput placeholder="Nhập số tiền báo cáo" value={kiotviet} onChange={(v) => { setKiotviet(v); sync({ kiotviet: v }); }} />
        </Field>
      </div>
      <div style={{ marginBottom: 6 }}><KiotvietButton cfg={linkCfg} /></div>
      <div style={{ marginTop: 14, padding: 16, borderRadius: R.card, background: ketQua === 0 ? T.inkSoft : T.grainSoft, textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.soil }}>KẾT QUẢ ( Tổng két và thu chi − báo cáo − 1.000.000 )</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: ketQua >= 0 ? T.inkDeep : T.danger, marginTop: 2 }}>{fmt(ketQua)} đ</div>
      </div>
      <Btn onClick={saveNotion} disabled={saving} full style={{ marginTop: 14 }}>{saving ? "Đang lưu..." : saved ? "✓ Đã lưu vào @Kiểm Két" : "Lưu vào Notion @Kiểm Két"}</Btn>
      <Btn onClick={resetAll} variant="danger" full style={{ marginTop: 10 }}>↺ Reset · bắt đầu phiên mới</Btn>
    </Card>
  );

  /* ===================== DESKTOP: 3 cột dàn ngang ===================== */
  if (wide) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <QuoteBar quote={quote} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.12fr 1fr", gap: 16, alignItems: "start" }}>
          {demSection}
          {thuChiSection}
          {ketQuaSection}
        </div>
      </div>
    );
  }

  /* ===================== MOBILE: theo tab ===================== */
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <QuoteBar quote={quote} />
      <div style={{ display: "flex", gap: 6, background: T.surface, padding: 6, borderRadius: R.card, border: `1px solid ${T.line}`, boxShadow: T.shadowSm }}>
        <TabBtn id="dem" label="Đếm Két" /><TabBtn id="thuchi" label="Thu Chi" /><TabBtn id="ketqua" label="Kết Quả" />
      </div>
      {tab === "dem" && demSection}
      {tab === "thuchi" && thuChiSection}
      {tab === "ketqua" && ketQuaSection}
    </div>
  );
}
