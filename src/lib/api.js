// Client gọi serverless /api. Mọi hàm tự bắt lỗi để app không vỡ khi mất mạng.
async function j(url, opts) {
  const r = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.status === 204 ? null : r.json();
}
export const api = {
  getQuotes: () => j("/api/quotes").catch(() => []),
  getNlpQuotes: () => j("/api/quotes?topic=nlp").catch(() => []),
  getProjects: () => j("/api/projects").catch(() => []),

  // @Ngày
  getNgay: (date) => j(`/api/ngay?date=${date}`).catch(() => null),
  tickHabit: (date, habit, value) => j("/api/ngay", { method: "POST", body: JSON.stringify({ action: "tick", date, habit, value }) }).catch(() => null),
  saveAnswers: (date, kind, answers) => j("/api/ngay", { method: "POST", body: JSON.stringify({ action: "answers", date, kind, answers }) }).catch(() => null),

  // @Nhiệm Vụ
  getTasks: () => j("/api/tasks").catch(() => []),
  addTask: (name, projectId, due, note, dueEnd) => j("/api/tasks", { method: "POST", body: JSON.stringify({ name, projectId, due, note, dueEnd }) }).catch(() => null),
  updateTask: (id, fields) => j("/api/tasks", { method: "PATCH", body: JSON.stringify({ id, ...fields }) }).catch(() => null),
  toggleTask: (id, done) => j("/api/tasks", { method: "PATCH", body: JSON.stringify({ id, done }) }).catch(() => null),
  getStreak: (habits, today) => j("/api/streak", { method: "POST", body: JSON.stringify({ habits, today }) }).catch(() => null),
  deleteTask: (id) => j(`/api/tasks?id=${id}`, { method: "DELETE" }).catch(() => null),

  // Kiểm Két (Upstash + tuỳ chọn Notion)
  getKiemKet: () => j("/api/kiemket").catch(() => null),
  saveKiemKet: (payload) => j("/api/kiemket", { method: "POST", body: JSON.stringify(payload) }).catch(() => null),

  // @Ví Cá Nhân
  getVi: () => j("/api/vi").catch(() => []),
  addVi: (tx) => j("/api/vi", { method: "POST", body: JSON.stringify(tx) }).catch(() => null),
  deleteVi: (id) => j(`/api/vi?id=${id}`, { method: "DELETE" }).catch(() => null),

  // Ghi Chú (Upstash — đồng bộ desktop/mobile tức thì)
  getNotes: () => j("/api/notes").catch(() => null),
  saveNotes: (notes) => j("/api/notes", { method: "POST", body: JSON.stringify({ notes }) }).catch(() => null),

  // Truy cập nhanh (KiotViet + liên kết) — Upstash
  getLinks: () => j("/api/links").catch(() => null),
  saveLinks: (cfg) => j("/api/links", { method: "POST", body: JSON.stringify(cfg) }).catch(() => null),

  // Doanh Số nhân viên (Notion) — record = { date, staff, cc, ss, total }
  getDoanhSo: () => j("/api/doanhso").catch(() => []),
  saveDoanhSo: (rec) => j("/api/doanhso", { method: "POST", body: JSON.stringify(rec) }).catch(() => null),
  deleteDoanhSo: (id) => j(`/api/doanhso?id=${id}`, { method: "DELETE" }).catch(() => null),

  // Đọc ảnh báo cáo doanh số bằng AI (Claude Vision) -> { sellers: [{name, sl}] }
  // Không bắt lỗi ở đây để UI có thể hiện thông báo lỗi cụ thể (vd thiếu API key).
  parseSalesImage: async (imageDataUrl) => {
    const r = await fetch("/api/parse-sales-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: imageDataUrl }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || `parse-sales-image -> ${r.status}`);
    return d;
  },
};
