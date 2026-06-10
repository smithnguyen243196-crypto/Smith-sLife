// ====== Cấu hình bảng "Ngày" trong Notion ======
// ID database "Ngày" (lấy từ workspace Smith's life).
export const DB_ID = '30d71898-ce7d-81d2-9962-d476120e8009'
// ID database "Nhiệm Vụ" (việc cần làm) — nhúng trong trang ngày.
export const TASKS_DB_ID = '30d71898-ce7d-810f-911c-e50510842592'
const TZ = 'Asia/Ho_Chi_Minh'

// Tên cột trong database Nhiệm Vụ.
const TD = {
  title: 'Nhiệm Vụ',
  date: 'Ngày Thực Hiện',
  done: 'Hoàn Thành',
  doneDate: 'Ngày Hoàn Thành',
  status: 'Trạng Thái',
}

// Tên cột title trong bảng Ngày.
const TITLE_PROP = 'Tiêu Đề Ngày'
const DATE_PROP = 'Ngày'

// 10 nhiệm vụ (checkbox). emoji tách khỏi nhãn để hiển thị đẹp; "prop" là tên cột Notion (gồm cả emoji).
export const TASKS = [
  { emoji: '🧘', label: 'Thiền', prop: '🧘 Thiền', part: 'sang' },
  { emoji: '💪', label: 'Tập thể dục', prop: '💪 Tập thể dục', part: 'sang' },
  { emoji: '📚', label: 'Đọc sách', prop: '📚 Đọc sách', part: 'ngay' },
  { emoji: '💬', label: 'Nói chuyện với vợ', prop: '💬 Nói chuyện với vợ', part: 'ngay' },
  { emoji: '👧', label: 'Nói chuyện với con gái', prop: '👧 Nói chuyện với con gái', part: 'ngay' },
  { emoji: '💰', label: 'Tổng kết thu chi ngày', prop: '💰 Tổng kết thu chi ngày', part: 'ngay' },
  { emoji: '🏪', label: 'Tổng kết két thu chi cửa hàng', prop: '🏪 Tổng kết két thu chi cửa hàng', part: 'ngay' },
  { emoji: '📋', label: 'Làm nhiệm vụ ở bảng phân công', prop: '📋 Làm nhiệm vụ ở bảng phân công', part: 'ngay' },
  { emoji: '🗓️', label: 'Thêm nhiệm vụ cho ngày mai', prop: '🗓️ Thêm các nhiệm vụ cho ngày mai', part: 'toi' },
  { emoji: '🌙', label: 'Nhìn lại cuối ngày', prop: '🌙 Nhìn lại cuối ngày', part: 'toi' },
]

// Chỉ số (number / date).
export const METRICS = {
  tinhTao: 'Mức Độ Tỉnh Táo & Sẵn Sàng? 1-10 (10 Tốt nhất)',
  canNang: 'Cân nặng (kg)',
  anUong: 'Ăn Uống: 1-5 (1 Tốt nhất - 5 Tệ nhất)',
  ketQua: '% Kết Quả Hoàn Thành',
  caiTien: 'Cải Tiến', // rich_text
  nguToiQua: 'Giờ Ngủ Tối Qua', // date+time
  thucSangNay: 'Giờ Thức Dậy Sáng Nay', // date+time
}

// Cột chỉ đọc (công thức) để hiển thị.
const READONLY = {
  soGioNgu: 'Số Giờ Ngủ',
  thoiQuen: 'Thói Quen %',
  thu: 'Thứ',
}

// Câu hỏi tự vấn — heading khớp đúng chữ trong trang mẫu "@Hôm nay".
export const QUESTIONS = [
  // Đầu ngày
  { id: 'q1', part: 'sang', heading: 'Điều gì sẽ khiến ngày hôm nay trở nên tuyệt vời?', hint: 'Liệt kê 1–3 việc khiến hôm nay là ngày thành công.' },
  { id: 'q2', part: 'sang', heading: 'Danh Sách Việc Không Làm', hint: 'Tham khảo các ghi chú "Cải Tiến" của hôm qua.' },
  { id: 'q3', part: 'sang', heading: 'Hôm nay bạn sẵn sàng trao đi điều tốt đẹp gì cho người khác?', hint: 'Cho đi là nhận lại.' },
  { id: 'q4', part: 'sang', heading: 'Bạn hạnh phúc về điều gì ngay lúc này?', hint: 'Một điều khiến bạn thấy hạnh phúc.' },
  // Cuối ngày
  { id: 'q5', part: 'toi', heading: 'Chiến Thắng Hôm Nay', hint: 'Những điều bạn đã làm tốt.' },
  { id: 'q6', part: 'toi', heading: 'Bài học Hôm Nay', hint: '' },
  { id: 'q7', part: 'toi', heading: 'Điều gì bạn muốn nhớ trong Hôm Nay', hint: '' },
  { id: 'q8', part: 'toi', heading: 'Bạn đã học hay nghe gì hôm nay', hint: '' },
  { id: 'q9', part: 'toi', heading: 'Có điều gì nổi bật mà bạn đã học hay nghe được?', hint: '' },
  { id: 'q10', part: 'toi', heading: 'Bạn cần làm gì tiếp theo để đạt được mục tiêu của mình?', hint: '' },
  { id: 'q11', part: 'toi', heading: 'Bây giờ bạn đang cảm thấy cảm xúc gì?', hint: '' },
]

