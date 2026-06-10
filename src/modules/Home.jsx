import React from 'react'
import './home.css'

const TILES = [
  { id: 'ket', cls: 't-ket', mono: '₫', name: 'Kiểm Két', desc: 'Đếm tiền, đối chiếu két cuối ngày' },
  { id: 'vi', cls: 't-vi', mono: 'V', name: 'Ví Cá Nhân', desc: 'Theo dõi thu chi cá nhân' },
  { id: 'ngay', cls: 't-ngay', mono: 'N', name: 'Ngày', desc: 'Nhật ký, thói quen, nhiệm vụ hôm nay' },
  { id: 'lai', cls: 't-lai', mono: '%', name: 'Tính Lãi · Huyên Thọ', desc: 'Tính lãi theo ngày cho khách hàng' },
]

export default function Home({ openTab }) {
  const now = new Date()
  const h = now.getHours()
  const greet = h < 11 ? 'Chào buổi sáng, Smith' : h < 14 ? 'Chào buổi trưa, Smith' : h < 18 ? 'Chào buổi chiều, Smith' : 'Chào buổi tối, Smith'
  const thu = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][now.getDay()]

  return (
    <div className="pg pg-home">
      <div className="home-wrap">
        <header>
          <div className="eyebrow">Bộ công cụ hằng ngày</div>
          <h1>{greet}</h1>
          <p className="today">
            <strong>{thu}</strong>, ngày {now.getDate()} tháng {now.getMonth() + 1} năm {now.getFullYear()}
          </p>
        </header>

        <nav className="hshelf">
          {TILES.map((t) => (
            <button key={t.id} type="button" className={'htile ' + t.cls} onClick={() => openTab(t.id)}>
              <span className="hmono">{t.mono}</span>
              <span className="htxt">
                <span className="htile-name">{t.name}</span>
                <span className="htile-desc">{t.desc}</span>
              </span>
              <span className="hchev">›</span>
            </button>
          ))}
        </nav>

        <footer className="hfoot">Vật tư nông nghiệp Huyên Thọ</footer>
      </div>
    </div>
  )
}
