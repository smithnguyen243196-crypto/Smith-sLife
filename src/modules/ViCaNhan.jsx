import React, { useEffect, useMemo, useRef, useState } from 'react'
import './vi.css'

const CATS = {
  income: ['💼 Lương', '💰 Kinh doanh', '🎁 Thưởng', '📈 Đầu tư', '🌾 Nông nghiệp', '🔄 Khác'],
  expense: ['🍜 Ăn uống', '💑 Đưa vợ', '🏠 Nhà ở', '🚗 Di chuyển', '🛍️ Mua sắm', '💊 Y tế', '📚 Học tập', '🎮 Giải trí', '⛽ Xăng xe', '🔄 Khác'],
}
const PERSONS = ['Anh Tài', 'Hải', 'Anh Thắng', 'Gin', 'Như Ý', 'Chị Hân', 'Tiên', 'Đô', 'Uyên']
const MONTH_NAMES = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

const getMonth = () => {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}
const getToday = () => {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}
const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
const fmtS = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace('.0', '') + 'tỷ'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + 'tr'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'k'
  return String(n)
}
const padR = (s, l) => String(s) + ' '.repeat(Math.max(0, l - String(s).length))
const padL = (s, l) => ' '.repeat(Math.max(0, l - String(s).length)) + String(s)

