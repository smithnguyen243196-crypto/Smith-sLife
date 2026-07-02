// Tự đăng nhập KiotViet (Playwright headless), mở báo cáo "Hàng bán theo nhân viên" cho hôm nay,
// lọc theo Thương hiệu kết thúc bằng "- CC" / "- SS", đọc SL bán trực tiếp từ DOM báo cáo (không cần OCR ảnh).
// Env bắt buộc: KIOTVIET_USERNAME, KIOTVIET_PASSWORD. Tuỳ chọn: KIOTVIET_RETAILER (mặc định "huyenthoco").
import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import { json, readBody } from "./_notion.js";

const RETAILER = () => process.env.KIOTVIET_RETAILER || "huyenthoco";
const USERNAME = () => process.env.KIOTVIET_USERNAME;
const PASSWORD = () => process.env.KIOTVIET_PASSWORD;
const BRAND_SUFFIXES = ["CC", "SS"];

const todayHoChiMinh = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }); // YYYY-MM-DD

// KiotViet có request nền chạy liên tục (thông báo, polling...) nên "networkidle" không bao giờ đạt được
// -> luôn dùng "domcontentloaded" cho goto rồi chờ đúng phần tử cần thiết xuất hiện.
async function waitReportLoaded(page, timeout = 20000) {
  await Promise.race([
    page.locator('[class*="txtUserName"]').first().waitFor({ timeout }),
    page.getByText("Báo cáo không có dữ liệu").waitFor({ timeout }),
  ]).catch(() => {});
  await page.waitForTimeout(250);
}

// Phiên headless hoàn toàn mới (chưa từng "đã xem") có thể hiện banner/dialog khuyến mại chặn click
// (vd "Bạn đã đăng ký chương trình khuyến mại ..."), nhưng banner này hiện RA TRỄ sau khi trang đã load
// xong nên chỉ kiểm tra 1 lần là không đủ -> chủ động dò trong cả 1 khoảng thời gian.
async function dismissOverlay(page, windowMs = 3000) {
  const start = Date.now();
  do {
    const overlay = page.locator(".k-overlay").first();
    if (await overlay.count()) {
      await page.keyboard.press("Escape").catch(() => {});
      await overlay.click({ force: true, timeout: 1000 }).catch(() => {});
    }
    await page.waitForTimeout(300);
  } while (Date.now() - start < windowMs);
}

// click() của Playwright tự lặp lại đến khi hết timeout nếu bị overlay chặn, nhưng overlay đó không tự mất
// -> bọc lại: thử click nhanh, nếu bị chặn thì chủ động đóng overlay rồi click lại.
async function clickSafe(locator, page) {
  try {
    await locator.click({ timeout: 8000 });
  } catch {
    await dismissOverlay(page, 1500);
    await locator.click({ timeout: 15000 });
  }
}

