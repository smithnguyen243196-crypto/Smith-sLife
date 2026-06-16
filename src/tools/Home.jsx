import React, { useEffect, useState } from "react";
import { T, R, FONT, SERIF, WEEKDAYS, todayKey } from "../lib/theme.js";
import { lunarLabel } from "../lib/lunar.js";
import { NGAY_HABITS } from "../lib/config.js";
import { api } from "../lib/api.js";
import { AVATAR } from "../lib/avatar.js";
import { Card, Eyebrow, QuoteBar, SunRing, Btn } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";
import QuickLinks from "../components/QuickLinks.jsx";

const TOOLS = [
  { id: "tasks", icon: "tasks", title: "Nhiệm Vụ Ngày", desc: "Thói quen & việc cần làm" },
  { id: "kiemket", icon: "kiemket", title: "Kiểm Két", desc: "Đếm két · thu chi · kết quả" },
  { id: "notes", icon: "notes", title: "Ghi Chú", desc: "Ghi nhanh việc vừa làm" },
  { id: "vi", icon: "vi", title: "Ví Cá Nhân", desc: "Ngân hàng & tiền mặt" },
  { id: "tinhlai", icon: "tinhlai", title: "Tính Lãi", desc: "Theo ngày & lãi suất" },
];

export default function Home({ quote, nlpQuote, now, go, linkProps, compact }) {
  const h = now.getHours();
  const greet = h < 11 ? "Chào buổi sáng" : h < 14 ? "Chào buổi trưa" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const dawnIcon = h < 11 ? "dawn" : h < 18 ? "sun" : "moon";

  const [doneHabits, setDoneHabits] = useState(0);
  useEffect(() => {
    api.getNgay(todayKey(now)).then((d) => {
      if (d && d.habits) setDoneHabits(NGAY_HABITS.filter((k) => d.habits[k]).length);
    });
  }, [now]);
  const habitPct = (doneHabits / NGAY_HABITS.length) * 100;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* HERO — nông lịch + nhịp ngày */}
      <Card style={{ padding: 0, overflow: "hidden", background: `linear-gradient(150deg, ${T.surface}, ${T.surfaceAlt})` }}>
        <div style={{ padding: "18px 18px 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <Eyebrow style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon name={dawnIcon} size={14} /> Nông lịch số</Eyebrow>
              <div style={{ fontFamily: SERIF, fontSize: compact ? 30 : 26, fontWeight: 700, lineHeight: 1.12, color: T.ink, marginTop: 6 }}>
                {greet},<br />Smith Nguyễn
              </div>
            </div>
            {!compact && (
              <img src={AVATAR} alt="Smith" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `3px solid ${T.grainSoft}`, boxShadow: T.shadowSm }} />
            )}
          </div>
          <div style={{ marginTop: 12, fontSize: 14, color: T.muted, fontWeight: 600 }}>
            {WEEKDAYS[now.getDay()]}, ngày {now.getDate()} tháng {now.getMonth() + 1} năm {now.getFullYear()}
          </div>
          <div style={{ fontSize: 13, color: T.grainDeep, fontWeight: 700, marginTop: 2 }}>{lunarLabel(now)}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderTop: `1px solid ${T.line}`, background: T.surface }}>
          <SunRing pct={habitPct} size={62} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, color: T.muted, fontWeight: 700 }}>Nhịp ngày hôm nay</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.text }}>{doneHabits}/{NGAY_HABITS.length} thói quen</div>
          </div>
          <Btn variant="soft" onClick={() => go("tasks")} style={{ flexShrink: 0 }}>Mở nhật ký</Btn>
        </div>
      </Card>

      <QuoteBar quote={quote} />

      {/* Lưới công cụ */}
      <div style={{ display: "grid", gridTemplateColumns: compact ? "repeat(3,1fr)" : "repeat(2,1fr)", gap: 12 }}>
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => go(t.id)} className="lift press"
            style={{ textAlign: "left", background: T.surface, border: `1px solid ${T.line}`, borderRadius: R.card, padding: 15, cursor: "pointer", fontFamily: FONT, boxShadow: T.shadowSm }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: T.inkSoft, display: "flex", alignItems: "center", justifyContent: "center", color: T.ink, marginBottom: 11 }}><Icon name={t.icon} size={25} /></div>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{t.title}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.35 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      <QuickLinks {...linkProps} />

      <QuoteBar quote={nlpQuote} tone="nlp" label="NLP · Phát triển bản thân" />
    </div>
  );
}
