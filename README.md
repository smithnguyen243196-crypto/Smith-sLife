# Bộ công cụ hằng ngày — Smith Nguyễn

SPA Vite + React: 4 công cụ (Nhiệm Vụ Ngày · Kiểm Két · Tính Lãi · Ví Cá Nhân) + nút Home tròn ở giữa.
Dữ liệu lưu thẳng vào Notion (nguồn chân lý → 2 thiết bị luôn thấy nhau). Kiểm Két dùng thêm Upstash để đồng bộ tức thì khi đang đếm.

## Chạy thử
```bash
npm install
npm i -g vercel
cp .env.example .env   # NOTION_TOKEN + Upstash (mục dưới)
vercel dev             # frontend + /api tại http://localhost:3000
```

## Deploy (GitHub Desktop + Vercel)
1. Push thư mục này lên GitHub bằng GitHub Desktop.
2. Vercel → Add New → Project → chọn repo (tự nhận Vite).
3. Vercel → Storage → **Upstash Redis** → Connect vào project (tự thêm KV_REST_API_URL/KV_REST_API_TOKEN).
4. Settings → Environment Variables: dán `NOTION_TOKEN`. Các `DS_*` đã có sẵn trong code mẫu nhưng nên thêm vào env cho gọn.
5. Deploy.

## Bắt buộc làm 1 lần trong Notion
Mở 5 database sau → ••• → **Connections** → thêm integration vừa tạo (nếu không API báo lỗi không thấy database):
Câu Nói Hay · Ngày · Nhiệm Vụ (Chế độ xem Nhiệm Vụ và Dự Án) · Ví Cá Nhân · Kiểm Két.

## Đã khớp đúng schema thật của anh (không cần chỉnh tay)
| Công cụ | Database | Cột dùng |
|---|---|---|
| Câu nói | Câu Nói Hay | Bản dịch (TV), Người, Độ tin=Cao |
| Thói quen | Ngày | 10 cột checkbox; "Thói Quen %" do Notion tự tính |
| Câu hỏi đầu/cuối ngày | Ngày | ghi vào nội dung trang ngày |
| Nhiệm vụ | Nhiệm Vụ | Nhiệm Vụ (title), Hoàn Thành (checkbox), Trạng Thái, Ngày Thực Hiện |
| Ví | Ví Cá Nhân | Name, Loại (Thu/Chi), Số tiền, Danh mục, Ví (Tiền mặt/Ngân hàng/Tài khoản), Ngày, Ghi chú |
| Kiểm Két | Kiểm Két | Tên, Tổng tiền trong két, Tổng thu chi, Két và thu chi, Tiền báo cáo, Kết quả, Trạng thái (Khớp/Thừa/Thiếu), Danh sách chi, Ngày bắt đầu, Ngày tính két |

## Lưu / đồng bộ hoạt động thế nào
- **Tick thói quen**: app tìm/tạo trang ngày hôm nay trong @Ngày rồi set checkbox → mở Notion trên máy khác thấy ngay.
- **Thêm/đánh dấu/xoá nhiệm vụ**: ghi thẳng vào @Nhiệm Vụ (đặt Trạng Thái=Hoạt Động, Ngày Thực Hiện=hôm nay để hiện trong view "Hôm Nay").
- **Ví — thêm giao dịch**: tạo 1 dòng trong @Ví Cá Nhân; số dư tính lại từ lịch sử.
- **Kiểm Két**: mọi thao tác đẩy lên Upstash → desktop/mobile khớp nhau realtime; bấm **"Lưu vào Notion"** mới tạo 1 dòng tổng kết trong @Kiểm Két (tự đặt Trạng thái Khớp/Thừa/Thiếu theo Kết quả).

## Ghi chú kỹ thuật
- Dùng Notion API **2025-09-03** qua *data source* (bắt buộc vì Nhiệm Vụ là database multi-source gộp Nhiệm Vụ + Dự Án).
- Kết quả kiểm két = Tổng két − (Thu − Chi) − Báo cáo KiotViet − 1.000.000đ.
- Tiền lãi = Số tiền × (lãi suất %/tháng ÷ 100) ÷ 30 × số ngày (tính cả 2 đầu).
