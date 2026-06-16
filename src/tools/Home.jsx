import React, { useEffect, useState } from "react";
import { T, R, FONT, SERIF, todayKey } from "../lib/theme.js";
import { NGAY_HABITS } from "../lib/config.js";
import { api } from "../lib/api.js";
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
  const [habitMap, setHabitMap] = useState({});
  useEffect(() => {
    api.getNgay(todayKey(now)).then((d) => { if (d && d.habits) setHabitMap(d.habits); });
  }, [now]);
  const doneHabits = NGAY_HABITS.filter((k) => habitMap[k]).length;
  const habitPct = (doneHabits / NGAY_HABITS.length) * 100;

  /* ---- chip thói quen ---- */
  const HabitChip = ({ label }) => {
    const done = !!habitMap[label];
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", borderRadius: R.chip, background: done ? T.leafSoft : T.surfaceAlt, border: `1px solid ${done ? T.leaf : T.line}`, minWidth: 0 }}>
        <span style={{ width: 17, height: 17, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: done ? T.leaf : "transparent", border: done ? "none" : `1.5px solid ${T.faint}`, color: "#fff" }}>
          {done && <Icon name="check" size={11} />}
        </span>
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, fontWeight: done ? 700 : 600, color: done ? T.inkDeep : T.muted }}>{label}</span>
      </div>
    );
  };
  const chips = (min) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}px,1fr))`, gap: 7 }}>
      {NGAY_HABITS.map((k) => <HabitChip key={k} label={k} />)}
    </div>
  );

  const toolGrid = (cols, pad) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 12 }}>
      {TOOLS.map((t) => (
        <button key={t.id} onClick={() => go(t.id)} className="lift press"
          style={{ textAlign: "left", background: T.surface, border: `1px solid ${T.line}`, borderRadius: R.card, padding: pad, cursor: "pointer", fontFamily: FONT, boxShadow: T.shadowSm }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.inkSoft, display: "flex", alignItems: "center", justifyContent: "center", color: T.ink, marginBottom: 9 }}><Icon name={t.icon} size={24} /></div>
          <div style={{ fontWeight: 800, fontSize: 14.5, color: T.text }}>{t.title}</div>
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{t.desc}</div>
        </button>
      ))}
    </div>
  );

  /* ====================== DESKTOP — gọn trong 1 màn ====================== */
  if (compact) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {/* lịch (trái) · đồng hồ + thói quen (phải) */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            <div style={{ flex: "1 1 0", minWidth: 320, padding: "16px 20px", borderRight: `1px solid ${T.line}` }}>
              <MonthCalendar now={now} compact />
            </div>
            <div style={{ flex: "1.12 1 0", minWidth: 360, padding: "16px 20px", display: "grid", gap: 12, alignContent: "start", background: `linear-gradient(150deg, ${T.surface}, ${T.surfaceAlt})` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <AnalogClock size={112} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <Eyebrow>Nhịp ngày hôm nay</Eyebrow>
                      <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: T.text, marginTop: 3 }}>{doneHabits}/{NGAY_HABITS.length} thói quen đã xong</div>
                    </div>
                    <SunRing pct={habitPct} size={54} />
                  </div>
                  <div style={{ marginTop: 9 }}><ProgressBar pct={habitPct} height={8} /></div>
                  <Btn variant="soft" onClick={() => go("tasks")} style={{ marginTop: 10, padding: "7px 13px", fontSize: 13 }}>Mở nhật ký</Btn>
                </div>
              </div>
              {chips(150)}
            </div>
          </div>
        </Card>

        {toolGrid(5, 13)}

        {/* truy cập nhanh (trái) · câu trích (phải) */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12, alignItems: "stretch" }}>
          <QuickLinks {...linkProps} />
          <div style={{ display: "grid", gap: 12 }}>
            <QuoteBar quote={quote} style={{ flex: 1 }} />
            <QuoteBar quote={nlpQuote} tone="nlp" center hideAuthor style={{ flex: 1 }} />
          </div>
        </div>
      </div>
    );
  }

  /* ====================== MOBILE ====================== */
  return (
    <div style={{ display: "grid", gap: 14 }}>
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

      {toolGrid(2, 15)}

      <QuickLinks {...linkProps} />

      <QuoteBar quote={nlpQuote} tone="nlp" center hideAuthor />
    </div>
  );
}
