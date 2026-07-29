import {
  gregorianToLunarAnimals,
  formatStemEmojis,
  isEnemyOf,
  ELEMENT_EMOJI,
  ANIMAL_EMOJI,
} from "./lunacy.js?v=3";

const dateA = document.getElementById("date-a");
const dateB = document.getElementById("date-b");
const stemA = document.getElementById("stem-a");
const stemB = document.getElementById("stem-b");
const viewMonth = document.getElementById("view-month");
const viewYear = document.getElementById("view-year");
const canvas = document.getElementById("calendar");
const ctx = canvas.getContext("2d");

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function parseDateValue(value) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) throw new Error("Invalid date");
  return { year, month, day };
}

function yearStemLabel(year, month, day) {
  const data = gregorianToLunarAnimals(year, month, day);
  const emojis = formatStemEmojis(
    data.yearElement,
    data.yearAnimal,
    data.yearStemIndex,
  );
  return `${emojis} ${data.yearPolarity} ${data.yearElement} ${data.yearAnimal}`;
}

function updateStem(input, labelEl) {
  try {
    const { year, month, day } = parseDateValue(input.value);
    labelEl.textContent = yearStemLabel(year, month, day);
  } catch {
    labelEl.textContent = "—";
  }
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/** Monday-first weekday index: Mon=0 … Sun=6 */
function mondayIndex(year, month, day) {
  const js = new Date(year, month - 1, day).getDay(); // Sun=0
  return (js + 6) % 7;
}

function selectedKeys() {
  const keys = new Set();
  for (const input of [dateA, dateB]) {
    if (input.value) keys.add(input.value);
  }
  return keys;
}

/** Year animals for the two selected dates (unique, order preserved). */
function selectedYearAnimals() {
  const animals = [];
  for (const input of [dateA, dateB]) {
    if (!input.value) continue;
    try {
      const { year, month, day } = parseDateValue(input.value);
      const data = gregorianToLunarAnimals(year, month, day);
      if (data.yearAnimal && !animals.includes(data.yearAnimal)) {
        animals.push(data.yearAnimal);
      }
    } catch {
      // ignore incomplete dates
    }
  }
  return animals;
}

function viewYearMonth() {
  let year = Number(viewYear.value);
  let month = Number(viewMonth.value);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  year = Math.min(2099, Math.max(1900, Math.trunc(year)));
  month = Math.min(12, Math.max(1, Math.trunc(month)));
  if (String(viewYear.value) !== String(year)) viewYear.value = String(year);
  if (String(viewMonth.value) !== String(month)) viewMonth.value = String(month);
  return { year, month };
}

function drawCalendar() {
  const view = viewYearMonth();
  if (!view) return;
  const { year, month } = view;

  const dpr = window.devicePixelRatio || 1;
  const cssWidth = Math.min(900, canvas.parentElement.clientWidth || 900);
  const cssHeight = Math.round(cssWidth * 0.8);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = cssWidth;
  const h = cssHeight;
  const headerH = 36;
  const cols = 7;
  const rows = 6;
  const cellW = w / cols;
  const cellH = (h - headerH) / rows;

  ctx.clearRect(0, 0, w, h);

  // Panel background
  ctx.fillStyle = "rgba(255, 252, 245, 0.92)";
  roundRect(ctx, 0, 0, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(29, 42, 36, 0.14)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Weekday headers
  ctx.fillStyle = "#4d6158";
  ctx.font = "600 12px 'Be Vietnam Pro', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let c = 0; c < cols; c++) {
    ctx.fillText(WEEKDAYS[c], cellW * c + cellW / 2, headerH / 2);
  }

  const totalDays = daysInMonth(year, month);
  const startCol = mondayIndex(year, month, 1);
  const highlights = selectedKeys();
  const yearAnimals = selectedYearAnimals();

  for (let day = 1; day <= totalDays; day++) {
    const idx = startCol + day - 1;
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const x = col * cellW;
    const y = headerH + row * cellH;

    let data;
    try {
      data = gregorianToLunarAnimals(year, month, day);
    } catch {
      continue;
    }

    const key = `${year}-${pad2(month)}-${pad2(day)}`;
    const isHighlight = highlights.has(key);
    // Green when this day's animal is not a Tứ Hành Xung enemy of either
    // selected date's year animal.
    const isFriendly =
      yearAnimals.length > 0 &&
      !yearAnimals.some((yearAnimal) => isEnemyOf(yearAnimal, data.dayAnimal));

    // Cell
    if (isFriendly) {
      ctx.fillStyle = isHighlight
        ? "rgba(46, 140, 90, 0.42)"
        : "rgba(72, 168, 110, 0.32)";
    } else if (isHighlight) {
      ctx.fillStyle = "rgba(15, 107, 92, 0.14)";
    } else {
      ctx.fillStyle = "transparent";
    }
    ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
    ctx.strokeStyle = isFriendly
      ? "rgba(46, 120, 80, 0.35)"
      : "rgba(29, 42, 36, 0.1)";
    ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);

    // Gregorian day — top left
    ctx.fillStyle = "#1d2a24";
    ctx.font = "700 13px 'Be Vietnam Pro', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(String(day), x + 8, y + 8);

    // Crescent + lunar month/day — top right
    const lunarLabel = `🌙 ${data.lunarMonth}/${data.lunarDay}`;
    ctx.fillStyle = "#4d6158";
    ctx.font = "600 11px 'Be Vietnam Pro', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(lunarLabel, x + cellW - 8, y + 8);

    // Day stem element + animal — center
    const center = `${ELEMENT_EMOJI[data.dayElement] || ""} ${ANIMAL_EMOJI[data.dayAnimal] || ""}`;
    ctx.fillStyle = "#1d2a24";
    ctx.font = `${Math.max(16, Math.min(22, cellW * 0.22))}px 'Be Vietnam Pro', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(center, x + cellW / 2, y + cellH / 2 + 6);
  }
}

function roundRect(c, x, y, width, height, r) {
  const radius = Math.min(r, width / 2, height / 2);
  c.beginPath();
  c.moveTo(x + radius, y);
  c.arcTo(x + width, y, x + width, y + height, radius);
  c.arcTo(x + width, y + height, x, y + height, radius);
  c.arcTo(x, y + height, x, y, radius);
  c.arcTo(x, y, x + width, y, radius);
  c.closePath();
}

function refresh() {
  updateStem(dateA, stemA);
  updateStem(dateB, stemB);
  drawCalendar();
}

function setDefaults() {
  dateA.value = "1990-03-12";
  dateB.value = "1992-04-20";
  viewMonth.value = "10";
  viewYear.value = "2025";
}

for (const el of [dateA, dateB, viewMonth, viewYear]) {
  el.addEventListener("input", refresh);
  el.addEventListener("change", refresh);
}
window.addEventListener("resize", drawCalendar);

setDefaults();
refresh();