function download(content, filename, type) {
  const blob = new Blob([content], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

// Cấu hình cũ trong máy (nếu có) — gửi kèm để tương thích ngược, server ưu tiên env
function loadCfg() {
  try { return JSON.parse(localStorage.getItem('vcn_cfg') || '{}') } catch { return {} }
}

export default function ViCaNhan() {
  const [txns, setTxns] = useState([])
  const [month, setMonth] = useState(getMonth())
  const [tab, setTab] = useState('txns') // txns | stats | settings
  const [dot, setDot] = useState('loading') // ok | loading | err
  const [loadingList, setLoadingList] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef(null)

  // Sheet thêm giao dịch
  const [sheetOpen, setSheetOpen] = useState(false)
  const [curType, setCurType] = useState('expense')
  const [curWallet, setCurWallet] = useState('bank')
  const [curCat, setCurCat] = useState(CATS.expense[0])
  const [amtStr, setAmtStr] = useState('')
  const [person, setPerson] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(getToday())
  const [showPersons, setShowPersons] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverErr, setServerErr] = useState('')

  const cfg = useMemo(loadCfg, [])

  function toast(msg) {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2800)
  }

  async function loadData(showToast = true) {
    setDot('loading')
    setLoadingList(true)
    setServerErr('')
    try {
      const r = await fetch('/api/vi-notion-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cfg.token, dbId: cfg.dbId }),
      })
      const text = await r.text()
      let d
      try { d = JSON.parse(text) } catch { throw new Error('Server lỗi: ' + text.slice(0, 60)) }
      if (!r.ok) throw new Error(d.error || 'Lỗi tải dữ liệu')
      setTxns(d.txns || [])
      setDot('ok')
      if (showToast) toast('✅ Đã tải ' + (d.txns || []).length + ' giao dịch')
    } catch (e) {
      setDot('err')
      setServerErr(e.message)
      toast('❌ ' + e.message)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => { loadData(false) }, []) // eslint-disable-line

  // ===== Tính toán theo tháng =====
  const filtered = useMemo(() => txns.filter((t) => t.date && t.date.indexOf(month) === 0), [txns, month])
  const inc = filtered.reduce((s, t) => s + (t.type === 'income' ? t.amount : 0), 0)
  const exp = filtered.reduce((s, t) => s + (t.type === 'expense' ? t.amount : 0), 0)
  const bal = inc - exp
  const monthParts = month.split('-')

  const groups = useMemo(() => {
    const g = {}
    filtered.forEach((t) => { (g[t.date] = g[t.date] || []).push(t) })
    return Object.keys(g).sort((a, b) => (b > a ? 1 : -1)).map((d) => [d, g[d]])
  }, [filtered])

  function dateLabel(date) {
    const d = new Date(date + 'T00:00:00')
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const diff = Math.round((now - d) / 86400000)
    return diff === 0 ? '📅 Hôm nay' : diff === 1 ? '📅 Hôm qua' : '📅 ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
  }

  // ===== Sheet =====
  function openSheet() {
    setAmtStr(''); setPerson(''); setNote(''); setDate(getToday())
    setSheetOpen(true)
  }
  function pad(v) {
    setAmtStr((s) => (v === 'del' ? s.slice(0, -1) : s.length < 12 ? s + v : s))
  }
  function setType(t) {
    setCurType(t)
    setCurCat(CATS[t][0])
  }
  const amount = parseInt(amtStr || '0', 10) || 0

  async function saveTxn() {
    if (!amount) { toast('⚠️ Vui lòng nhập số tiền'); return }
    setSaving(true)
    const txn = {
      id: String(Date.now()), notionId: '',
      type: curType, wallet: curWallet, amount,
      category: curCat, person: person.trim(), note: note.trim(),
      date: date || getToday(),
      synced: false, syncing: true,
    }
    setTxns((l) => [txn, ...l])
    setSheetOpen(false)
    setSaving(false)
    setAmtStr('')

    try {
      let nameStr = txn.note || txn.category
      if (txn.person) nameStr += ' — ' + (txn.type === 'income' ? 'Từ: ' : 'Đến: ') + txn.person
      const payload = {
        Name: { title: [{ text: { content: nameStr } }] },
        'Loại': { select: { name: txn.type === 'income' ? 'Thu' : 'Chi' } },
        'Số tiền': { number: txn.amount },
        'Danh mục': { rich_text: [{ text: { content: txn.category } }] },
        'Ví': { select: { name: txn.wallet === 'cash' ? 'Tiền mặt' : 'Tài khoản' } },
        'Người': { rich_text: [{ text: { content: txn.person || '' } }] },
        'Ngày': { date: { start: txn.date } },
        'Ghi chú': { rich_text: [{ text: { content: txn.note || '' } }] },
      }
      const r = await fetch('/api/vi-notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cfg.token, dbId: cfg.dbId, payload }),
      })
      const d = await r.json()
      setTxns((l) => l.map((t) => (t.id === txn.id ? { ...t, syncing: false, synced: r.ok && d.success, notionId: d.id || '' } : t)))
      toast(r.ok ? '📒 Đã lưu vào Notion!' : '⚠️ Lỗi: ' + (d.error || 'kiểm tra cài đặt'))
    } catch {
      setTxns((l) => l.map((t) => (t.id === txn.id ? { ...t, syncing: false } : t)))
      toast('❌ Không kết nối được Notion')
    }
  }

  async function delTxn(localId, notionId) {
    setTxns((l) => l.filter((t) => t.id !== localId))
    if (notionId) {
      try {
        await fetch('/api/vi-notion-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: cfg.token, pageId: notionId }),
        })
        toast('🗑️ Đã xoá')
      } catch { toast('⚠️ Xoá local nhưng chưa xoá Notion') }
    }
  }

  // ===== Xuất file =====
  function exportCSV() {
    const rows = [['Ngày', 'Loại', 'Danh mục', 'Số tiền', 'Ví', 'Người', 'Lý do']]
    filtered.forEach((t) => rows.push([t.date, t.type === 'income' ? 'Thu' : 'Chi', t.category || '', t.amount, t.wallet === 'cash' ? 'Tiền mặt' : 'Tài khoản', t.person || '', t.note || '']))
    const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n')
    download('\uFEFF' + csv, 'thu-chi-' + month + '.csv', 'text/csv;charset=utf-8')
    toast('📊 Đã xuất CSV!')
  }

  function exportTXT() {
    const title = 'BÁO CÁO THU CHI — ' + MONTH_NAMES[parseInt(monthParts[1], 10)].toUpperCase() + ' ' + monthParts[0]
    const sep = '═'.repeat(52), line = '─'.repeat(52)
    let txt = title + '\n' + sep + '\n\n'
    const section = (label, list, totalLabel, total) => {
      if (!list.length) return ''
      let s = label + '\n' + line + '\n'
      s += padR('Ngày', 12) + padR('Danh mục', 18) + padL('Số tiền', 14) + '\n' + line + '\n'
      list.forEach((t) => {
        s += padR(t.date.slice(5), 12) + padR((t.category || '').slice(0, 16), 18) + padL(fmtS(t.amount), 14) + '\n'
        const detail = []
        if (t.person) detail.push('Người: ' + t.person)
        if (t.note) detail.push('Lý do: ' + t.note)
        if (detail.length) s += '    ' + detail.join(' | ') + '\n'
      })
      s += line + '\n' + padR(totalLabel, 30) + padL(fmt(total), 22) + '\n\n'
      return s
    }
    txt += section('▲ THU NHẬP', filtered.filter((t) => t.type === 'income'), 'TỔNG THU', inc)
    txt += section('▼ CHI TIÊU', filtered.filter((t) => t.type === 'expense'), 'TỔNG CHI', exp)
    txt += sep + '\n' + padR('SỐ DƯ', 30) + padL(fmt(inc - exp), 22) + '\n' + sep + '\n'
    txt += '\nXuất lúc: ' + new Date().toLocaleString('vi-VN')
    download(txt, 'bao-cao-' + month + '.txt', 'text/plain;charset=utf-8')
    toast('📄 Đã xuất báo cáo!')
  }

  // ===== Thống kê =====
  const stats = useMemo(() => {
    const catMap = {}
    filtered.forEach((t) => { catMap[t.category] = (catMap[t.category] || 0) + t.amount })
    const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1])
    let bankExp = 0, cashExp = 0, bankInc = 0, cashInc = 0
    filtered.forEach((t) => {
      if (t.type === 'expense' && t.wallet === 'cash') cashExp += t.amount
      else if (t.type === 'expense') bankExp += t.amount
      else if (t.type === 'income' && t.wallet === 'cash') cashInc += t.amount
      else bankInc += t.amount
    })
    return {
      expCats: cats.filter((c) => CATS.expense.includes(c[0])),
      incCats: cats.filter((c) => CATS.income.includes(c[0])),
      bankExp, cashExp, bankInc, cashInc,
    }
  }, [filtered])

  const personsFiltered = PERSONS.filter((p) => !person || p.toLowerCase().includes(person.toLowerCase()))

  const CatBlock = ({ title, list, total, color }) => !list.length ? null : (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      {list.map(([c, v]) => (
        <div className="srow" key={c}>
          <div className="srow-name">{c}</div>
          <div className="bar-bg"><div className="bar-fg" style={{ width: (total ? Math.round((v / total) * 100) : 0) + '%', background: color }} /></div>
          <div className="srow-val" style={{ color }}>{fmtS(v)}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="pg pg-vi">
      <div className="vi-app">
        <div className="hdr">
          <div className="hdr-row">
            <div className="hdr-name">Ví cá nhân · Smith</div>
            <div className="hdr-right">
              <span className={'dot ' + dot}></span>
              <button className="icon-btn" onClick={() => loadData()}>🔄</button>
              <button className="icon-btn" onClick={() => setTab('settings')}>⚙️</button>
            </div>
          </div>
        </div>

        <div className="bal-card">
          <div className="bal-lbl">Số dư tháng này</div>
          <div className={'bal-amt' + (bal > 0 ? ' pos' : bal < 0 ? ' neg' : '')}>{fmt(bal)}</div>
          <div className="bal-month">{MONTH_NAMES[parseInt(monthParts[1], 10)]} năm {monthParts[0]}</div>
          <div className="bal-row">
            <div className="mini"><div className="mini-lbl">↑ Thu</div><div className="mini-val inc">{fmt(inc)}</div></div>
            <div className="mini"><div className="mini-lbl">↓ Chi</div><div className="mini-val exp">{fmt(exp)}</div></div>
          </div>
        </div>

        <div className="mpick">
          <label>Tháng</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value || getMonth())} />
        </div>

        <div className="tabs">
          <button className={'tab' + (tab === 'txns' ? ' active' : '')} onClick={() => setTab('txns')}>📋 Giao dịch</button>
          <button className={'tab' + (tab === 'stats' ? ' active' : '')} onClick={() => setTab('stats')}>📊 Thống kê</button>
          <button className={'tab' + (tab === 'settings' ? ' active' : '')} onClick={() => setTab('settings')}>⚙️ Cài đặt</button>
        </div>

        {tab === 'txns' && (
          <div className="sec show">
            <div className="export-bar">
              <button className="export-btn" onClick={exportCSV}>📊 Xuất CSV</button>
              <button className="export-btn" onClick={exportTXT}>📄 Xuất Báo cáo</button>
            </div>
            {loadingList ? (
              <>
                {[0, 1, 2].map((i) => (
                  <div className="skel" key={i}><div className="skel-line" /><div className="skel-line s" /></div>
                ))}
              </>
            ) : !filtered.length ? (
              <div className="empty">📭 Chưa có giao dịch<br /><small>Bấm ➕ Thêm để bắt đầu</small></div>
            ) : (
              <div className="txn-scroll">
                {groups.map(([d, list]) => (
                  <React.Fragment key={d}>
                    <div className="grp-lbl">{dateLabel(d)}</div>
                    {list.map((t) => (
                      <div className="txn" key={t.id}>
                        <div className={'txn-ico ' + (t.type === 'income' ? 'inc' : 'exp')}>{t.type === 'income' ? '↑' : '↓'}</div>
                        <div className="txn-body">
                          <div className="txn-row1">
                            <div className="txn-cat">{t.category || '—'}</div>
                            <div className={'txn-amt ' + (t.type === 'income' ? 'inc' : 'exp')}>{(t.type === 'income' ? '+' : '-') + fmtS(t.amount)}</div>
                          </div>
                          <div className="txn-row2">
                            <div className="txn-meta">
                              {t.wallet === 'cash' ? <span className="badge badge-cash">💵</span> : <span className="badge badge-bank">🏦</span>}
                              {t.person ? <span className="badge badge-person">👤 {t.person}</span> : null}
                              {t.note ? <span style={{ color: 'var(--muted)' }}>{t.note}</span> : null}
                              {t.synced ? <span className="badge badge-notion">✓</span> : t.syncing ? <span className="badge badge-sync">⏳</span> : null}
                            </div>
                            <button className="del-btn" onClick={() => delTxn(t.id, t.notionId)}>×</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'stats' && (
          <div className="sec show">
            <div className="stat-card">
              <div className="stat-title">💳 Theo hình thức thanh toán</div>
              <div className="wrow"><span className="wrow-name" style={{ color: 'var(--purple)' }}>🏦 Tài khoản — Chi</span><span className="wrow-val" style={{ color: 'var(--red)' }}>{fmt(stats.bankExp)}</span></div>
              <div className="wrow"><span className="wrow-name" style={{ color: 'var(--gold)' }}>💵 Tiền mặt — Chi</span><span className="wrow-val" style={{ color: 'var(--red)' }}>{fmt(stats.cashExp)}</span></div>
              <div className="wrow"><span className="wrow-name" style={{ color: 'var(--purple)' }}>🏦 Tài khoản — Thu</span><span className="wrow-val" style={{ color: 'var(--green)' }}>{fmt(stats.bankInc)}</span></div>
              <div className="wrow"><span className="wrow-name" style={{ color: 'var(--gold)' }}>💵 Tiền mặt — Thu</span><span className="wrow-val" style={{ color: 'var(--green)' }}>{fmt(stats.cashInc)}</span></div>
            </div>
            <CatBlock title="💸 Chi tiêu theo danh mục" list={stats.expCats} total={exp} color="var(--red)" />
            <CatBlock title="💚 Thu nhập theo danh mục" list={stats.incCats} total={inc} color="var(--green)" />
            {!stats.expCats.length && !stats.incCats.length ? <div className="empty">Chưa có dữ liệu</div> : null}
          </div>
        )}

        {tab === 'settings' && (
          <div className="sec show">
            <div className="set-card">
              <div className="set-title">🔗 Kết nối Notion</div>
              <div className="set-desc">
                Token và Database ID đặt MỘT LẦN trên server (Vercel → Environment Variables: <code>VI_DB_ID</code>, dùng chung <code>NOTION_TOKEN</code>).
                Mọi thiết bị tự đồng bộ, không cần cài đặt gì trên từng máy.
              </div>
              <div className={'status ' + (dot === 'ok' ? 'ok' : 'warn')}>
                {dot === 'ok' ? '✅ Đã kết nối Notion (cấu hình server)' : '⚠️ ' + (serverErr || 'Chưa kết nối — kiểm tra VI_DB_ID trên Vercel')}
              </div>
            </div>
            <div className="set-card">
              <div className="set-title">🗄️ Dữ liệu</div>
              <div className="set-desc">Đã tải: <b>{txns.length}</b> giao dịch</div>
              <button className="data-btn" onClick={() => loadData()}>🔄 Tải lại từ Notion</button>
              <button className="data-btn" onClick={exportCSV}>📊 Xuất CSV tháng đang chọn</button>
            </div>
          </div>
        )}
      </div>

      <div className="bnav">
        <button className={'nav-item' + (tab === 'txns' ? ' active' : '')} onClick={() => setTab('txns')}><span className="ni">📋</span>Giao dịch</button>
        <button className="nav-item nav-home" onClick={() => setTab('txns')}><span className="ni">🏠</span>Home</button>
        <button className="nav-item" onClick={openSheet}><span className="ni">➕</span>Thêm</button>
      </div>

      <div className={'overlay' + (sheetOpen ? ' on' : '')} onClick={() => setSheetOpen(false)} />
      <div className={'sheet' + (sheetOpen ? ' on' : '')}>
        <div className="sheet-pull" />
        <div className="sheet-hdr">
          <div className="sheet-title">Giao dịch mới</div>
          <button className="sheet-back" onClick={() => setSheetOpen(false)}>✕ Đóng</button>
        </div>

        <div className="type-row">
          <button className={'type-btn exp' + (curType === 'expense' ? ' on' : '')} onClick={() => setType('expense')}>↓ Chi tiêu</button>
          <button className={'type-btn inc' + (curType === 'income' ? ' on' : '')} onClick={() => setType('income')}>↑ Thu nhập</button>
        </div>

        <div className={'amt-box' + (amount > 0 ? ' has ' : ' ') + curType}>{fmt(amount)}</div>

        <div className="numpad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '000'].map((n) => (
            <button className="num" key={n} onClick={() => pad(n)}>{n}</button>
          ))}
          <button className="num del" onClick={() => pad('del')}>⌫</button>
        </div>

        <div className="flbl">Thanh toán bằng</div>
        <div className="wallet-row">
          <button className={'wallet-btn' + (curWallet === 'bank' ? ' bank-on' : '')} onClick={() => setCurWallet('bank')}>🏦 Tài khoản</button>
          <button className={'wallet-btn' + (curWallet === 'cash' ? ' cash-on' : '')} onClick={() => setCurWallet('cash')}>💵 Tiền mặt</button>
        </div>

        <div className="flbl">Danh mục</div>
        <div className="cat-wrap">
          {CATS[curType].map((c) => (
            <div className={'cat-chip' + (c === curCat ? ' on' : '')} key={c} onClick={() => setCurCat(c)}>{c}</div>
          ))}
        </div>

        <div className="flbl">{curType === 'income' ? '👤 Người đưa' : '👤 Người nhận'}</div>
        <div className="person-wrap">
          <input
            className="fld-in" placeholder="Nhập tên hoặc chọn..."
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            onFocus={() => setShowPersons(true)}
            onBlur={() => setTimeout(() => setShowPersons(false), 200)}
          />
          <div className={'person-list' + (showPersons && personsFiltered.length ? ' show' : '')}>
            {personsFiltered.map((p) => (
              <div className="person-opt" key={p} onMouseDown={() => { setPerson(p); setShowPersons(false) }}>{p}</div>
            ))}
          </div>
        </div>

        <div className="flbl">📝 Lý do / Ghi chú</div>
        <input className="note-in" placeholder="Nhập lý do..." value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="flbl" style={{ marginTop: 12 }}>📅 Ngày</div>
        <input className="date-in" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <button className="save-btn" disabled={saving} onClick={saveTxn}>{saving ? '⏳ Đang lưu...' : '💾 Lưu giao dịch'}</button>
      </div>

      {toastMsg ? <div className="vi-toast">{toastMsg}</div> : null}
    </div>
  )
}
