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

// ===== Truy cập nhanh (KiotViet huyenthoco + liên kết tuỳ chỉnh) =====
// retailer = "địa chỉ truy cập cửa hàng" trên KiotViet -> mở https://<retailer>.kiotviet.vn
// Smith chỉnh retailer + danh sách link trong app; cấu hình đồng bộ qua Upstash.
export const KIOTVIET_HOME = "https://www.kiotviet.vn";
export const kiotvietShopUrl = (retailer) =>
  retailer && retailer.trim() ? `https://${retailer.trim()}.kiotviet.vn` : KIOTVIET_HOME;

export const DEFAULT_RETAILER = "huyenthoco";
// Tăng số này khi đổi bộ link mặc định -> app sẽ nạp lại link mới (ghi đè cấu hình cũ trong Upstash).
export const LINKS_VERSION = 2;

// Link mặc định (Smith sửa/thêm thoải mái). iconName: icon nét đồng bộ với thẻ công cụ.
export const DEFAULT_LINKS = [
  { id: "kv-sale", kind: "url", label: "Bán Hàng", desc: "Màn hình bán hàng", url: "https://huyenthoco.kiotviet.vn/sale/#/", iconName: "cart", icon: "🛒", color: "#1B5235" },
  { id: "kv-invoice", kind: "url", label: "Hóa Đơn", desc: "Danh sách hoá đơn", url: "https://huyenthoco.kiotviet.vn/man/#/Invoices", iconName: "invoice", icon: "🧾", color: "#C79A2C" },
  { id: "kv-customer", kind: "url", label: "Khách Hàng", desc: "Quản lý khách hàng", url: "https://huyenthoco.kiotviet.vn/man/#/Customers", iconName: "users", icon: "👥", color: "#3E8E5A" },
  { id: "kv-eod", kind: "url", label: "Báo Cáo Cuối Ngày", desc: "Tổng kết cuối ngày", url: "https://huyenthoco.kiotviet.vn/man/#/EndOfDayReport", iconName: "report", icon: "📊", color: "#6A523E" },
];

// Nhãn (tag) nhanh cho Ghi Chú.
export const NOTE_TAGS = ["Cửa hàng", "Đồng ruộng", "Khách hàng", "Ý tưởng", "Cá nhân"];

// ===== Doanh Số nhân viên (báo cáo cuối ngày) =====
// Đổi tên nhân viên tại đây nếu cần.
export const SALES_STAFF = ["Minh Trí", "Thành Đô", "Uyên"];
export const SALES_STAFF_COLORS = { "Minh Trí": "#3E8E5A", "Thành Đô": "#C79A2C", "Uyên": "#B5432B" };

// ===== Màu dự án (cho viền nhiệm vụ + chấm trên lịch) =====
export const PROJECT_COLORS = ["#3E8E5A", "#C79A2C", "#B5432B", "#2E7D9B", "#7A4DA0", "#C2683A", "#4C7A2F", "#9B6A2E"];
const hashStr = (s) => { let h = 0; const t = String(s); for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return Math.abs(h); };
// Màu ổn định theo id dự án (không đổi khi danh sách đổi thứ tự)
export const projectColor = (id) => (id ? PROJECT_COLORS[hashStr(id) % PROJECT_COLORS.length] : null);
