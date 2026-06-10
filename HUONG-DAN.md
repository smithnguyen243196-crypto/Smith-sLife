# Smith App — 4 công cụ, MỘT ứng dụng, đồng bộ mọi thiết bị

Bản xây lại hoàn toàn: một ứng dụng React duy nhất, chuyển công cụ không tải lại trang,
dữ liệu nhập dở không mất khi chuyển qua lại, và TOÀN BỘ cấu hình nằm trên server —
không phải cài đặt gì trên từng máy.

## Bên trong có gì

| Tab        | Chức năng                          | Lưu trữ & đồng bộ                       |
|------------|------------------------------------|------------------------------------------|
| Trang chủ  | Lời chào + câu nói của ngày        | Câu nói đọc từ Notion (📌 Câu Nói Hay)  |
| Kiểm Két   | Đếm tiền, thu chi, đối chiếu       | Nháp: Upstash · Kết quả: Notion         |
| Ví         | Thu chi cá nhân                    | Notion (cấu hình server — xem dưới)     |
| Ngày       | Nhật ký, thói quen, nhiệm vụ       | Notion                                   |
| Tính Lãi   | Tính lãi + LỊCH SỬ MỚI             | Lịch sử: Upstash, đồng bộ mọi thiết bị  |

Mới so với bản cũ:
- Ví Cá Nhân: token + Database ID chuyển lên server → mở máy nào cũng thấy cùng dữ liệu,
  không còn cảnh nhập token trên từng máy.
- Tính Lãi: thêm "Lưu kết quả" — lịch sử tính lãi cho khách đồng bộ giữa điện thoại và máy tính.
- Toàn bộ là một trang (SPA): đang đếm két, chuyển qua tra Ví rồi quay lại — số liệu vẫn nguyên.

## Triển khai

1. Giải nén thư mục `smith-app`.
2. GitHub Desktop → Add Local Repository → `smith-app` → create repository → Publish.
3. Vercel → Add New → Project → import repo `smith-app` → Deploy.

## Biến môi trường (Vercel → Settings → Environment Variables)

| Key               | Bắt buộc | Dùng cho                | Ghi chú                                              |
|-------------------|----------|-------------------------|------------------------------------------------------|
| `NOTION_TOKEN`    | Có       | Ngày, Kiểm Két, Câu nói | Token integration đã chia sẻ với Smith's life + DB Kiểm Két |
| `VI_DB_ID`        | Có       | Ví Cá Nhân              | Database ID của database thu chi (32 ký tự)          |
| `VI_NOTION_TOKEN` | Không    | Ví Cá Nhân              | CHỈ cần nếu database Ví dùng integration khác        |

**Lấy `VI_DB_ID` ở đâu?** Mở app Ví cũ trên điện thoại → ⚙️ Cài đặt → ô "Database ID" — copy
nguyên chuỗi đó. Hoặc mở database thu chi trên Notion, lấy 32 ký tự trong URL trước dấu `?`.

**Về token cho Ví:** nếu trước giờ database Ví được chia sẻ với một integration riêng,
có 2 lựa chọn:
- Gọn nhất: mở database thu chi trên Notion → ••• → Connections → thêm integration đang dùng
  cho app Ngày → chỉ cần một `NOTION_TOKEN`.
- Hoặc: thêm biến `VI_NOTION_TOKEN` = token của integration riêng đó.

## Upstash (đồng bộ Kiểm Két + lịch sử Tính Lãi)

Vercel → project `smith-app` → tab **Storage** → Connect database Upstash (cái đang dùng cho
kiem-ket cũ). Vercel tự thêm `KV_REST_API_URL` và `KV_REST_API_TOKEN`.

## Sau khi đặt xong biến môi trường

Deployments → ••• → **Redeploy** (bắt buộc — biến môi trường chỉ ăn ở lần build mới).

## Kiểm tra nhanh sau deploy

- `https://<link>/api/sync` → phải thấy `{"ok":true,...}` (Upstash sống)
- `https://<link>/api/quote` → phải thấy câu nói (Notion sống)
- Mở tab Ví → chấm tròn cạnh 🔄 chuyển XANH là Ví đã nối Notion qua server.

## Ghi chú kỹ thuật

- `src/modules/` — mỗi công cụ một module; KiemKet.jsx và Ngay.jsx giữ nguyên code gốc,
  ViCaNhan.jsx và TinhLai.jsx viết lại bằng React trung thành giao diện cũ.
- CSS của từng module được scope riêng (`.pg-vi`, `.pg-ngay`, `.pg-lai`, `.pg-home`) — không đụng nhau.
- `api/sync.js` giờ nhận `?key=kiemket` (mặc định) hoặc `?key=tinhlai`.
- Các project cũ (kiem-ket, vi-ca-nhan...) có thể xoá trên Vercel sau khi bản này chạy ổn.
