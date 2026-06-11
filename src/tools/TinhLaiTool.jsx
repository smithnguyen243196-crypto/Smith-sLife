import React, { useMemo, useState } from "react";
import { T, fmt, todayKey } from "../lib/theme.js";
import { Card, SectionTitle, QuoteBar, MoneyInput, inputStyle } from "../components/ui.jsx";

export default function TinhLaiTool({ quote, now }) {
  const [start, setStart] = useState(todayKey(now));
  const [end, setEnd] = useState(todayKey(now));
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("1.5");
  const days = useMemo(() => { const a = new Date(start), b = new Date(end); if (isNaN(a) || isNaN(b)) return 0; return Math.floor((b - a) / 86400000) + 1; }, [start, end]);
  const amt = parseFloat(amount) || 0, r = parseFloat(rate) || 0;
  const interest = amt * (r / 100) / 30 * (days > 0 ? days : 0); // lãi suất %/tháng
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <QuoteBar quote={quote} />
      <Card>
        <SectionTitle>Tính lãi</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><div style={{ fontSize: 12.5, color: T.textMute, fontWeight: 600, marginBottom: 4 }}>Ngày bắt đầu</div><input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={inputStyle} /></div>
          <div><div style={{ fontSize: 12.5, color: T.textMute, fontWeight: 600, marginBottom: 4 }}>Ngày tính lãi</div><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={inputStyle} /></div>
        </div>
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, background: T.primarySoft, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: T.primaryDark }}>Số ngày (tính cả 2 đầu)</span><span style={{ fontWeight: 900, fontSize: 18, color: T.primaryDark }}>{days > 0 ? days : 0} ngày</span>
        </div>
        <div style={{ marginTop: 12 }}><div style={{ fontSize: 12.5, color: T.textMute, fontWeight: 600, marginBottom: 4 }}>Số tiền tính lãi</div><MoneyInput placeholder="Nhập số tiền" value={amount} onChange={setAmount} /></div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12.5, color: T.textMute, fontWeight: 600, marginBottom: 6 }}>Lãi suất (%/tháng)</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {["1.0", "1.5", "2.0", "2.5", "3.0"].map((v) => (<button key={v} onClick={() => setRate(v)} style={{ padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 14, background: rate === v ? T.accent : T.surfaceAlt, color: rate === v ? "#3a2c06" : T.textMute }}>{v}</button>))}
          </div>
          <input inputMode="decimal" placeholder="Hoặc tự nhập lãi suất" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))} style={inputStyle} />
        </div>
        <div style={{ marginTop: 16, padding: 18, borderRadius: 16, background: `linear-gradient(135deg,${T.accentSoft},${T.primarySoft})`, textAlign: "center" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: T.soil }}>TIỀN LÃI</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: T.primaryDark }}>{fmt(interest)} đ</div>
          <div style={{ fontSize: 11.5, color: T.textMute, marginTop: 6 }}>{fmt(amt)} × {r}%/tháng ÷ 30 × {days > 0 ? days : 0} ngày</div>
        </div>
      </Card>
    </div>
  );
}
