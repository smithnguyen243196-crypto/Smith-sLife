import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Một project — nhiều trang:
//   /            → index.html      (trang chủ chọn công cụ)
//   /kiem-ket.html → app Kiểm Két  (React)
//   /ngay.html     → app Ngày      (React)
//   /vi-ca-nhan.html, /tinh-lai.html nằm trong public/ (HTML tĩnh, không cần build)
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        kiemket: resolve(__dirname, 'kiem-ket.html'),
        ngay: resolve(__dirname, 'ngay.html'),
      },
    },
  },
})
