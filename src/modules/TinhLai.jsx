import React, { useEffect, useMemo, useState } from 'react'
import './tinhlai.css'

const RATES = ['1.0', '1.5', '2.0', '2.5', '3.0']

const todayStr = () => {
  const d = new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}
const fmt = (n) => (n === null || isNaN(n) ? '0' : Math.round(n).toLocaleString('vi-VN'))
const parseMoney = (str) => {
  const digits = (str || '').replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export default function TinhLai() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState(todayStr())
  const [amountStr, setAmountStr] = useState('')
  const [selectedRate, setSelectedRate] = useState(null)
  const [usingCustom, setUsingCustom] = useState(false)
  const [customRate, setCustomRate] = useState('')
  const [name, setName] = useState('')

  // Lịch sử tính lãi — đồng bộ mọi thiết bị qua /api/sync?key=tinhlai
  const [history, setHistory] = useState([])
  const [histState, setHistState] = useState('loading') // loading | ok | err
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    fetch('/api/sync?key=tinhlai')
      .then((r) => r.json())
      .then((d) => {
        setHistory((d.data && d.data.items) || [])
        setHistState('ok')
      })
      .catch(() => setHistState('err'))
  }, [])

  function toast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0
    const diff = Math.round((new Date(endDate) - new Date(startDate)) / 86400000)
    return diff > 0 ? diff : 0
  }, [startDate, endDate])

  const amount = parseMoney(amountStr)
  const rate = usingCustom
    ? (() => { const r = parseFloat((customRate || '').replace(',', '.')); return isNaN(r) ? null : r })()
    : selectedRate !== null ? parseFloat(selectedRate) : null

  const interest = amount > 0 && rate !== null && days > 0 ? (amount * (rate / 100) / 30) * days : 0

  function pickRate(r) {
    setSelectedRate(r)
    setUsingCustom(false)
    setCustomRate('')
  }
  function toggleCustom() {
    setUsingCustom((v) => {
      const next = !v
      if (next) setSelectedRate(null)
      return next
    })
  }
  function reset() {
    setStartDate(''); setEndDate(todayStr()); setAmountStr(''); setName('')
    setSelectedRate(null); setUsingCustom(false); setCustomRate('')
  }

  async function pushHistory(items) {
    setHistory(items)
    try {
      const r = await fetch('/api/sync?key=tinhlai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!r.ok) throw new Error()
      setHistState('ok')
      return true
    } catch {
      setHistState('err')
      return false
    }
  }

  async function saveResult() {
    if (!(amount > 0 && rate !== null && days > 0)) { toast('⚠️ Nhập đủ số tiền, lãi suất, ngày'); return }
    const item = {
      id: String(Date.now()),
      name: name.trim(),
      startDate, endDate, days,
      amount, rate, interest: Math.round(interest),
      savedAt: new Date().toISOString(),
    }
    const ok = await pushHistory([item, ...history].slice(0, 50))
    toast(ok ? '💾 Đã lưu — đồng bộ mọi thiết bị' : '⚠️ Đã lưu tạm, chưa đồng bộ được')
  }

  async function delItem(id) {
    await pushHistory(history.filter((x) => x.id !== id))
  }

  return (
    <div className="pg pg-lai">
      <div className="tl-wrap">
        <div className="tl-header">
          <div className="logo-box"><img src="/logo-huyen-tho.jpg" alt="Vật tư nông nghiệp Huyên Thọ" /></div>
          <div className="tagline">CÔNG CỤ TÍNH LÃI SUẤT</div>
        </div>

        <div className="tl-card">
          <div className="field">
            <div className="label"><span className="ldot"></span>Ngày bắt đầu</div>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="field">
            <div className="label"><span className="ldot"></span>Ngày tính lãi</div>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="field">
            <div className="days-row">
              <span className="dlabel">Số ngày</span>
              <span className="dval">{days} <small>ngày</small></span>
            </div>
          </div>
        </div>

        <div className="tl-card">
          <div className="field">
            <div className="label"><span className="ldot"></span>Số tiền tính lãi</div>
            <div className="money-wrap">
              <input
                type="tel" inputMode="numeric" placeholder="0" autoComplete="off"
                value={amountStr}
                onChange={(e) => {
                  const raw = parseMoney(e.target.value)
                  setAmountStr(raw ? raw.toLocaleString('vi-VN') : '')
                }}
              />
              <span className="cur">₫</span>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <div className="label"><span className="ldot"></span>Lãi suất <span className="label-sub">(%/tháng)</span></div>
            <div className="rate-grid">
              {RATES.map((r) => (
                <button key={r} className={'rate-btn' + (selectedRate === r ? ' active' : '')} onClick={() => pickRate(r)}>{r}</button>
              ))}
            </div>
            <button className={'custom-toggle' + (usingCustom ? ' active' : '')} onClick={toggleCustom}>✎ Tự nhập lãi suất khác</button>
            {usingCustom && (
              <div className="custom-input show">
                <input type="tel" inputMode="decimal" placeholder="Nhập lãi suất, ví dụ 1.8" autoComplete="off"
                  value={customRate} onChange={(e) => setCustomRate(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <div className="tl-card result-card">
          <div className="res-title">Tiền lãi</div>
          <div className="res-amount">{fmt(interest)} <span className="vnd">₫</span></div>
          <div className="res-formula">
            {amount > 0 && rate !== null && days > 0 ? (
              <>{fmt(amount)} ₫ × {rate}% ÷ 30 × {days} ngày<br />= <b style={{ color: '#fff' }}>{fmt(interest)} ₫</b></>
            ) : 'Nhập số tiền và chọn lãi suất để tính.'}
          </div>
          <div className="res-total">
            <span className="lbl">Tổng gốc + lãi</span>
            <span className="val">{fmt(amount + interest)} ₫</span>
          </div>
        </div>

        <div className="tl-card">
          <div className="field" style={{ marginBottom: 10 }}>
            <div className="label"><span className="ldot"></span>Tên khách / ghi chú (tuỳ chọn)</div>
            <input type="text" placeholder="Ví dụ: Chú Ba — phân DAP" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button className="save-result" onClick={saveResult}>💾 Lưu kết quả (đồng bộ mọi thiết bị)</button>
        </div>

        <div className="tl-card">
          <div className="hist-head">
            <span className="hist-title">📒 Lịch sử đã lưu</span>
            <span className={'hist-dot ' + histState}></span>
          </div>
          {histState === 'loading' ? (
            <div className="hist-empty">Đang tải...</div>
          ) : !history.length ? (
            <div className="hist-empty">Chưa có kết quả nào được lưu.</div>
          ) : (
            history.map((x) => (
              <div className="hist-item" key={x.id}>
                <div className="hist-main">
                  <div className="hist-name">{x.name || 'Không tên'} · {x.days} ngày · {x.rate}%</div>
                  <div className="hist-sub">{x.startDate} → {x.endDate} · Gốc {fmt(x.amount)} ₫</div>
                </div>
                <div className="hist-right">
                  <div className="hist-interest">+{fmt(x.interest)} ₫</div>
                  <button className="hist-del" onClick={() => delItem(x.id)}>×</button>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="reset" onClick={reset}>↺ Làm mới</button>
        <div className="foot">Vật tư nông nghiệp Huyên Thọ · Kỹ thuật</div>
      </div>

      {toastMsg ? <div className="tl-toast">{toastMsg}</div> : null}
    </div>
  )
}
