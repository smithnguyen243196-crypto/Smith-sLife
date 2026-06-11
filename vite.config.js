import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Khi chạy `vite dev`, proxy /api sang Vercel dev (cổng 3000) nếu anh dùng `vercel dev`.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:3000" } },
});
