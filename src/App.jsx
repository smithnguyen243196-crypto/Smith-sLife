import React, { useEffect, useRef, useState } from 'react'
import Home from './modules/Home.jsx'
import KiemKet from './modules/KiemKet.jsx'
import ViCaNhan from './modules/ViCaNhan.jsx'
import Ngay from './modules/Ngay.jsx'
import TinhLai from './modules/TinhLai.jsx'
import './shell.css'

const TABS = [
  { id: 'home', label: 'Trang chủ', isHome: true },
  { id: 'ket', label: 'Kiểm Két' },
  { id: 'vi', label: 'Ví' },
  { id: 'ngay', label: 'Ngày' },
  { id: 'lai', label: 'Tính Lãi' },
]

const MODULES = {
  home: Home,
  ket: KiemKet,
  vi: ViCaNhan,
  ngay: Ngay,
  lai: TinhLai,
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
    </svg>
  )
}

function QuoteStrip() {
  const [q, setQ] = useState(null)
  useEffect(() => {
    fetch('/api/quote')
      .then((r) => r.json())
      .then((d) => { if (d && d.text) setQ(d) })
      .catch(() => {})
  }, [])
  if (!q) return null
  return (
    <div className="qotd">
      <em>“{q.text}”</em>
      {q.author ? <span className="qotd-ai"> — {q.author}</span> : null}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('home')
  // Giữ các module đã mở "sống" trong nền: chuyển tab không mất dữ liệu đang nhập
  const visited = useRef(new Set(['home']))
  visited.current.add(tab)

  return (
    <div className="shell">
      <QuoteStrip />

      <main className="shell-main">
        {TABS.map(({ id }) => {
          if (!visited.current.has(id)) return null
          const Mod = MODULES[id]
          return (
            <div key={id} hidden={tab !== id} className={id === 'ngay' ? 'pg pg-ngay' : undefined}>
              {id === 'home' ? <Mod openTab={setTab} /> : <Mod />}
            </div>
          )
        })}
      </main>

      <nav className="app-tabs">
        {TABS.map(({ id, label, isHome }) => (
          <button
            key={id}
            type="button"
            className={(isHome ? 'thome' : '') + (tab === id ? ' on' : '')}
            onClick={() => setTab(id)}
            title={label}
            aria-label={label}
          >
            {isHome ? <HomeIcon /> : label}
          </button>
        ))}
      </nav>
    </div>
  )
}
