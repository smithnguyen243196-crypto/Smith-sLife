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
import DoanhSoTool from "./tools/DoanhSoTool.jsx";

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
  { id: "doanhso", icon: "report", label: "Doanh Số" },
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
  const [theme, setTheme] = useState(() => (typeof document !== "undefined" && document.documentElement.dataset.theme) || "light");
  const isDark = theme === "dark";
  const [navOpen, setNavOpen] = useState(() => { try { return localStorage.getItem("nls-nav") !== "0"; } catch (e) { return true; } });
  const toggleNav = () => setNavOpen((v) => { const n = !v; try { localStorage.setItem("nls-nav", n ? "1" : "0"); } catch (e) {} return n; });
  const toggleTheme = () => setTheme((t) => {
    const n = t === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = n;
    try { localStorage.setItem("nls-theme", n); } catch (e) {}
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", n === "dark" ? "#0F1713" : "#1B5235");
    return n;
  });

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
      {view === "doanhso" && <DoanhSoTool quote={quote} />}
      {view === "tinhlai" && <TinhLaiTool quote={quote} now={now} />}
      {view === "vi" && <ViTool quote={quote} />}
      {view === "notes" && <NotesTool quote={quote} />}
    </div>
  );

  /* ---------- DESKTOP: sidebar + nội dung ---------- */
  if (isDesktop) {
    return (
      <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: FONT, color: T.text, display: "flex" }}>
        <aside style={{ width: navOpen ? 268 : 76, flexShrink: 0, background: T.surface, borderRight: `1px solid ${T.line}`, height: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column", padding: navOpen ? "22px 16px" : "22px 12px", transition: "width .2s ease" }}>
          {navOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px 14px" }}>
              <img src={AVATAR} alt="Smith" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: `2px solid ${T.grainSoft}`, flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 700 }}>Xin chào</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Smith Nguyễn</div>
              </div>
              <button onClick={toggleNav} className="press" title="Thu gọn menu" aria-label="Thu gọn menu" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, border: `1px solid ${T.line}`, background: T.surfaceAlt, color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="menu" size={18} /></button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBottom: 14 }}>
              <button onClick={toggleNav} className="press" title="Mở rộng menu" aria-label="Mở rộng menu" style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${T.line}`, background: T.surfaceAlt, color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="menu" size={20} /></button>
              <img src={AVATAR} alt="Smith" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: `2px solid ${T.grainSoft}` }} />
            </div>
          )}

          <nav style={{ display: "grid", gap: 4 }}>
            {NAV.map((t) => {
              const on = view === t.id;
              return (
                <button key={t.id} onClick={() => go(t.id)} className="press" title={navOpen ? undefined : t.label}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: navOpen ? "11px 13px" : "11px 0", justifyContent: navOpen ? "flex-start" : "center", borderRadius: R.ctrl, border: "none", cursor: "pointer", fontFamily: FONT, background: on ? T.inkSoft : "transparent", color: on ? T.inkDeep : T.muted, fontWeight: on ? 800 : 600, fontSize: 14.5, position: "relative", textAlign: "left" }}>
                  {on && navOpen && <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3.5, borderRadius: 999, background: T.grain }} />}
                  <Icon name={t.icon} size={21} /> {navOpen && t.label}
                </button>
              );
            })}
          </nav>

          <div style={{ marginTop: "auto" }}>
            <button onClick={toggleTheme} className="press" title={isDark ? "Chế độ sáng" : "Chế độ tối"}
              style={{ display: "flex", alignItems: "center", justifyContent: navOpen ? "flex-start" : "center", gap: 10, width: "100%", padding: navOpen ? "10px 13px" : "10px 0", borderRadius: R.ctrl, border: `1px solid ${T.line}`, background: T.surfaceAlt, color: T.text, cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 13.5, marginBottom: 14 }}>
              <Icon name={isDark ? "sun" : "moon"} size={18} /> {navOpen && (isDark ? "Chế độ sáng" : "Chế độ tối")}
            </button>
            {navOpen && (
              <div style={{ fontSize: 11.5, color: T.faint, padding: "0 6px", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: T.grain, letterSpacing: ".1em", marginBottom: 4 }}>NLP · 2026</div>
                Gieo đúng giống, đúng thời — gặt đúng mùa.
              </div>
            )}
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0, overflowY: "auto", height: "100vh" }}>
          <div style={{ maxWidth: fullBleed ? 1360 : 780, margin: "0 auto", padding: view === "home" ? "18px 36px 20px" : fullBleed ? "28px 36px 64px" : "30px 30px 64px" }}>{screen}</div>
        </main>
      </div>
    );
  }

  /* ---------- MOBILE: cột đơn + thanh dưới (đủ 6 mục) ---------- */
  return (
    <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: FONT, color: T.text }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 15px 0", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={toggleTheme} className="press"
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 999, border: `1px solid ${T.line}`, background: T.surface, color: T.text, cursor: "pointer", fontFamily: FONT, fontWeight: 700, fontSize: 12.5, boxShadow: T.shadowSm }}>
          <Icon name={isDark ? "sun" : "moon"} size={16} /> {isDark ? "Sáng" : "Tối"}
        </button>
      </div>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "10px 15px calc(82px + env(safe-area-inset-bottom))", overflowX: "hidden" }}>
        {screen}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 480, pointerEvents: "auto", background: T.barBg, backdropFilter: "blur(12px)", borderTop: `1px solid ${T.line}`, boxShadow: T.shadow, display: "flex", justifyContent: "space-around", padding: "8px 4px calc(10px + env(safe-area-inset-bottom))" }}>
          {NAV.map((t) => <NavBtn key={t.id} t={t} active={view === t.id} onClick={() => go(t.id)} />)}
        </div>
      </div>
    </div>
  );
}

function NavBtn({ t, active, onClick }) {
  return (
    <button onClick={onClick} className="press" style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "2px 0", color: active ? T.ink : T.faint }}>
      <Icon name={t.icon} size={21} style={{ opacity: active ? 1 : .8 }} />
      <span style={{ fontSize: 9.5, fontWeight: active ? 800 : 600, whiteSpace: "nowrap" }}>{t.label}</span>
    </button>
  );
}
