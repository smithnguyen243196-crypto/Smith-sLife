import React, { useMemo, useState } from "react";
import { T, R, fmt, todayKey } from "../lib/theme.js";
import { Card, SectionTitle, QuoteBar, MoneyInput, Field, inputStyle } from "../components/ui.jsx";

export default function TinhLaiTool({ quote, now }) {
  const [start, setStart] = useState(todayKey(now));
  const [end, setEnd] = useState(todayKey(now));
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("1.5");
  const days = useMemo(() => { const a = new Date(start), b = new Date(end); if (isNaN(a) || isNaN(b)) return 0; return Math.floor((b - a) / 86400000) + 1; }, [start, end]);
  const amt = parseFloat(amount) || 0, r = parseFloat(rate) || 0;
  const interest = amt * (r / 100) / 30 * (days > 0 ? days : 0);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <QuoteBar quote={quote} />
      <Card>
        <SectionTitle icon="tinhlai">Tính lãi</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Field label="Ngày bắt đầu"><input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={inputStyle} /></Field>
          <Field label="Ngày tính lãi"><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={inputStyle} /></Field>
        </div>
        <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: R.ctrl, background: T.inkSoft, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: T.inkDeep }}>Số ngày (tính cả 2 đầu)</span><span style={{ fontWeight: 900, fontSize: 18, color: T.inkDeep }}>{days > 0 ? days : 0} ngày</span>
        </div>
        <div style={{ marginTop: 12 }}><Field label="Số tiền tính lãi"><MoneyInput placeholder="Nhập số tiền" value={amount} onChange={setAmount} /></Field></div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12.5, color: T.muted, fontWeight: 700, marginBottom: 7 }}>Lãi suất (%/tháng)</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {["1.0", "1.5", "2.0", "2.5", "3.0"].map((v) => (<button key={v} onClick={() => setRate(v)} className="press" style={{ padding: "8px 15px", borderRadius: R.pill, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 14, background: rate === v ? `linear-gradient(135deg,${T.grain},${T.grainDeep})` : T.surfaceAlt, color: rate === v ? "#2c2105" : T.muted }}>{v}</button>))}
          </div>
          <input inputMode="decimal" placeholder="Hoặc tự nhập lãi suất" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))} style={inputStyle} />
        </div>
        <div style={{ marginTop: 16, padding: 20, borderRadius: R.card, background: `linear-gradient(135deg,${T.grainSoft},${T.inkSoft})`, textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.soil, letterSpacing: ".1em" }}>TIỀN LÃI</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: T.inkDeep, marginTop: 2 }}>{fmt(interest)} đ</div>
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 6 }}>{fmt(amt)} × {r}%/tháng ÷ 30 × {days > 0 ? days : 0} ngày</div>
        </div>
      </Card>
    </div>
  );
}
