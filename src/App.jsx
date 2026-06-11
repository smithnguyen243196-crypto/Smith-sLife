import React, { useEffect, useMemo, useState } from "react";
import { T, FONT } from "./lib/theme.js";
import { api } from "./lib/api.js";
import { Icon } from "./components/icons.jsx";
import Home from "./tools/Home.jsx";
import TasksTool from "./tools/TasksTool.jsx";
import KiemKetTool from "./tools/KiemKetTool.jsx";
import TinhLaiTool from "./tools/TinhLaiTool.jsx";
import ViTool from "./tools/ViTool.jsx";

const FALLBACK = [
  { text: "Những khách hàng bất mãn nhất là nguồn học hỏi lớn nhất của bạn.", author: "Bill Gates" },
  { text: "Chỉ có một ông chủ duy nhất: khách hàng.", author: "Sam Walton" },
  { text: "Luôn luôn là Ngày 1.", author: "Jeff Bezos" },
];
const FALLBACK_NLP = [{ text: "Bản đồ không phải là vùng đất. Hãy thay đổi bản đồ trong đầu, thế giới sẽ đổi theo.", author: "NLP" }];
const TABS = [
  { id: "tasks", icon: "tasks", label: "Nhiệm Vụ" },
  { id: "kiemket", icon: "kiemket", label: "Kiểm Két" },
  { id: "tinhlai", icon: "tinhlai", label: "Tính Lãi" },
  { id: "vi", icon: "vi", label: "Ví" },
];
const pick = (arr, now) => arr[Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000) % arr.length];

export default function App() {
  const [view, setView] = useState("home");
  const [now] = useState(new Date());
  const [quotes, setQuotes] = useState(FALLBACK);
  const [nlp, setNlp] = useState(FALLBACK_NLP);
  useEffect(() => {
    api.getQuotes().then((q) => Array.isArray(q) && q.length && setQuotes(q));
    api.getNlpQuotes().then((q) => Array.isArray(q) && q.length && setNlp(q));
  }, []);
  const quote = useMemo(() => pick(quotes, now), [quotes, now]);
  const nlpQuote = useMemo(() => pick(nlp, now), [nlp, now]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: FONT, color: T.text }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "20px 16px 110px" }}>
        {view === "home" && <Home quote={quote} nlpQuote={nlpQuote} now={now} go={setView} />}
        {view === "tasks" && <TasksTool quote={quote} now={now} />}
        {view === "kiemket" && <KiemKetTool quote={quote} now={now} />}
        {view === "tinhlai" && <TinhLaiTool quote={quote} now={now} />}
        {view === "vi" && <ViTool quote={quote} />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 460, position: "relative", pointerEvents: "auto" }}>
          <div style={{ background: T.surface, borderTop: `1px solid ${T.border}`, boxShadow: "0 -6px 20px rgba(30,92,58,.08)", display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "10px 8px 14px" }}>
            {TABS.slice(0, 2).map((t) => <NavBtn key={t.id} t={t} active={view === t.id} onClick={() => setView(t.id)} />)}
            <div style={{ width: 64 }} />
            {TABS.slice(2).map((t) => <NavBtn key={t.id} t={t} active={view === t.id} onClick={() => setView(t.id)} />)}
          </div>
          <button onClick={() => setView("home")} aria-label="Trang chủ" style={{ position: "absolute", left: "50%", top: -22, transform: "translateX(-50%)", width: 60, height: 60, borderRadius: "50%", border: `4px solid ${T.bg}`, background: view === "home" ? `linear-gradient(135deg,${T.accent},#e0b94a)` : `linear-gradient(135deg,${T.primary},${T.primaryDark})`, color: "#fff", cursor: "pointer", boxShadow: T.shadow, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="home" size={26} /></button>
        </div>
      </div>
    </div>
  );
}
function NavBtn({ t, active, onClick }) {
  return (<button onClick={onClick} style={{ flex: 1, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: 0, color: active ? T.primary : T.textMute }}>
    <Icon name={t.icon} size={23} style={{ opacity: active ? 1 : .75 }} />
    <span style={{ fontSize: 11, fontWeight: active ? 800 : 600 }}>{t.label}</span>
  </button>);
}
