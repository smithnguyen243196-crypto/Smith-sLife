import React, { useState } from "react";
import { T, R, FONT } from "../lib/theme.js";
import { kiotvietShopUrl } from "../lib/config.js";
import { Card, SectionTitle, Btn, IconBtn, Modal, Field, inputStyle, EmptyState } from "./ui.jsx";
import { Icon } from "./icons.jsx";

// Dựng URL cuối cùng cho 1 mục (kind "kiotviet" tự ghép theo retailer)
export const resolveUrl = (item, retailer) => (item.kind === "kiotviet" ? kiotvietShopUrl(retailer) : (item.url || "").trim());
const openLink = (url) => { if (url) window.open(url, "_blank", "noopener,noreferrer"); };
const domainOf = (url) => (url ? url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : "");

// Thẻ liên kết — cùng dáng với thẻ công cụ
function LinkCard({ item, retailer }) {
  const url = resolveUrl(item, retailer);
  const color = item.color || T.ink;
  return (
    <button onClick={() => openLink(url)} className="lift press"
      style={{ position: "relative", textAlign: "left", background: T.surface, border: `1px solid ${T.line}`, borderRadius: R.card, padding: 15, cursor: "pointer", fontFamily: FONT, boxShadow: T.shadowSm, minWidth: 0 }}>
      <span style={{ position: "absolute", top: 13, right: 13, color: T.faint, display: "flex" }}><Icon name="external" size={15} /></span>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: `${color}1A`, color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 11 }}>
        {item.iconName ? <Icon name={item.iconName} size={25} /> : <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon || "🔗"}</span>}
      </div>
      <div style={{ fontWeight: 800, fontSize: 15, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc || domainOf(url) || "Chưa đặt liên kết"}</div>
    </button>
  );
}

// cfg = { retailer, items }; onChange(cfg) để lưu Upstash
export default function QuickLinks({ cfg, onChange }) {
  const [open, setOpen] = useState(false);
  const items = cfg?.items || [];
  const retailer = cfg?.retailer || "";

  return (
    <Card>
      <SectionTitle icon="external" right={<IconBtn icon="cog" onClick={() => setOpen(true)} title="Tuỳ chỉnh liên kết" color={T.ink} />}>Truy cập nhanh</SectionTitle>
      {items.length === 0 ? (
        <EmptyState>Chưa có liên kết. Bấm ⚙ để thêm.</EmptyState>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
          {items.map((it) => <LinkCard key={it.id} item={it} retailer={retailer} />)}
        </div>
      )}
      <LinkEditor open={open} cfg={cfg} onClose={() => setOpen(false)} onChange={onChange} />
    </Card>
  );
}

// Nút mở KiotViet đơn lẻ (dùng trong Kiểm Két) — ưu tiên Báo Cáo Cuối Ngày
export function KiotvietButton({ cfg, label = "Mở Báo Cáo Cuối Ngày trên KiotViet" }) {
  const list = cfg?.items || [];
  const item = list.find((i) => i.id === "kv-eod") || list.find((i) => i.kind === "kiotviet") || list[0] || { kind: "kiotviet" };
  return (
    <Btn variant="ghost" full onClick={() => openLink(resolveUrl(item, cfg?.retailer))}>
      <Icon name="external" size={17} /> {label}
    </Btn>
  );
}

const EMOJIS = ["🔗", "🛒", "🧾", "👥", "📊", "🔑", "🌾", "📒", "📱", "💬", "🏪", "📦", "🌱"];

function LinkEditor({ open, cfg, onClose, onChange }) {
  const [retailer, setRetailer] = useState(cfg?.retailer || "");
  const [items, setItems] = useState(cfg?.items || []);
  React.useEffect(() => { if (open) { setRetailer(cfg?.retailer || ""); setItems(cfg?.items || []); } }, [open]); // eslint-disable-line

  const upd = (id, patch) => setItems((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const del = (id) => setItems((p) => p.filter((x) => x.id !== id));
  const add = () => setItems((p) => [...p, { id: "u" + Date.now(), kind: "url", label: "Liên kết mới", desc: "", url: "", icon: "🔗", color: T.ink }]);
  const save = () => { onChange({ retailer: retailer.trim(), items }); onClose(); };

  return (
    <Modal open={open} title="Tuỳ chỉnh truy cập nhanh" onClose={onClose}>
      <div style={{ display: "grid", gap: 14 }}>
        <Card style={{ padding: 14 }}>
          <Field label="Địa chỉ truy cập cửa hàng KiotViet" hint={retailer.trim() ? `Gian hàng: https://${retailer.trim()}.kiotviet.vn` : "Để trống sẽ mở trang kiotviet.vn"}>
            <div style={{ position: "relative" }}>
              <input value={retailer} onChange={(e) => setRetailer(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase())} placeholder="vd: huyenthoco" style={{ ...inputStyle, paddingRight: 92, fontWeight: 700 }} />
              <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: T.muted, fontWeight: 700, fontSize: 13 }}>.kiotviet.vn</span>
            </div>
          </Field>
        </Card>

        <div style={{ display: "grid", gap: 10 }}>
          {items.map((it) => (
            <Card key={it.id} style={{ padding: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <select value={it.iconName ? "" : (it.icon || "🔗")} onChange={(e) => upd(it.id, { icon: e.target.value, iconName: undefined })} style={{ ...inputStyle, width: 58, padding: "9px 6px", textAlign: "center", fontSize: 18 }}>
                  {it.iconName && <option value="">▣</option>}
                  {EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                <input value={it.label} onChange={(e) => upd(it.id, { label: e.target.value })} placeholder="Tên hiển thị" style={{ ...inputStyle, fontWeight: 700 }} />
                <IconBtn icon="trash" onClick={() => del(it.id)} title="Xoá" color={T.danger} />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <input value={it.desc || ""} onChange={(e) => upd(it.id, { desc: e.target.value })} placeholder="Mô tả ngắn (vd: Màn hình bán hàng)" style={inputStyle} />
                {it.kind === "kiotviet" ? (
                  <div style={{ fontSize: 12.5, color: T.muted, fontWeight: 600, padding: "2px 2px" }}>🔒 Tự mở gian hàng KiotViet theo địa chỉ ở trên.</div>
                ) : (
                  <input value={it.url || ""} onChange={(e) => upd(it.id, { url: e.target.value })} placeholder="https://..." inputMode="url" style={inputStyle} />
                )}
              </div>
            </Card>
          ))}
        </div>

        <Btn variant="soft" full onClick={add}><Icon name="plus" size={17} /> Thêm liên kết</Btn>
        <div style={{ display: "flex", gap: 9 }}>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Huỷ</Btn>
          <Btn variant="primary" onClick={save} style={{ flex: 2 }}>Lưu</Btn>
        </div>
      </div>
    </Modal>
  );
}
