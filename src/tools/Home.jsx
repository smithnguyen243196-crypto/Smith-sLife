import React, { useEffect, useState } from "react";
import { T, R, FONT, SERIF, WEEKDAYS, todayKey } from "../lib/theme.js";
import { lunarLabel } from "../lib/lunar.js";
import { NGAY_HABITS } from "../lib/config.js";
import { api } from "../lib/api.js";
import { AVATAR } from "../lib/avatar.js";
import { Card, Eyebrow, QuoteBar, SunRing, ProgressBar, Btn } from "../components/ui.jsx";
import { Icon } from "../components/icons.jsx";
import QuickLinks from "../components/QuickLinks.jsx";
import MonthCalendar from "../components/MonthCalendar.jsx";
import AnalogClock from "../components/AnalogClock.jsx";

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

  const [habitMap, setHabitMap] = useState({});
  useEffect(() => {
    api.getNgay(todayKey(now)).then((d) => { if (d && d.habits) setHabitMap(d.habits); });
  }, [now]);
  const doneHabits = NGAY_HABITS.filter((k) => habitMap[k]).length;
  const habitPct = (doneHabits / NGAY_HABITS.length) * 100;

  /* ---- lời chào ---- */
  const greetText = (big) => (
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontFamily: SERIF, fontSize: big ? 34 : 26, fontWeight: 700, lineHeight: 1.1, color: T.ink }}>
        {greet},<br />Smith Nguyễn
      </div>
      <div style={{ marginTop: 12, fontSize: 14.5, color: T.muted, fontWeight: 600 }}>
        {WEEKDAYS[now.getDay()]}, ngày {now.getDate()} tháng {now.getMonth() + 1} năm {now.getFullYear()}
      </div>
      <div style={{ fontSize: 13.5, color: T.grainDeep, fontWeight: 700, marginTop: 3 }}>{lunarLabel(now)}</div>
    </div>
  );

  /* ---- chip thói quen ---- */
  const HabitChip = ({ label }) => {
    const done = !!habitMap[label];
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: R.chip, background: done ? T.leafSoft : T.surfaceAlt, border: `1px solid ${done ? "#C2E1CC" : T.line}`, minWidth: 0 }}>
        <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: done ? T.leaf : "transparent", border: done ? "none" : `1.5px solid ${T.faint}`, color: "#fff" }}>
          {done && <Icon name="check" size={12} />}
        </span>
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12.5, fontWeight: done ? 700 : 600, color: done ? T.inkDeep : T.muted }}>{label}</span>
      </div>
    );
  };
  const chips = (min) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}px,1fr))`, gap: 8 }}>
      {NGAY_HABITS.map((k) => <HabitChip key={k} label={k} />)}
    </div>
  );

  const toolGrid = (cols) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 12 }}>
      {TOOLS.map((t) => (
        <button key={t.id} onClick={() => go(t.id)} className="lift press"
          style={{ textAlign: "left", background: T.surface, border: `1px solid ${T.line}`, borderRadius: R.card, padding: 15, cursor: "pointer", fontFamily: FONT, boxShadow: T.shadowSm }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: T.inkSoft, display: "flex", alignItems: "center", justifyContent: "center", color: T.ink, marginBottom: 11 }}><Icon name={t.icon} size={25} /></div>
          <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{t.title}</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.35 }}>{t.desc}</div>
        </button>
      ))}
    </div>
  );

  /* ====================== DESKTOP ====================== */
  if (compact) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {/* HERO: lời chào (trên) · lịch (trái) · đồng hồ + thói quen (phải) */}
        <Card style={{ padding: 0, overflow: "hidden", background: `linear-gradient(150deg, ${T.surface}, ${T.surfaceAlt})` }}>
          <div style={{ padding: "22px 26px 18px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            {greetText(true)}
            <img src={AVATAR} alt="Smith" style={{ width: 66, height: 66, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `3px solid ${T.grainSoft}`, boxShadow: T.shadowSm }} />
          </div>

          <div style={{ display: "flex", alignItems: "stretch", borderTop: `1px solid ${T.line}`, background: T.surface }}>
            {/* TRÁI: lịch tháng */}
            <div style={{ flex: "1 1 0", minWidth: 320, padding: "18px 22px", borderRight: `1px solid ${T.line}` }}>
              <MonthCalendar now={now} />
            </div>
            {/* PHẢI: đồng hồ + nhịp ngày */}
            <div style={{ flex: "1.12 1 0", minWidth: 360, padding: "18px 22px", display: "grid", gap: 14, alignContent: "start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <AnalogClock size={124} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <Eyebrow>Nhịp ngày hôm nay</Eyebrow>
                      <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 700, color: T.text, marginTop: 4 }}>{doneHabits}/{NGAY_HABITS.length} thói quen đã xong</div>
                    </div>
                    <SunRing pct={habitPct} size={58} />
                  </div>
                  <div style={{ marginTop: 10 }}><ProgressBar pct={habitPct} height={9} /></div>
                  <Btn variant="soft" onClick={() => go("tasks")} style={{ marginTop: 11, padding: "8px 14px", fontSize: 13.5 }}>Mở nhật ký</Btn>
                </div>
              </div>
              {chips(168)}
            </div>
          </div>
        </Card>

        <QuoteBar quote={quote} />

        {toolGrid(5)}

        <QuickLinks {...linkProps} />

        <QuoteBar quote={nlpQuote} tone="nlp" center hideAuthor />
      </div>
    );
  }

  /* ====================== MOBILE ====================== */
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card style={{ overflow: "hidden", background: `linear-gradient(150deg, ${T.surface}, ${T.surfaceAlt})` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          {greetText(false)}
          <img src={AVATAR} alt="Smith" style={{ width: 58, height: 58, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `3px solid ${T.grainSoft}`, boxShadow: T.shadowSm }} />
        </div>
      </Card>

      {/* đồng hồ + nhịp ngày */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <AnalogClock size={96} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow>Nhịp ngày hôm nay</Eyebrow>
            <div style={{ fontSize: 17, fontWeight: 900, color: T.text, marginTop: 3 }}>{doneHabits}/{NGAY_HABITS.length} thói quen</div>
            <div style={{ marginTop: 8 }}><ProgressBar pct={habitPct} height={8} /></div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>{chips(150)}</div>
        <Btn variant="soft" full onClick={() => go("tasks")} style={{ marginTop: 11 }}>Mở nhật ký</Btn>
      </Card>

      <Card><MonthCalendar now={now} compact /></Card>

      <QuoteBar quote={quote} />

      {toolGrid(2)}

      <QuickLinks {...linkProps} />

      <QuoteBar quote={nlpQuote} tone="nlp" center hideAuthor />
    </div>
  );
}
