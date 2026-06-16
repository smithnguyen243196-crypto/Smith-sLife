// Cấu hình nội dung — chỉnh tại đây khi cột Notion thay đổi.

// 10 thói quen = TÊN CHÍNH XÁC cột checkbox trong database @Ngày.
export const NGAY_HABITS = [
  "🧘 Thiền", "💪 Tập thể dục", "📚 Đọc sách", "💬 Nói chuyện với vợ", "👧 Nói chuyện với con gái",
  "💰 Tổng kết thu chi ngày", "🏪 Tổng kết két thu chi cửa hàng",
  "📋 Làm nhiệm vụ ở bảng phân công", "🗓️ Thêm các nhiệm vụ cho ngày mai", "🌙 Nhìn lại cuối ngày",
];

export const MORNING_Q = [
  "Điều gì sẽ khiến ngày hôm nay trở nên tuyệt vời?",
  "Danh sách việc KHÔNG làm hôm nay?",
  "Hôm nay bạn sẵn sàng trao đi điều tốt đẹp gì cho người khác?",
  "Bạn hạnh phúc về điều gì ngay lúc này?",
];
export const EVENING_Q = [
  "Chiến thắng hôm nay?", "Bài học hôm nay?", "Điều gì bạn muốn nhớ trong hôm nay?",
  "Bạn đã học hay nghe gì hôm nay?", "Có điều gì nổi bật mà bạn đã học/nghe được?",
  "Bạn cần làm gì tiếp theo để đạt mục tiêu?", "Bây giờ bạn đang cảm thấy cảm xúc gì?",
];

export const DENOMS = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];
export const REASON_SUGGEST = ["Chi bớt khách", "Xăng", "Quà", "Nợ công ty", "Ship"];
export const PERSON_SUGGEST = ["a.Tài", "Hải", "a.Thắng", "Uyên", "Đô", "Gin", "Như Ý", "c.Hân", "Tom", "a.Linh", "Bi", "Bình"];
export const VI_CATEGORIES = ["Ăn uống", "Điện nước", "Đưa vợ", "Xăng xe", "Mua sắm", "Y tế", "Học tập", "Giải trí", "Lương/Thu nhập", "Khác"];

// ===== Truy cập nhanh (KiotViet + liên kết tuỳ chỉnh) =====
// retailer = "địa chỉ truy cập cửa hàng" trên KiotViet -> mở https://<retailer>.kiotviet.vn
// Smith chỉnh retailer + danh sách link trong app; cấu hình đồng bộ qua Upstash.
export const KIOTVIET_HOME = "https://www.kiotviet.vn";
export const kiotvietShopUrl = (retailer) =>
  retailer && retailer.trim() ? `https://${retailer.trim()}.kiotviet.vn` : KIOTVIET_HOME;

// Link mặc định lần đầu (Smith sửa/thêm thoải mái). kind: "kiotviet" tự dựng URL theo retailer.
export const DEFAULT_LINKS = [
  { id: "kv-shop", kind: "kiotviet", label: "KiotViet · Gian hàng", icon: "🛒", color: "#1B5235" },
  { id: "kv-login", kind: "url", label: "KiotViet · Đăng nhập", url: KIOTVIET_HOME, icon: "🔑", color: "#C79A2C" },
  { id: "store-web", kind: "url", label: "VTNNHUYENTHO.VN", url: "https://vtnnhuyentho.vn", icon: "🌾", color: "#3E8E5A" },
];

// Nhãn (tag) nhanh cho Ghi Chú.
export const NOTE_TAGS = ["Cửa hàng", "Đồng ruộng", "Khách hàng", "Ý tưởng", "Cá nhân"];
