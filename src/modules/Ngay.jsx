import './ngay.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  TASKS,
  QUESTIONS,
  loadDay,
  toggleTask,
  saveMetrics,
  saveAnswers,
  listTodos,
  addTodo,
  toggleTodo,
  removeTodo,
  todayISO,
  prettyDate,
} from './ngay-notion'

function formatPct(v) {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'string') return v
  const n = v <= 1 ? v * 100 : v
  return Math.round(n) + '%'
}

function SunArc({ done, total }) {
  const frac = total ? done / total : 0
  // Nửa cung tròn từ trái (180°) sang phải (0°). Mặt trời chạy dọc cung khi hoàn thành.
  const r = 92
  const cx = 110
  const cy = 110
  const ang = Math.PI - frac * Math.PI
  const sunX = cx + r * Math.cos(ang)
  const sunY = cy - r * Math.sin(ang)
  const circ = Math.PI * r
  return (
    <svg className="arc" viewBox="0 0 220 130" role="img" aria-label={`Hoàn thành ${done}/${total}`}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} className="arc-track" />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        className="arc-fill"
        style={{ strokeDasharray: circ, strokeDashoffset: circ * (1 - frac) }}
      />
      <circle cx={sunX} cy={sunY} r="9" className="arc-sun" />
      <text x={cx} y={cy - 18} className="arc-num">{done}<tspan className="arc-den">/{total}</tspan></text>
      <text x={cx} y={cy + 4} className="arc-cap">nhiệm vụ</text>
    </svg>
  )
}