async function login(page, retailer) {
  await page.goto(`https://${retailer}.kiotviet.vn/man/`, { waitUntil: "domcontentloaded" });
  await Promise.race([
    page.locator("#Password").waitFor({ timeout: 20000 }),
    page.locator("kv-report-type").waitFor({ timeout: 20000 }),
  ]).catch(() => {});

  const hasLoginForm = await page.locator("#Password").count();
  if (!hasLoginForm) return; // đã có session sẵn (không nên xảy ra trên máy chủ, nhưng cứ kiểm tra)

  // Trang login KiotViet có 1 input[type=password] ẩn (bẫy autofill) đứng trước ô thật -> phải chọn theo #id.
  await page.locator("#UserName").fill(USERNAME());
  await page.locator("#Password").fill(PASSWORD());
  await page.locator('button[type="submit"]').filter({ hasText: "Quản lý" }).click();
  await page.locator("#Password").waitFor({ state: "detached", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(800);

  if (await page.locator("#Password").count()) {
    throw new Error("Đăng nhập KiotViet thất bại — kiểm tra lại KIOTVIET_USERNAME/KIOTVIET_PASSWORD");
  }
}

async function openUserReport(page, retailer) {
  await page.goto(`https://${retailer}.kiotviet.vn/man/#/UserReport`, { waitUntil: "domcontentloaded" });
  await page.getByText("Mối quan tâm", { exact: true }).first().waitFor({ timeout: 20000 });
  await dismissOverlay(page);

  // Mối quan tâm -> "Hàng bán theo nhân viên".
  // Kendo dropdown giữ song song 1 <option> ẩn trùng chữ với span hiển thị -> không dùng getByText trên cả widget,
  // phải nhắm đúng span.k-input (để mở) rồi li.k-item trong danh sách xổ xuống (để chọn).
  await clickSafe(page.locator("kv-report-type span.k-input").first(), page);
  await clickSafe(page.locator("li.k-item").filter({ hasText: "Hàng bán theo nhân viên" }).first(), page);

  // Thời gian -> Tuỳ chỉnh -> Hôm nay -> Tạo báo cáo
  await clickSafe(page.getByText("Tùy chỉnh", { exact: true }).first(), page);
  await clickSafe(page.getByText("Hôm nay", { exact: true }).first(), page);
  await clickSafe(page.getByText("Tạo báo cáo", { exact: true }).first(), page);
  await waitReportLoaded(page);
}

async function selectBrandSuffix(page, suffix) {
  await dismissOverlay(page, 800); // overlay khuyến mại thường đã bị đóng ở openUserReport, chỉ kiểm tra nhanh
  const wrapper = page.locator(".k-multiselect:has(#tradeMarkFilter_taglist)");
  const input = wrapper.locator("input.k-input");
  await clickSafe(input, page);
  await input.fill(`- ${suffix}`);
  await page.waitForTimeout(400); // Kendo lọc danh sách

  const clicked = new Set();
  for (let round = 0; round < 20; round++) {
    const items = page.locator("#tradeMarkFilter_listbox li");
    const count = await items.count();
    let clickedAny = false;
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const text = (await item.textContent())?.trim();
      if (!text || clicked.has(text)) continue;
      await item.click();
      clicked.add(text);
      clickedAny = true;
      await page.waitForTimeout(100);
    }
    if (!clickedAny) break;
  }
  await page.keyboard.press("Escape");
  await waitReportLoaded(page);
  return clicked.size;
}

async function readSellerRows(page) {
  return page.evaluate(() => {
    const names = Array.from(document.querySelectorAll('[class*="txtUserName"]')).map((e) => e.textContent.trim());
    const qtys = Array.from(document.querySelectorAll('[class*="txtNumOfProduct"]')).map((e) => e.textContent.trim());
    return names.map((name, i) => ({ name, sl: qtys[i] ? Number(qtys[i].replace(/,/g, "")) || 0 : 0 }));
  });
}

// Chặn ảnh/font/media để trang KiotViet (nặng icon, ảnh sản phẩm) load nhanh hơn — không ảnh hưởng
// vì ta chỉ đọc số liệu từ text trong DOM, không cần hiển thị đầy đủ.
const blockHeavyAssets = (page) => page.route(/\.(png|jpe?g|gif|svg|webp|woff2?|ttf|eot)(\?|$)/i, (route) => route.abort());

// Mỗi thương hiệu (CC/SS) chạy trên 1 tab riêng (cùng context nên dùng chung cookie đăng nhập) để
// 2 lượt lọc + chờ báo cáo (phần tốn thời gian nhất) chạy song song thay vì tuần tự -> giảm ~1 nửa thời gian.
async function fetchBrandSuffix(context, retailer, suffix) {
  const page = await context.newPage();
  try {
    await blockHeavyAssets(page);
    await openUserReport(page, retailer);
    const matched = await selectBrandSuffix(page, suffix);
    return matched > 0 ? await readSellerRows(page) : [];
  } finally {
    await page.close();
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "method" });
  if (!USERNAME() || !PASSWORD()) return json(res, 500, { error: "Chưa cấu hình KIOTVIET_USERNAME/KIOTVIET_PASSWORD trên server" });

  const { date } = await readBody(req);
  const targetDate = date || todayHoChiMinh();
  if (targetDate !== todayHoChiMinh()) {
    return json(res, 400, { error: "Hiện chỉ hỗ trợ lấy báo cáo của hôm nay" });
  }

  let browser;
  try {
    browser = await playwright.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const context = await browser.newContext();
    const retailer = RETAILER();

    const loginPage = await context.newPage();
    await blockHeavyAssets(loginPage);
    await login(loginPage, retailer);
    await loginPage.close();

    const [cc, ss] = await Promise.all(BRAND_SUFFIXES.map((suffix) => fetchBrandSuffix(context, retailer, suffix)));

    return json(res, 200, { date: targetDate, cc, ss });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  } finally {
    if (browser) await browser.close();
  }
}
