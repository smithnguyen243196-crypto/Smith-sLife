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

async function login(page, retailer) {
  await page.goto(`https://${retailer}.kiotviet.vn/man/`, { waitUntil: "networkidle" });
  const hasLoginForm = await page.locator("#Password").count();
  if (!hasLoginForm) return; // đã có session sẵn (không nên xảy ra trên máy chủ, nhưng cứ kiểm tra)

  // Trang login KiotViet có 1 input[type=password] ẩn (bẫy autofill) đứng trước ô thật -> phải chọn theo #id.
  await page.locator("#UserName").fill(USERNAME());
  await page.locator("#Password").fill(PASSWORD());
  await page.locator('button[type="submit"]').filter({ hasText: "Quản lý" }).click();
  await page.locator("#Password").waitFor({ state: "detached", timeout: 20000 }).catch(() => {});
  await page.waitForLoadState("networkidle");

  if (await page.locator("#Password").count()) {
    throw new Error("Đăng nhập KiotViet thất bại — kiểm tra lại KIOTVIET_USERNAME/KIOTVIET_PASSWORD");
  }
}

async function openUserReport(page, retailer) {
  await page.goto(`https://${retailer}.kiotviet.vn/man/#/UserReport`, { waitUntil: "networkidle" });
  // Mối quan tâm -> "Hàng bán theo nhân viên"
  await page.locator('kv-report-type').getByText("Bán hàng", { exact: true }).click();
  await page.getByText("Hàng bán theo nhân viên", { exact: true }).click();
  // Thời gian -> Tuỳ chỉnh -> Hôm nay -> Tạo báo cáo
  await page.getByText("Tùy chỉnh", { exact: true }).first().click();
  await page.getByText("Hôm nay", { exact: true }).click();
  await page.getByText("Tạo báo cáo", { exact: true }).click();
  await page.waitForLoadState("networkidle");
}

async function clearBrandFilter(page) {
  const closeBtn = page.locator("#tradeMarkFilter_taglist .k-i-close");
  while (await closeBtn.count()) {
    await closeBtn.first().click();
    await page.waitForTimeout(150);
  }
}

async function selectBrandSuffix(page, suffix) {
  const wrapper = page.locator(".k-multiselect:has(#tradeMarkFilter_taglist)");
  const input = wrapper.locator("input.k-input");
  await input.click();
  await input.fill(`- ${suffix}`);
  await page.waitForTimeout(600); // Kendo lọc danh sách

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
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  return clicked.size;
}

async function readSellerRows(page) {
  return page.evaluate(() => {
    const names = Array.from(document.querySelectorAll('[class*="txtUserName"]')).map((e) => e.textContent.trim());
    const qtys = Array.from(document.querySelectorAll('[class*="txtNumOfProduct"]')).map((e) => e.textContent.trim());
    return names.map((name, i) => ({ name, sl: qtys[i] ? Number(qtys[i].replace(/,/g, "")) || 0 : 0 }));
  });
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
    const page = await browser.newPage();
    const retailer = RETAILER();

    await login(page, retailer);
    await openUserReport(page, retailer);

    const result = {};
    for (const suffix of BRAND_SUFFIXES) {
      const key = suffix.toLowerCase();
      const matched = await selectBrandSuffix(page, suffix);
      result[key] = matched > 0 ? await readSellerRows(page) : [];
      await clearBrandFilter(page);
    }

    return json(res, 200, { date: targetDate, cc: result.cc, ss: result.ss });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  } finally {
    if (browser) await browser.close();
  }
}
