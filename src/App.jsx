import React, { useEffect, useMemo, useState } from "react";
import { T, R, FONT, DESKTOP } from "./lib/theme.js";
import { api } from "./lib/api.js";
import { useMediaQuery } from "./lib/hooks.js";
import { DEFAULT_LINKS, DEFAULT_RETAILER, LINKS_VERSION } from "./lib/config.js";
import { AVATAR } from "./lib/avatar.js";
import { Icon } from "./components/icons.jsx";
import Home from "./tools/Home.jsx";
import TasksTool from "./tools/TasksTool.jsx";
import KiemKetTool from "./tools/KiemKetTool.jsx";
import TinhLaiTool from "./tools/TinhLaiTool.jsx";
import ViTool from "./tools/ViTool.jsx";
import NotesTool from "./tools/NotesTool.jsx";

const FALLBACK = [
  { text: "Những khách hàng bất mãn nhất là nguồn học hỏi lớn nhất của bạn.", author: "Bill Gates" },
  { text: "Chỉ có một ông chủ duy nhất: khách hàng.", author: "Sam Walton" },
  { text: "Luôn luôn là Ngày 1.", author: "Jeff Bezos" },
];
const FALLBACK_NLP = [{ text: "Bản đồ không phải là vùng đất. Hãy thay đổi bản đồ trong đầu, thế giới sẽ đổi theo.", author: "NLP" }];

const NAV = [
  { id: "home", icon: "home", label: "Trang chủ" },
  { id: "tasks", icon: "tasks", label: "Nhiệm Vụ" },
  { id: "kiemket", icon: "kiemket", label: "Kiểm Két" },
  { id: "tinhlai", icon: "tinhlai", label: "Tính Lãi" },
  { id: "vi", icon: "vi", label: "Ví" },
  { id: "notes", icon: "notes", label: "Ghi Chú" },
];
const pick = (arr, now) => arr[Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000) % arr.length];

