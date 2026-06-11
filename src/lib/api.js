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
  addTask: (name, projectId) => j("/api/tasks", { method: "POST", body: JSON.stringify({ name, projectId }) }).catch(() => null),
  toggleTask: (id, done) => j("/api/tasks", { method: "PATCH", body: JSON.stringify({ id, done }) }).catch(() => null),
  deleteTask: (id) => j(`/api/tasks?id=${id}`, { method: "DELETE" }).catch(() => null),

  // Kiểm Két (Upstash + tuỳ chọn Notion)
  getKiemKet: () => j("/api/kiemket").catch(() => null),
  saveKiemKet: (payload) => j("/api/kiemket", { method: "POST", body: JSON.stringify(payload) }).catch(() => null),

  // @Ví Cá Nhân
  getVi: () => j("/api/vi").catch(() => []),
  addVi: (tx) => j("/api/vi", { method: "POST", body: JSON.stringify(tx) }).catch(() => null),
  deleteVi: (id) => j(`/api/vi?id=${id}`, { method: "DELETE" }).catch(() => null),
};
