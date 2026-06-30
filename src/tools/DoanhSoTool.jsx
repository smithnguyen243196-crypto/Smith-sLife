import React, { useEffect, useMemo, useState } from "react";
import { T, R, FONT, fmt, todayKey } from "../lib/theme.js";
import { SALES_STAFF, SALES_STAFF_COLORS } from "../lib/config.js";
import { api } from "../lib/api.js";
import { Card, SectionTitle, QuoteBar, Btn, IconBtn, Field, inputStyle, EmptyState, SavedTag } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";

const num = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };
const pct = (a, total) => (total > 0 ? Math.round((a / total) * 1000) / 10 : 0);
const shortDate = (s) => { const [, m, d] = s.split("-"); return `${d}/${m}`; };
const addDays = (s, n) => { const d = new Date(s + "T00:00:00"); d.setDate(d.getDate() + n); return todayKey(d); };

function NumberInput({ value, onChange, placeholder }) {
  return (
    <input inputMode="numeric" style={{ ...inputStyle, fontWeight: 800, fontSize: 16, textAlign: "right" }}
      placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))} />
  );
}

const METRICS = [["total", "Tổng SP"], ["cc", "SP CC"], ["ss", "SP SS"]];

function SalesChart({ records, dates, metric }) {
  const w = 760, h = 230, padL = 34, padB = 28, padT = 14, padR = 8;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const get = (date, staff) => { const r = records.find((x) => x.date === date && x.staff === staff); return r ? num(r[metric]) : 0; };
  const maxVal = Math.max(1, ...dates.flatMap((d) => SALES_STAFF.map((s) => get(d, s))));
  const groupW = innerW / Math.max(1, dates.length);
  const barW = Math.min(16, (groupW - 10) / SALES_STAFF.length);
  const yTicks = [0, 0.5, 1].map((f) => Math.round(maxVal * f));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      {/* lưới ngang + nhãn trục y */}
      {yTicks.map((t, i) => {
        const y = padT + innerH * (1 - (i === 0 ? 0 : i === 1 ? 0.5 : 1));
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} stroke={T.lineSoft} strokeWidth="1" />
            <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10.5" fontWeight="700" fill="#9aa39a">{t}</text>
          </g>
        );
      })}
      {/* cột theo từng ngày */}
      {dates.map((d, gi) => {
        const gx = padL + gi * groupW + (groupW - barW * SALES_STAFF.length) / 2;
        return (
          <g key={d}>
            {SALES_STAFF.map((s, si) => {
              const v = get(d, s);
              const bh = (v / maxVal) * innerH;
              const x = gx + si * barW;
              const y = padT + innerH - bh;
              return <rect key={s} x={x} y={y} width={barW - 2} height={Math.max(0, bh)} rx="2.5" fill={SALES_STAFF_COLORS[s] || T.ink} opacity="0.92" />;
            })}
            <text x={padL + gi * groupW + groupW / 2} y={h - 8} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#9aa39a">{shortDate(d)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DoanhSoTool({ quote }) {
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(todayKey());
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [metric, setMetric] = useState("total");

  useEffect(() => { api.getDoanhSo().then((r) => Array.isArray(r) && setRecords(r)); }, []);

  useEffect(() => {
    const f = {};
    SALES_STAFF.forEach((s) => {
      const rec = records.find((r) => r.date === date && r.staff === s);
      f[s] = { cc: rec ? String(rec.cc) : "", ss: rec ? String(rec.ss) : "", total: rec ? String(rec.total) : "" };
    });
    setForm(f);
  }, [date, records]);

  const setField = (staff, key, val) => setForm((p) => ({ ...p, [staff]: { ...p[staff], [key]: val } }));

  const save = async () => {
    setBusy(true);
    const results = await Promise.all(SALES_STAFF.map((s) => {
      const cc = num(form[s]?.cc), ss = num(form[s]?.ss), total = num(form[s]?.total);
      return api.saveDoanhSo({ date, staff: s, cc, ss, total });
    }));
    setRecords((prev) => {
      const next = [...prev];
      results.forEach((rec) => {
        if (!rec) return;
        const idx = next.findIndex((x) => x.date === rec.date && x.staff === rec.staff);
        if (idx >= 0) next[idx] = rec; else next.push(rec);
      });
      return next;
    });
    setBusy(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(0), 1800);
  };

  const delRecord = (id) => { setRecords((p) => p.filter((x) => x.id !== id)); api.deleteDoanhSo(id); };

  const dayTotal = SALES_STAFF.reduce((s, st) => s + num(form[st]?.total), 0);

  // 14 ngày gần nhất có dữ liệu (hoặc 14 ngày gần đây tính từ hôm nay nếu chưa có gì)
  const dates = useMemo(() => {
    const have = Array.from(new Set(records.map((r) => r.date))).sort();
    if (have.length) return have.slice(-14);
    return Array.from({ length: 7 }).map((_, i) => addDays(todayKey(), i - 6));
  }, [records]);

  // lịch sử nhóm theo ngày, mới nhất trước
  const history = useMemo(() => {
    const byDate = {};
    records.forEach((r) => { (byDate[r.date] ||= []).push(r); });
    return Object.keys(byDate).sort().reverse().slice(0, 14).map((d) => ({ date: d, rows: byDate[d].sort((a, b) => a.staff.localeCompare(b.staff)) }));
  }, [records]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <QuoteBar quote={quote} />

      {/* Nhập doanh số cuối ngày */}
      <Card>
        <SectionTitle icon="report" right={<SavedTag show={!!savedAt} />}>Nhập doanh số cuối ngày</SectionTitle>
        <div style={{ marginBottom: 12, maxWidth: 220 }}>
          <Field label="Ngày">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.85fr 0.85fr 0.85fr 1fr", gap: 8, padding: "0 2px", fontSize: 11.5, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>
            <span>Nhân viên</span><span style={{ textAlign: "right" }}>SP CC</span><span style={{ textAlign: "right" }}>SP SS</span><span style={{ textAlign: "right" }}>Tổng SP</span><span style={{ textAlign: "right" }}>% CC · % SS</span>
          </div>
          {SALES_STAFF.map((s) => {
            const cc = num(form[s]?.cc), ss = num(form[s]?.ss), total = num(form[s]?.total);
            return (
              <div key={s} style={{ display: "grid", gridTemplateColumns: "1.1fr 0.85fr 0.85fr 0.85fr 1fr", gap: 8, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: SALES_STAFF_COLORS[s], flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s}</span>
                </div>
                <NumberInput value={form[s]?.cc || ""} onChange={(v) => setField(s, "cc", v)} placeholder="0" />
                <NumberInput value={form[s]?.ss || ""} onChange={(v) => setField(s, "ss", v)} placeholder="0" />
                <NumberInput value={form[s]?.total || ""} onChange={(v) => setField(s, "total", v)} placeholder="0" />
                <div style={{ textAlign: "right", fontSize: 12.5, fontWeight: 700, color: T.muted, whiteSpace: "nowrap" }}>{pct(cc, total)}% · {pct(ss, total)}%</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>Tổng cả ngày: <span style={{ color: T.ink, fontWeight: 900 }}>{fmt(dayTotal)}</span></div>
          <Btn variant="accent" disabled={busy} onClick={save}>{busy ? "Đang lưu..." : "Lưu doanh số"}</Btn>
        </div>
      </Card>

      {/* Biểu đồ */}
      <Card>
        <SectionTitle icon="report" right={
          <div style={{ display: "inline-flex", background: T.surfaceAlt, border: `1px solid ${T.line}`, borderRadius: 999, padding: 3 }}>
            {METRICS.map(([m, lb]) => (
              <button key={m} onClick={() => setMetric(m)} className="press"
                style={{ padding: "5px 12px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 12, fontWeight: 800, background: metric === m ? T.ink : "transparent", color: metric === m ? T.onInk : T.muted }}>{lb}</button>
            ))}
          </div>
        }>Biểu đồ doanh số</SectionTitle>
        {records.length === 0 ? (
          <EmptyState>Chưa có dữ liệu — nhập doanh số ở trên để xem biểu đồ.</EmptyState>
        ) : (
          <>
            <SalesChart records={records} dates={dates} metric={metric} />
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10, justifyContent: "center" }}>
              {SALES_STAFF.map((s) => (
                <div key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: T.muted }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: SALES_STAFF_COLORS[s] }} />{s}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Lịch sử */}
      <Card>
        <SectionTitle icon="calendar">Lịch sử nhập</SectionTitle>
        {history.length === 0 ? (
          <EmptyState>Chưa có bản ghi nào.</EmptyState>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {history.map(({ date: d, rows }) => (
              <div key={d} style={{ border: `1px solid ${T.line}`, borderRadius: R.ctrl, overflow: "hidden" }}>
                <button onClick={() => setDate(d)} className="press" title="Sửa ngày này"
                  style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: T.surfaceAlt, border: "none", cursor: "pointer", fontFamily: FONT }}>
                  <span style={{ fontWeight: 800, fontSize: 13.5, color: T.ink }}>{d}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: T.muted }}>Tổng: {fmt(rows.reduce((s, r) => s + num(r.total), 0))}</span>
                </button>
                <div style={{ display: "grid", gap: 1, background: T.lineSoft }}>
                  {rows.map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: T.surface }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: SALES_STAFF_COLORS[r.staff], flexShrink: 0 }} />
                      <span style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.staff}</span>
                      <span style={{ fontSize: 12.5, color: T.muted, fontWeight: 600 }}>CC {fmt(r.cc)} ({pct(r.cc, r.total)}%) · SS {fmt(r.ss)} ({pct(r.ss, r.total)}%)</span>
                      <span style={{ fontWeight: 900, fontSize: 14, color: T.ink, minWidth: 44, textAlign: "right" }}>{fmt(r.total)}</span>
                      <IconBtn icon="trash" onClick={() => delRecord(r.id)} title="Xoá" color={T.danger} size={15} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