const HEADING_TYPES = ['heading_1', 'heading_2', 'heading_3']

// ====== Gọi proxy ======
async function call(path, method = 'GET', body) {
  const res = await fetch('/api/notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, method, body }),
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const msg = data?.message || data?.error || `Lỗi Notion (HTTP ${res.status})`
    throw new Error(msg)
  }
  return data
}

// ====== Ngày tháng theo giờ Việt Nam ======
export function todayISO() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return fmt.format(new Date()) // YYYY-MM-DD
}

export function prettyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const thu = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'UTC' }).format(dt)
  return { thu: thu.charAt(0).toUpperCase() + thu.slice(1), dm: `${d} tháng ${m}, ${y}` }
}

// ====== Tìm / tạo trang ngày ======
async function findDay(dateISO) {
  const data = await call(`/v1/databases/${DB_ID}/query`, 'POST', {
    filter: { property: DATE_PROP, date: { equals: dateISO } },
    page_size: 1,
  })
  return data.results?.[0] || null
}

function journalSkeleton() {
  // Tạo cấu trúc câu hỏi cho trang do app tạo (heading + 1 bullet trống để điền).
  const blocks = []
  const push = (text, type, opts = {}) =>
    blocks.push({ object: 'block', type, [type]: { rich_text: text ? [{ type: 'text', text: { content: text } }] : [], ...opts } })

  push('Khởi Động Đầu Ngày', 'heading_1')
  for (const q of QUESTIONS.filter((x) => x.part === 'sang')) {
    push(q.heading, 'heading_2')
    push('', 'bulleted_list_item')
  }
  push('Cuối Ngày', 'heading_1')
  for (const q of QUESTIONS.filter((x) => x.part === 'toi')) {
    push(q.heading, 'heading_2')
    push('', 'bulleted_list_item')
  }
  return blocks
}

async function createDay(dateISO) {
  const page = await call('/v1/pages', 'POST', {
    parent: { database_id: DB_ID },
    properties: {
      [TITLE_PROP]: {
        title: [
          { type: 'mention', mention: { type: 'date', date: { start: dateISO } } },
          { type: 'text', text: { content: ' Trí' } },
        ],
      },
      [DATE_PROP]: { date: { start: dateISO } },
    },
  })
  await call(`/v1/blocks/${page.id}/children`, 'PATCH', { children: journalSkeleton() })
  return page
}

async function listChildren(pageId) {
  const blocks = []
  let cursor
  do {
    const q = cursor ? `?start_cursor=${cursor}&page_size=100` : '?page_size=100'
    const data = await call(`/v1/blocks/${pageId}/children${q}`)
    blocks.push(...(data.results || []))
    cursor = data.has_more ? data.next_cursor : null
  } while (cursor)
  return blocks
}

// ====== Parse ======
function plain(block) {
  const rt = block[block.type]?.rich_text || []
  return rt.map((t) => t.plain_text || '').join('').trim()
}

function formulaVal(prop) {
  const f = prop?.formula
  if (!f) return null
  if (f.type === 'number') return f.number
  if (f.type === 'string') return f.string
  return null
}

function parseReadonly(page) {
  const props = page.properties || {}
  return {
    soGioNgu: formulaVal(props[READONLY.soGioNgu]),
    thoiQuen: formulaVal(props[READONLY.thoiQuen]),
  }
}

function timeFromDate(prop) {
  const start = prop?.date?.start
  if (!start) return ''
  const m = start.match(/T(\d{2}:\d{2})/)
  return m ? m[1] : ''
}

// Tìm bullet trả lời đầu tiên nằm dưới một heading (bỏ qua đoạn chú thích).
function findAnswerBlock(blocks, heading) {
  const i = blocks.findIndex((b) => HEADING_TYPES.includes(b.type) && plain(b) === heading)
  if (i < 0) return { headingId: null, block: null }
  const headingId = blocks[i].id
  for (let j = i + 1; j < blocks.length; j++) {
    const b = blocks[j]
    if (HEADING_TYPES.includes(b.type) || b.type === 'divider') break
    if (b.type === 'bulleted_list_item' || b.type === 'numbered_list_item') {
      return { headingId, block: b }
    }
  }
  return { headingId, block: null }
}