export default function App() {
  const [view, setView] = useState("home");
  const [now] = useState(new Date());
  const [quotes, setQuotes] = useState(FALLBACK);
  const [nlp, setNlp] = useState(FALLBACK_NLP);
  const [links, setLinks] = useState({ version: LINKS_VERSION, retailer: DEFAULT_RETAILER, items: DEFAULT_LINKS });
  const isDesktop = useMediaQuery(`(min-width:${DESKTOP}px)`);

  useEffect(() => {
    api.getQuotes().then((q) => Array.isArray(q) && q.length && setQuotes(q));
    api.getNlpQuotes().then((q) => Array.isArray(q) && q.length && setNlp(q));
    api.getLinks().then((c) => { if (c && c.items && c.version === LINKS_VERSION) setLinks(c); });
  }, []);
  const quote = useMemo(() => pick(quotes, now), [quotes, now]);
  const nlpQuote = useMemo(() => pick(nlp, now), [nlp, now]);

  const saveLinks = (cfg) => { const v = { ...cfg, version: LINKS_VERSION }; setLinks(v); api.saveLinks(v); };
  const go = (v) => setView(v);
  const linkProps = { cfg: links, onChange: saveLinks };
  const fullBleed = view === "home" || view === "kiemket"; // màn hình dashboard trải rộng

  const screen = (
    <div key={view} className="rise">
      {view === "home" && <Home quote={quote} nlpQuote={nlpQuote} now={now} go={go} linkProps={linkProps} compact={isDesktop} />}
      {view === "tasks" && <TasksTool quote={quote} now={now} />}
      {view === "kiemket" && <KiemKetTool quote={quote} now={now} linkCfg={links} wide={isDesktop} />}
      {view === "tinhlai" && <TinhLaiTool quote={quote} now={now} />}
      {view === "vi" && <ViTool quote={quote} />}
      {view === "notes" && <NotesTool quote={quote} />}
    </div>
  );

  /* ---------- DESKTOP: sidebar + nội dung ---------- */
  if (isDesktop) {
    return (
      <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: FONT, color: T.text, display: "flex" }}>
        <aside style={{ width: 268, flexShrink: 0, background: T.surface, borderRight: `1px solid ${T.line}`, height: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column", padding: "22px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "6px 12px 12px", borderRadius: R.ctrl, marginBottom: 12 }}>
            <img src={AVATAR} alt="Smith" style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", border: `2px solid ${T.grainSoft}` }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: T.muted, fontWeight: 700 }}>Xin chào</div>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Smith Nguyễn</div>
            </div>
          </div>

          <nav style={{ display: "grid", gap: 4 }}>
            {NAV.map((t) => {
              const on = view === t.id;
              return (
                <button key={t.id} onClick={() => go(t.id)} className="press"
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: R.ctrl, border: "none", cursor: "pointer", fontFamily: FONT, background: on ? T.inkSoft : "transparent", color: on ? T.inkDeep : T.muted, fontWeight: on ? 800 : 600, fontSize: 14.5, position: "relative", textAlign: "left" }}>
                  {on && <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3.5, borderRadius: 999, background: T.grain }} />}
                  <Icon name={t.icon} size={21} /> {t.label}
                </button>
              );
            })}
          </nav>

          <div style={{ marginTop: "auto", fontSize: 11.5, color: T.faint, padding: "0 6px", lineHeight: 1.5 }}>
            <div style={{ fontWeight: 800, color: T.grain, letterSpacing: ".1em", marginBottom: 4 }}>NLP · 2026</div>
            Gieo đúng giống, đúng thời — gặt đúng mùa.
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0, overflowY: "auto", height: "100vh" }}>
          <div style={{ maxWidth: fullBleed ? 1360 : 780, margin: "0 auto", padding: fullBleed ? "28px 36px 64px" : "30px 30px 64px" }}>{screen}</div>
        </main>
      </div>
    );
  }

  /* ---------- MOBILE: cột đơn + thanh dưới ---------- */
  const tabsL = [NAV[1], NAV[2]]; // Nhiệm Vụ, Kiểm Két
  const tabsR = [NAV[4], NAV[5]]; // Ví, Ghi Chú
  return (
    <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: FONT, color: T.text }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "18px 15px calc(112px + env(safe-area-inset-bottom))", overflowX: "hidden" }}>
        {screen}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 480, position: "relative", pointerEvents: "auto" }}>
          <div style={{ background: "rgba(255,255,255,.92)", backdropFilter: "blur(12px)", borderTop: `1px solid ${T.line}`, boxShadow: "0 -8px 26px rgba(16,58,36,.10)", display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "9px 8px calc(12px + env(safe-area-inset-bottom))" }}>
            {tabsL.map((t) => <NavBtn key={t.id} t={t} active={view === t.id} onClick={() => go(t.id)} />)}
            <div style={{ width: 66 }} />
            {tabsR.map((t) => <NavBtn key={t.id} t={t} active={view === t.id} onClick={() => go(t.id)} />)}
          </div>
          <button onClick={() => go("home")} aria-label="Trang chủ" className="press"
            style={{ position: "absolute", left: "50%", top: -24, transform: "translateX(-50%)", width: 62, height: 62, borderRadius: "50%", border: `4px solid ${T.canvas}`, background: view === "home" ? `linear-gradient(135deg,${T.grain},${T.grainDeep})` : `linear-gradient(135deg,${T.ink},${T.inkDeep})`, color: "#fff", cursor: "pointer", boxShadow: T.shadow, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={view === "home" ? "sun" : "home"} size={26} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NavBtn({ t, active, onClick }) {
  return (
    <button onClick={onClick} className="press" style={{ flex: 1, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "2px 0", color: active ? T.ink : T.faint }}>
      <Icon name={t.icon} size={23} style={{ opacity: active ? 1 : .8 }} />
      <span style={{ fontSize: 10.5, fontWeight: active ? 800 : 600 }}>{t.label}</span>
    </button>
  );
}