export default function Ngay() {
  const dateISO = useMemo(() => todayISO(), [])
  const { thu, dm } = prettyDate(dateISO)

  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')
  const [pageId, setPageId] = useState(null)
  const [pageUrl, setPageUrl] = useState(null)
  const [created, setCreated] = useState(false)

  const [tasks, setTasks] = useState({})
  const [answers, setAnswers] = useState({})
  const [metrics, setMetrics] = useState({})
  const [readonly, setReadonly] = useState({})
  const blockMapRef = useRef({})

  const [dirtyAnswers, setDirtyAnswers] = useState(new Set())
  const [metricsDirty, setMetricsDirty] = useState(false)
  const [savingJournal, setSavingJournal] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [showMetrics, setShowMetrics] = useState(false)
  const [showSang, setShowSang] = useState(true)
  const [showToi, setShowToi] = useState(true)
  const [busyTask, setBusyTask] = useState(null)

  // Việc cần làm
  const [todos, setTodos] = useState([])
  const [todosError, setTodosError] = useState('')
  const [newTodo, setNewTodo] = useState('')
  const [addingTodo, setAddingTodo] = useState(false)

  async function refresh() {
    setStatus('loading')
    setError('')
    try {
      const d = await loadDay(dateISO)
      setPageId(d.pageId)
      setPageUrl(d.url)
      setCreated(d.created)
      setTasks(d.tasks)
      setAnswers(d.answers)
      setMetrics(d.metrics)
      setReadonly(d.readonly)
      blockMapRef.current = d.blockMap
      setDirtyAnswers(new Set())
      setMetricsDirty(false)
      setStatus('ready')
    } catch (e) {
      setError(String(e.message || e))
      setStatus('error')
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTodos() {
    setTodosError('')
    try {
      setTodos(await listTodos(dateISO))
    } catch (e) {
      setTodosError('Chưa đọc được danh sách việc cần làm. Kiểm tra đã chia sẻ database "Nhiệm Vụ" cho integration chưa.')
    }
  }

  useEffect(() => {
    if (status === 'ready') loadTodos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function onAddTodo() {
    const name = newTodo.trim()
    if (!name || addingTodo) return
    setAddingTodo(true)
    setTodosError('')
    try {
      const created = await addTodo(dateISO, name)
      setTodos((s) => [...s, created])
      setNewTodo('')
    } catch (e) {
      setTodosError('Không thêm được việc: ' + (e.message || e))
    } finally {
      setAddingTodo(false)
    }
  }

  async function onToggleTodo(td) {
    const next = !td.done
    setTodos((s) => s.map((x) => (x.id === td.id ? { ...x, done: next } : x)))
    try {
      await toggleTodo(td.id, next, dateISO)
    } catch (e) {
      setTodos((s) => s.map((x) => (x.id === td.id ? { ...x, done: !next } : x)))
      setTodosError('Không cập nhật được việc: ' + (e.message || e))
    }
  }

  async function onRemoveTodo(td) {
    if (!window.confirm(`Xoá việc "${td.name || 'này'}"? (Có thể khôi phục trong thùng rác Notion)`)) return
    const prev = todos
    setTodos((s) => s.filter((x) => x.id !== td.id))
    try {
      await removeTodo(td.id)
    } catch (e) {
      setTodos(prev)
      setTodosError('Không xoá được việc: ' + (e.message || e))
    }
  }

  const doneCount = TASKS.filter((t) => tasks[t.prop]).length

  async function onToggle(t) {
    if (busyTask) return
    const next = !tasks[t.prop]
    setTasks((s) => ({ ...s, [t.prop]: next })) // optimistic
    setBusyTask(t.prop)
    try {
      const ro = await toggleTask(pageId, t.prop, next)
      if (ro) setReadonly((s) => ({ ...s, ...ro }))
    } catch (e) {
      setTasks((s) => ({ ...s, [t.prop]: !next })) // hoàn tác
      setError('Không lưu được nhiệm vụ: ' + (e.message || e))
    } finally {
      setBusyTask(null)
    }
  }

  function onAnswer(id, val) {
    setAnswers((s) => ({ ...s, [id]: val }))
    setDirtyAnswers((s) => new Set(s).add(id))
  }

  function onMetric(key, val) {
    setMetrics((s) => ({ ...s, [key]: val }))
    setMetricsDirty(true)
  }

  async function saveJournal() {
    if (savingJournal) return
    setSavingJournal(true)
    setError('')
    try {
      if (metricsDirty) await saveMetrics(pageId, dateISO, metrics)
      if (dirtyAnswers.size) await saveAnswers(pageId, blockMapRef.current, answers, [...dirtyAnswers])
      // đọc lại để đồng bộ id các block mới tạo
      const d = await loadDay(dateISO)
      blockMapRef.current = d.blockMap
      setAnswers(d.answers)
      setMetrics(d.metrics)
      setReadonly(d.readonly)
      setDirtyAnswers(new Set())
      setMetricsDirty(false)
      setSavedAt(new Date())
    } catch (e) {
      setError('Lưu nhật ký thất bại: ' + (e.message || e))
    } finally {
      setSavingJournal(false)
    }
  }

  const hasUnsaved = dirtyAnswers.size > 0 || metricsDirty

  if (status === 'loading') {
    return (
      <main className="wrap">
        <div className="loading">
          <div className="dot" /> Đang mở ngày hôm nay…
        </div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="wrap">
        <div className="card err">
          <h2>Chưa kết nối được Notion</h2>
          <p>{error}</p>
          <p className="muted">
            Kiểm tra biến môi trường <code>NOTION_TOKEN</code> trên Vercel, và đã chia sẻ database
            “Ngày” cho integration chưa.
          </p>
          <button className="btn" onClick={refresh}>Thử lại</button>
        </div>
      </main>
    )
  }

  return (
    <main className="wrap">
      <header className="head">
        <div className="eyebrow">{thu}</div>
        <h1 className="date">{dm}</h1>
        {formatPct(readonly.thoiQuen) !== null && (
          <div className="habit-pill">
            <span className="habit-dot" />
            Thói Quen <strong>{formatPct(readonly.thoiQuen)}</strong>
          </div>
        )}
        <SunArc done={doneCount} total={TASKS.length} />
        {created && <p className="note">Đã tạo trang mới cho hôm nay trong Notion.</p>}
      </header>

      {/* 1. Khởi động ngày mới (đóng/mở được) */}
      <section className="block">
        <button className="collapse" onClick={() => setShowSang((v) => !v)} aria-expanded={showSang}>
          <span className="block-kicker">Buổi sáng</span>
          <h2>Khởi động ngày mới</h2>
          <span className={'chev' + (showSang ? ' open' : '')}>⌄</span>
        </button>
        {showSang && (
          <div className="qs">
            {QUESTIONS.filter((q) => q.part === 'sang').map((q) => (
              <div className="q" key={q.id}>
                <label htmlFor={q.id}>{q.heading}</label>
                {q.hint && <p className="q-hint">{q.hint}</p>}
                <textarea
                  id={q.id}
                  rows={2}
                  value={answers[q.id] || ''}
                  placeholder="Viết câu trả lời…"
                  onChange={(e) => onAnswer(q.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Thói quen hằng ngày */}
      <section className="block">
        <div className="block-head">
          <span className="block-kicker">Mỗi ngày</span>
          <h2>Thói quen hằng ngày</h2>
        </div>
        <ul className="tasks">
          {TASKS.map((t) => {
            const on = !!tasks[t.prop]
            return (
              <li key={t.prop}>
                <button
                  className={'task' + (on ? ' on' : '')}
                  onClick={() => onToggle(t)}
                  disabled={busyTask === t.prop}
                  aria-pressed={on}
                >
                  <span className="task-emoji">{t.emoji}</span>
                  <span className="task-label">{t.label}</span>
                  <span className="task-box" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* 3. Việc cần làm hôm nay (liên kết database Nhiệm Vụ) */}
      <section className="block">
        <div className="block-head">
          <span className="block-kicker">Hôm nay</span>
          <h2>Việc cần làm</h2>
        </div>
        <div className="todo-add">
          <input
            type="text"
            value={newTodo}
            placeholder="Thêm việc cho hôm nay…"
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onAddTodo() }}
          />
          <button className="btn small" onClick={onAddTodo} disabled={!newTodo.trim() || addingTodo}>
            {addingTodo ? '…' : 'Thêm'}
          </button>
        </div>
        <ul className="todos">
          {todos.length === 0 && !todosError && (
            <li className="todo-empty">Chưa có việc nào. Mỗi sáng thêm vài việc cần làm hôm nay.</li>
          )}
          {todos.map((td) => (
            <li key={td.id} className={'todo' + (td.done ? ' done' : '')}>
              <button className="todo-check" onClick={() => onToggleTodo(td)} aria-pressed={td.done} aria-label="Hoàn thành">
                <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </button>
              <span className="todo-name">{td.name || '(chưa đặt tên)'}</span>
              <button className="todo-del" onClick={() => onRemoveTodo(td)} aria-label="Xoá việc">×</button>
            </li>
          ))}
        </ul>
        {todosError && <p className="inline-err small">{todosError}</p>}
      </section>

      {/* 4. Cuối ngày (đóng/mở được) */}
      <section className="block">
        <button className="collapse" onClick={() => setShowToi((v) => !v)} aria-expanded={showToi}>
          <span className="block-kicker">Buổi tối</span>
          <h2>Cuối ngày</h2>
          <span className={'chev' + (showToi ? ' open' : '')}>⌄</span>
        </button>
        {showToi && (
          <div className="qs">
            {QUESTIONS.filter((q) => q.part === 'toi').map((q) => (
              <div className="q" key={q.id}>
                <label htmlFor={q.id}>{q.heading}</label>
                {q.hint && <p className="q-hint">{q.hint}</p>}
                <textarea
                  id={q.id}
                  rows={2}
                  value={answers[q.id] || ''}
                  placeholder="Viết câu trả lời…"
                  onChange={(e) => onAnswer(q.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Chỉ số */}
      <section className="block">
        <button className="collapse" onClick={() => setShowMetrics((v) => !v)} aria-expanded={showMetrics}>
          <span className="block-kicker">Theo dõi</span>
          <h2>Chỉ số trong ngày</h2>
          <span className={'chev' + (showMetrics ? ' open' : '')}>⌄</span>
        </button>
        {showMetrics && (
          <div className="metrics">
            <div className="m-row">
              <label>Giờ ngủ tối qua</label>
              <input type="time" value={metrics.nguToiQua || ''} onChange={(e) => onMetric('nguToiQua', e.target.value)} />
            </div>
            <div className="m-row">
              <label>Giờ thức sáng nay</label>
              <input type="time" value={metrics.thucSangNay || ''} onChange={(e) => onMetric('thucSangNay', e.target.value)} />
            </div>
            {readonly.soGioNgu != null && (
              <div className="m-row ro">
                <label>Số giờ ngủ</label>
                <span>{Number(readonly.soGioNgu).toFixed(1)} giờ</span>
              </div>
            )}
            <div className="m-row">
              <label>Mức tỉnh táo (1–10)</label>
              <input type="number" min="1" max="10" value={metrics.tinhTao} onChange={(e) => onMetric('tinhTao', e.target.value)} />
            </div>
            <div className="m-row">
              <label>Cân nặng (kg)</label>
              <input type="number" step="0.1" value={metrics.canNang} onChange={(e) => onMetric('canNang', e.target.value)} />
            </div>
            <div className="m-row">
              <label>Ăn uống (1 tốt – 5 tệ)</label>
              <input type="number" min="1" max="5" value={metrics.anUong} onChange={(e) => onMetric('anUong', e.target.value)} />
            </div>
            <div className="m-row">
              <label>% Kết quả hoàn thành</label>
              <input type="number" min="0" max="100" value={metrics.ketQua} onChange={(e) => onMetric('ketQua', e.target.value)} />
            </div>
            <div className="q">
              <label>Cải Tiến</label>
              <textarea rows={2} value={metrics.caiTien || ''} placeholder="Điều cần cải tiến…" onChange={(e) => onMetric('caiTien', e.target.value)} />
            </div>
          </div>
        )}
      </section>

      {error && <p className="inline-err">{error}</p>}

      {pageUrl && (
        <a className="open-notion" href={pageUrl} target="_blank" rel="noreferrer">Mở trang này trong Notion ↗</a>
      )}

      {/* Thanh lưu */}
      <div className={'savebar' + (hasUnsaved ? ' active' : '')}>
        <span className="save-status">
          {savingJournal
            ? 'Đang lưu…'
            : hasUnsaved
              ? 'Có thay đổi chưa lưu'
              : savedAt
                ? `Đã lưu lúc ${savedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                : 'Nhiệm vụ tự lưu khi tích'}
        </span>
        <button className="btn" onClick={saveJournal} disabled={savingJournal || !hasUnsaved}>
          Lưu nhật ký
        </button>
      </div>
    </main>
  )
}
