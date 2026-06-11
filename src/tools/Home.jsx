import React from "react";
import { T, WEEKDAYS } from "../lib/theme.js";
import { lunarLabel } from "../lib/lunar.js";
import { AVATAR } from "../lib/avatar.js";
import { Card, QuoteBar } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";

export default function Home({ quote, nlpQuote, now, go }) {
  const h = now.getHours();
  const greet = h < 11 ? "Chào buổi sáng" : h < 14 ? "Chào buổi trưa" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const tools = [
    { id: "tasks", icon: "tasks", title: "Nhiệm Vụ Ngày", desc: "Thói quen & việc cần làm" },
    { id: "kiemket", icon: "kiemket", title: "Kiểm Két", desc: "Đếm két · thu chi · kết quả" },
    { id: "tinhlai", icon: "tinhlai", title: "Tính Lãi", desc: "Theo ngày & lãi suất" },
    { id: "vi", icon: "vi", title: "Ví Cá Nhân", desc: "Ngân hàng & tiền mặt" },
  ];
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".12em", color: T.accent }}>BỘ CÔNG CỤ HẰNG NGÀY</div>
          <div style={{ fontSize: 25, fontWeight: 900, lineHeight: 1.15, color: T.text }}>{greet},<br />Smith Nguyễn 👋</div>
        </div>
        <div style={{ width: 68, height: 68, borderRadius: "50%", flexShrink: 0, padding: 3, background: `linear-gradient(135deg, ${T.accent}, ${T.primary})`, boxShadow: T.shadowSm }}>
          <img src={AVATAR} alt="Smith" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: `2px solid ${T.bg}` }} />
        </div>
      </div>

      <Card style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 14, color: T.textMute, fontWeight: 600 }}>{WEEKDAYS[now.getDay()]}</div>
        <div style={{ fontSize: 19, fontWeight: 900, color: T.text }}>Ngày {now.getDate()} tháng {now.getMonth() + 1} năm {now.getFullYear()}</div>
        <div style={{ fontSize: 13, color: T.accent, fontWeight: 700, marginTop: 2 }}>{lunarLabel(now)}</div>
      </Card>

      <QuoteBar quote={quote} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {tools.map((t) => (
          <button key={t.id} onClick={() => go(t.id)} style={{ textAlign: "left", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: T.shadowSm }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: T.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary, marginBottom: 10 }}><Icon name={t.icon} size={26} /></div>
            <div style={{ fontWeight: 800, fontSize: 15.5, color: T.text }}>{t.title}</div>
            <div style={{ fontSize: 12.5, color: T.textMute, marginTop: 2 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      <QuoteBar quote={nlpQuote} tone="nlp" label="NLP · PHÁT TRIỂN BẢN THÂN" />
    </div>
  );
}
