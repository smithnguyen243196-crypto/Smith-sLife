# Smith Apps — 4 công cụ trong 1 trang

## Cấu trúc

```
smith-apps/
├── index.html          ← Trang chủ (chọn công cụ)
├── kiem-ket.html       ← App Kiểm Két (React)
├── ngay.html           ← App Ngày — nhật ký & nhiệm vụ (React)
├── public/
│   ├── vi-ca-nhan.html ← App Ví Cá Nhân (HTML tĩnh, giữ nguyên)
│   └── tinh-lai.html   ← App Tính Lãi Huyền Thọ (HTML tĩnh, giữ nguyên)
├── api/                ← Toàn bộ serverless function gộp chung
│   ├── notion.js            (app Ngày)
│   ├── save-ket.js          (Kiểm Két → Notion)
│   ├── sync.js              (Kiểm Két → Upstash đồng bộ)
│   ├── vi-notion.js         (Ví Cá Nhân — đã đổi tên từ notion.js)
│   ├── vi-notion-read.js    (Ví Cá Nhân)
│   └── vi-notion-delete.js  (Ví Cá Nhân)
└── src/
    ├── kiem-ket/       ← code React Kiểm Két (giữ nguyên)
    └── ngay/           ← code React Ngày (giữ nguyên)
```

Mỗi app vẫn giữ nguyên giao diện và code cũ. Chỉ có 2 thay đổi:
1. Ba endpoint của Ví Cá Nhân đổi tên (`/api/notion` → `/api/vi-notion`,
   `/api/notion-read` → `/api/vi-notion-read`, `/api/notion-delete` → `/api/vi-notion-delete`)
   để không trùng với endpoint của app Ngày. Đã sửa sẵn trong `vi-ca-nhan.html`.
2. Mỗi trang có thêm nút 🏠 nhỏ ở mép phải màn hình để quay về trang chủ.

## Triển khai (GitHub Desktop + Vercel)

1. Giải nén thư mục `smith-apps` vào Home.
2. GitHub Desktop → File → Add Local Repository → chọn `smith-apps`
   → create a repository → Commit to main → Publish repository.
3. Vercel → Add New → Project → import repo `smith-apps` → Deploy
   (Vercel tự nhận Vite, không cần đổi gì).

## Biến môi trường (Settings → Environment Variables)

| Key            | Dùng cho           | Ghi chú                                  |
|----------------|--------------------|-------------------------------------------|
| `NOTION_TOKEN` | Kiểm Két + Ngày    | Một token duy nhất — xem lưu ý bên dưới  |

Sau đó vào tab **Storage** → Connect database Upstash (đang dùng cho kiem-ket)
→ Vercel tự thêm `KV_REST_API_URL` và `KV_REST_API_TOKEN`.

Xong tất cả → **Deployments → ••• → Redeploy**.

## LƯU Ý QUAN TRỌNG về NOTION_TOKEN

Trước đây Kiểm Két và Ngày là 2 project riêng, có thể dùng 2 integration khác nhau.
Giờ gộp lại chỉ còn MỘT biến `NOTION_TOKEN`, nên integration của token đó phải
được chia sẻ quyền với CẢ HAI nơi:

1. Database **Kiểm Két** → ••• → Connections → chọn integration
2. Trang **Smith's life** (chứa database Ngày + Nhiệm Vụ) → ••• → Connections → chọn integration

Thiếu nơi nào thì app tương ứng sẽ báo "không tìm thấy database".

Ví Cá Nhân không dùng biến môi trường — token nhập trực tiếp trong phần cài đặt
của app như cũ.

## Đường dẫn sau khi deploy

- `https://<ten-project>.vercel.app/` — trang chủ
- `/kiem-ket.html` — Kiểm Két
- `/ngay.html` — Ngày
- `/vi-ca-nhan.html` — Ví Cá Nhân
- `/tinh-lai.html` — Tính Lãi Huyền Thọ