function parseDay(page, blocks) {
  const props = page.properties || {}

  const tasks = {}
  for (const t of TASKS) tasks[t.prop] = !!props[t.prop]?.checkbox

  const num = (name) => (typeof props[name]?.number === 'number' ? props[name].number : '')
  const metrics = {
    tinhTao: num(METRICS.tinhTao),
    canNang: num(METRICS.canNang),
    anUong: num(METRICS.anUong),
    ketQua: typeof props[METRICS.ketQua]?.number === 'number' ? Math.round(props[METRICS.ketQua].number * 100) : '',
    caiTien: (props[METRICS.caiTien]?.rich_text || []).map((t) => t.plain_text).join(''),
    nguToiQua: timeFromDate(props[METRICS.nguToiQua]),
    thucSangNay: timeFromDate(props[METRICS.thucSangNay]),
  }

  const readonly = parseReadonly(page)

  const answers = {}
  const blockMap = {} // questionId -> { headingId, blockId, type }
  for (const q of QUESTIONS) {
    const { headingId, block } = findAnswerBlock(blocks, q.heading)
    answers[q.id] = block ? plain(block) : ''
    blockMap[q.id] = { headingId, blockId: block?.id || null, type: block?.type || 'bulleted_list_item' }
  }

  return { tasks, metrics, readonly, answers, blockMap }
}

// ====== API công khai cho UI ======
export async function loadDay(dateISO) {
  let page = await findDay(dateISO)
  let created = false
  if (!page) {
    page = await createDay(dateISO)
    created = true
    page = await findDay(dateISO) // đọc lại để có đầy đủ properties
  }
  const blocks = await listChildren(page.id)
  return { pageId: page.id, url: page.url, created, ...parseDay(page, blocks) }
}

export async function toggleTask(pageId, prop, value) {
  const page = await call(`/v1/pages/${pageId}`, 'PATCH', {
    properties: { [prop]: { checkbox: !!value } },
  })
  return parseReadonly(page)
}

export async function refreshFormulas(pageId) {
  const page = await call(`/v1/pages/${pageId}`)
  return parseReadonly(page)
}

function timeToISO(dateISO, hhmm) {
  if (!hhmm) return null
  return `${dateISO}T${hhmm}:00+07:00`
}

export async function saveMetrics(pageId, dateISO, m) {
  const properties = {}
  const setNum = (name, v) => {
    if (v === '' || v === null || v === undefined) properties[name] = { number: null }
    else properties[name] = { number: Number(v) }
  }
  setNum(METRICS.tinhTao, m.tinhTao)
  setNum(METRICS.canNang, m.canNang)
  setNum(METRICS.anUong, m.anUong)
  properties[METRICS.ketQua] = m.ketQua === '' || m.ketQua === null ? { number: null } : { number: Number(m.ketQua) / 100 }
  properties[METRICS.caiTien] = { rich_text: m.caiTien ? [{ type: 'text', text: { content: m.caiTien } }] : [] }

  const ngu = timeToISO(dateISO, m.nguToiQua)
  const thuc = timeToISO(dateISO, m.thucSangNay)
  properties[METRICS.nguToiQua] = ngu ? { date: { start: ngu } } : { date: null }
  properties[METRICS.thucSangNay] = thuc ? { date: { start: thuc } } : { date: null }

  await call(`/v1/pages/${pageId}`, 'PATCH', { properties })
}

// Ghi câu trả lời: cập nhật bullet sẵn có, hoặc thêm bullet mới ngay dưới heading.
export async function saveAnswers(pageId, blockMap, answers, dirtyIds) {
  for (const id of dirtyIds) {
    const ref = blockMap[id]
    const text = answers[id] ?? ''
    const rich = text ? [{ type: 'text', text: { content: text } }] : []
    if (ref?.blockId) {
      const type = ref.type === 'numbered_list_item' ? 'numbered_list_item' : 'bulleted_list_item'
      await call(`/v1/blocks/${ref.blockId}`, 'PATCH', { [type]: { rich_text: rich } })
    } else if (ref?.headingId) {
      await call(`/v1/blocks/${pageId}/children`, 'PATCH', {
        after: ref.headingId,
        children: [{ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: rich } }],
      })
    }
  }
}

// ====== Việc cần làm (database Nhiệm Vụ) ======
export async function listTodos(dateISO) {
  const data = await call(`/v1/databases/${TASKS_DB_ID}/query`, 'POST', {
    filter: { property: TD.date, date: { equals: dateISO } },
    sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
    page_size: 100,
  })
  return (data.results || []).map((p) => ({
    id: p.id,
    name: (p.properties[TD.title]?.title || []).map((t) => t.plain_text).join(''),
    done: !!p.properties[TD.done]?.checkbox,
  }))
}

export async function addTodo(dateISO, name) {
  const page = await call('/v1/pages', 'POST', {
    parent: { database_id: TASKS_DB_ID },
    properties: {
      [TD.title]: { title: [{ type: 'text', text: { content: name } }] },
      [TD.date]: { date: { start: dateISO } },
      [TD.done]: { checkbox: false },
      [TD.status]: { select: { name: 'Hoạt Động' } },
    },
  })
  return { id: page.id, name, done: false }
}

export async function toggleTodo(taskId, done, dateISO) {
  await call(`/v1/pages/${taskId}`, 'PATCH', {
    properties: {
      [TD.done]: { checkbox: !!done },
      [TD.doneDate]: done ? { date: { start: dateISO } } : { date: null },
    },
  })
}

// Xoá = chuyển vào thùng rác Notion (khôi phục được trong 30 ngày).
export async function removeTodo(taskId) {
  await call(`/v1/pages/${taskId}`, 'PATCH', { archived: true })
}
