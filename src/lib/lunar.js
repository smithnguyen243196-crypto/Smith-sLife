// Âm lịch Việt Nam — thuật toán Hồ Ngọc Đức (múi giờ +7)
const TZ = 7;
function jdFromDate(dd, mm, yy) {
  const a = Math.floor((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  return jd;
}
function newMoon(k, tz) {
  const T1 = k / 1236.85, T2 = T1 * T1, T3 = T2 * T1, dr = Math.PI / 180;
  let J = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  J += 0.00033 * Math.sin((166.56 + 132.87 * T1 - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mp = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C = (0.1734 - 0.000393 * T1) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C -= 0.4068 * Math.sin(Mp * dr) + 0.0161 * Math.sin(2 * dr * Mp);
  C -= 0.0004 * Math.sin(3 * dr * Mp);
  C += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin(dr * (M + Mp));
  C -= 0.0074 * Math.sin(dr * (M - Mp));
  C -= 0.0004 * Math.sin(dr * (2 * F - M)) + 0.0006 * Math.sin(dr * (2 * F + Mp));
  C += 0.001 * Math.sin(dr * (2 * F - Mp)) + 0.0005 * Math.sin(dr * (2 * Mp + M));
  let dt; if (T1 < -11) dt = 0.001 + 0.000839 * T1 + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T1 * T3;
  else dt = -0.000278 + 0.000265 * T1 + 0.000262 * T2;
  return Math.floor(J + C - dt + 0.5 + tz / 24);
}
function sunLong(jdn, tz) {
  const T1 = (jdn - 2451545.5 - tz / 24) / 36525, T2 = T1 * T1, dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T1 - 0.0001559 * T2 - 0.00000048 * T1 * T2;
  const L0 = 280.46645 + 36000.76983 * T1 + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T1 - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T1) * Math.sin(2 * dr * M) + 0.00029 * Math.sin(3 * dr * M);
  let L = (L0 + DL) * dr; L -= Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return Math.floor((L / Math.PI) * 6);
}
function lunarM11(yy, tz) { const k = Math.floor((jdFromDate(31, 12, yy) - 2415021) / 29.530588853); let nm = newMoon(k, tz); if (sunLong(nm, tz) >= 9) nm = newMoon(k - 1, tz); return nm; }
function leapOffset(a11, tz) { const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5); let last = 0, i = 1, arc = sunLong(newMoon(k + i, tz), tz); do { last = arc; i++; arc = sunLong(newMoon(k + i, tz), tz); } while (arc !== last && i < 14); return i - 1; }
export function solar2lunar(dd, mm, yy, tz = TZ) {
  const dn = jdFromDate(dd, mm, yy), k = Math.floor((dn - 2415021.076998695) / 29.530588853);
  let ms = newMoon(k + 1, tz); if (ms > dn) ms = newMoon(k, tz);
  let a11 = lunarM11(yy, tz), b11 = a11, ly;
  if (a11 >= ms) { ly = yy; a11 = lunarM11(yy - 1, tz); } else { ly = yy + 1; b11 = lunarM11(yy + 1, tz); }
  const ld = dn - ms + 1, diff = Math.floor((ms - a11) / 29); let leap = 0, lm = diff + 11;
  if (b11 - a11 > 365) { const o = leapOffset(a11, tz); if (diff >= o) { lm = diff + 10; if (diff === o) leap = 1; } }
  if (lm > 12) lm -= 12; if (lm >= 11 && diff < 4) ly -= 1;
  return { day: ld, month: lm, year: ly, leap };
}
export function lunarLabel(d = new Date()) {
  const l = solar2lunar(d.getDate(), d.getMonth() + 1, d.getFullYear());
  const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  return `Mùng ${l.day} tháng ${l.month}${l.leap ? " (nhuận)" : ""} ÂL · ${CAN[(l.year + 6) % 10]} ${CHI[(l.year + 8) % 12]}`;
}
