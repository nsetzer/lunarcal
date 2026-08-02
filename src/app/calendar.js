import {
  gregorianToLunarAnimals,
  formatStemEmojis,
  formatPillar,
  elementRelation,
  isTamHop,
  isLucHop,
  isLucXung,
  isTuHanhXung,
  LUC_XUNG_PAIRS,
  ELEMENT_EMOJI,
  ANIMAL_EMOJI,
} from "./lunacy.js?v=11";

const dateA = document.getElementById("date-a");
const dateB = document.getElementById("date-b");
const hourA = document.getElementById("hour-a");
const hourB = document.getElementById("hour-b");
const stemA = document.getElementById("stem-a");
const stemB = document.getElementById("stem-b");
const compareBody = document.querySelector("#compare-pillars tbody");
const totalsBody = document.querySelector("#compare-totals tbody");
const viewMonth = document.getElementById("view-month");
const viewYear = document.getElementById("view-year");
const ruleNamTuoi = document.getElementById("rule-nam-tuoi");
const ruleGhost = document.getElementById("rule-ghost");
const ruleTamNuong = document.getElementById("rule-tam-nuong");
const ruleNguyetKy = document.getElementById("rule-nguyet-ky");
const ruleTaboo = document.getElementById("rule-taboo");
const ruleConflict = document.getElementById("rule-conflict");
const ruleHacDao = document.getElementById("rule-hac-dao");
const canvas = document.getElementById("calendar");
const ctx = canvas.getContext("2d");

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TAM_NUONG_DAYS = new Set([3, 7, 13, 18, 22, 27]);
const NGUYET_KY_DAYS = new Set([5, 14, 23]);
/** Lunar month → taboo lunar day (Dương Công Kỵ Nhật style). */
const TABOO_DAY_BY_MONTH = {
  1: 13,
  2: 11,
  3: 9,
  4: 7,
  5: 5,
  6: 3,
  7: 8,
  8: 6,
  9: 4,
  10: 2,
  11: 27,
  12: 25,
};
/** Hoàng Đạo day-branches by lunar month. */
const HOANG_DAO_BY_MONTH = {
  1: ["Rat", "Buffalo", "Snake", "Goat"],
  7: ["Rat", "Buffalo", "Snake", "Goat"],
  2: ["Tiger", "Cat", "Goat", "Rooster"],
  8: ["Tiger", "Cat", "Goat", "Rooster"],
  3: ["Dragon", "Snake", "Rooster", "Pig"],
  9: ["Dragon", "Snake", "Rooster", "Pig"],
  4: ["Horse", "Goat", "Buffalo", "Rooster"],
  10: ["Horse", "Goat", "Buffalo", "Rooster"],
  5: ["Monkey", "Rooster", "Buffalo", "Cat"],
  11: ["Monkey", "Rooster", "Buffalo", "Cat"],
  6: ["Dog", "Pig", "Cat", "Snake"],
  12: ["Dog", "Pig", "Cat", "Snake"],
};
/** Hắc Đạo day-branches by lunar month (caution, not hard exclusion). */
const HAC_DAO_BY_MONTH = {
  1: ["Tiger", "Cat", "Horse", "Monkey", "Rooster", "Pig"],
  7: ["Tiger", "Cat", "Horse", "Monkey", "Rooster", "Pig"],
  2: ["Dragon", "Snake", "Monkey", "Dog", "Pig", "Buffalo"],
  8: ["Dragon", "Snake", "Monkey", "Dog", "Pig", "Buffalo"],
  3: ["Horse", "Goat", "Dog", "Rat", "Buffalo", "Cat"],
  9: ["Horse", "Goat", "Dog", "Rat", "Buffalo", "Cat"],
  4: ["Monkey", "Rooster", "Rat", "Tiger", "Cat", "Snake"],
  10: ["Monkey", "Rooster", "Rat", "Tiger", "Cat", "Snake"],
  5: ["Dog", "Pig", "Tiger", "Dragon", "Snake", "Goat"],
  11: ["Dog", "Pig", "Tiger", "Dragon", "Snake", "Goat"],
  6: ["Rat", "Buffalo", "Dragon", "Horse", "Goat", "Rooster"],
  12: ["Rat", "Buffalo", "Dragon", "Horse", "Goat", "Rooster"],
};
const LUC_XUNG_OF = Object.fromEntries(
  LUC_XUNG_PAIRS.flatMap(([a, b]) => [
    [a, b],
    [b, a],
  ]),
);

/** Last committed canvas layout; avoid resetting buffer unless it changes. */
let canvasLayout = { cssW: 0, cssH: 0, dpr: 0 };
let resizeTimer = null;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function parseDateValue(value) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) throw new Error("Invalid date");
  return { year, month, day };
}

function parseHourValue(value) {
  const hour = Number(value);
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) {
    throw new Error("Invalid hour");
  }
  return Math.trunc(hour);
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

function pillarCell(p) {
  if (!p) return "—";
  const text = [p.polarity, p.element, p.animal].filter(Boolean).join(" ");
  return `<div class="pillar-cell">
    <span class="pillar-cell-emoji" aria-hidden="true">${p.stemEmojis}</span>
    <span class="pillar-cell-text">${text}</span>
  </div>`;
}

/** Good match → green check; no match → yellow neutral. */
function goodMark(matched, label) {
  if (matched) {
    return `<span class="rel-mark rel-mark--good" title="${label}: match" aria-label="${label}: match">✓</span>`;
  }
  return `<span class="rel-mark rel-mark--neutral" title="${label}: no match" aria-label="${label}: no match">●</span>`;
}

/** Bad match → red X; no match → yellow neutral. */
function badMark(matched, label) {
  if (matched) {
    return `<span class="rel-mark rel-mark--bad" title="${label}: clash" aria-label="${label}: clash">✕</span>`;
  }
  return `<span class="rel-mark rel-mark--neutral" title="${label}: no clash" aria-label="${label}: no clash">●</span>`;
}

function destinyCell(element, destiny) {
  if (!destiny) return "—";
  const emoji = ELEMENT_EMOJI[element] || "";
  return `<div class="pillar-cell">
    <span class="pillar-cell-emoji" aria-hidden="true">${emoji} ${element}</span>
    <span class="pillar-cell-text">${destiny}</span>
  </div>`;
}

/** Earthly Branch polarity + native element (Địa chi). */
const BRANCH_NATURE = {
  Rat: { polarity: "Yang", element: "Water" },
  Buffalo: { polarity: "Yin", element: "Earth" },
  Tiger: { polarity: "Yang", element: "Wood" },
  Cat: { polarity: "Yin", element: "Wood" },
  Dragon: { polarity: "Yang", element: "Earth" },
  Snake: { polarity: "Yin", element: "Fire" },
  Horse: { polarity: "Yang", element: "Fire" },
  Goat: { polarity: "Yin", element: "Earth" },
  Monkey: { polarity: "Yang", element: "Metal" },
  Rooster: { polarity: "Yin", element: "Metal" },
  Dog: { polarity: "Yang", element: "Earth" },
  Pig: { polarity: "Yin", element: "Water" },
};

const ELEMENT_ORDER = ["Wood", "Fire", "Earth", "Metal", "Water"];

function datePillars(dateInput, hourInput) {
  const { year, month, day } = parseDateValue(dateInput.value);
  const hour = parseHourValue(hourInput.value);
  const data = gregorianToLunarAnimals(year, month, day, hour, 0);
  return {
    destiny: {
      element: data.yearDestinyElement,
      destiny: data.yearElementDestiny,
    },
    Year: formatPillar(data.yearElement, data.yearAnimal, data.yearPolarity),
    Month: formatPillar(data.monthElement, data.monthAnimal, data.monthPolarity),
    Day: formatPillar(data.dayElement, data.dayAnimal, data.dayPolarity),
    Hour: formatPillar(data.hourElement, data.hourAnimal, data.hourPolarity),
  };
}

/** Sum Yin/Yang and five elements from stem + branch of all four pillars. */
function pillarTotals(pillars) {
  const yinYang = { Yin: 0, Yang: 0 };
  const elements = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  for (const name of ["Year", "Month", "Day", "Hour"]) {
    const p = pillars[name];
    if (!p) continue;
    if (yinYang[p.polarity] !== undefined) yinYang[p.polarity] += 1;
    if (elements[p.element] !== undefined) elements[p.element] += 1;
    const branch = BRANCH_NATURE[p.animal];
    if (!branch) continue;
    yinYang[branch.polarity] += 1;
    elements[branch.element] += 1;
  }
  return { yinYang, elements };
}

function elementCountCells(totals) {
  return ELEMENT_ORDER.map((el) => totals.elements[el] || 0)
    .map((n) => `<span>${n}</span>`)
    .join("");
}

function mergeTotals(a, b) {
  const ta = pillarTotals(a);
  const tb = pillarTotals(b);
  return {
    yinYang: {
      Yin: ta.yinYang.Yin + tb.yinYang.Yin,
      Yang: ta.yinYang.Yang + tb.yinYang.Yang,
    },
    elements: Object.fromEntries(
      ELEMENT_ORDER.map((el) => [
        el,
        (ta.elements[el] || 0) + (tb.elements[el] || 0),
      ]),
    ),
  };
}

function updateTotalsTable(a, b) {
  if (!totalsBody) return;
  const totals = mergeTotals(a, b);
  const emojiRow = ELEMENT_ORDER.map(
    (el) => `<span aria-hidden="true">${ELEMENT_EMOJI[el] || ""}</span>`,
  ).join("");
  totalsBody.innerHTML = `
    <tr class="totals-heading-row">
      <th scope="colgroup" colspan="3">Totals</th>
    </tr>
    <tr>
      <th scope="row">Yin / Yang</th>
      <td class="polarity-cell"><span aria-hidden="true">🌙</span> ${totals.yinYang.Yin}</td>
      <td class="polarity-cell"><span aria-hidden="true">☀️</span> ${totals.yinYang.Yang}</td>
    </tr>
    <tr class="elem-row">
      <th scope="row">Element Count</th>
      <td colspan="2"><div class="elem-bins">${emojiRow}</div></td>
    </tr>
    <tr class="elem-count-row">
      <th scope="row"></th>
      <td colspan="2"><div class="elem-bins elem-bins--counts">${elementCountCells(totals)}</div></td>
    </tr>`;
}

function updateCompareTable() {
  try {
    const a = datePillars(dateA, hourA);
    const b = datePillars(dateB, hourB);
    const destinyRow = `
      <tr>
        <th scope="row">Elemental Destiny</th>
        <td>${destinyCell(a.destiny.element, a.destiny.destiny)}</td>
        <td>${destinyCell(b.destiny.element, b.destiny.destiny)}</td>
        <td></td>
      </tr>`;
    const rows = ["Year", "Month", "Day", "Hour"];
    compareBody.innerHTML =
      destinyRow +
      rows
        .map((name) => {
          const pa = a[name];
          const pb = b[name];
          const relation = elementRelation(pa.element, pb.element);
          // NOTE: temporarily hide Tam Hợp, Lục Hợp, Lục Xung, Tứ Hành Xung
          return `
      <tr>
        <th scope="row">${name}</th>
        <td>${pillarCell(pa)}</td>
        <td>${pillarCell(pb)}</td>
        <td>${relation || "—"}</td>
        <!--
        <td class="rel-cell">${goodMark(isTamHop(pa.animal, pb.animal), "Tam Hợp")}</td>
        <td class="rel-cell">${goodMark(isLucHop(pa.animal, pb.animal), "Lục Hợp")}</td>
        <td class="rel-cell">${badMark(isLucXung(pa.animal, pb.animal), "Lục Xung")}</td>
        <td class="rel-cell">${badMark(isTuHanhXung(pa.animal, pb.animal), "Tứ Hành Xung")}</td>-->
      </tr>`;
        })
        .join("");
    updateTotalsTable(a, b);
  } catch {
    compareBody.innerHTML = "";
    if (totalsBody) totalsBody.innerHTML = "";
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

/** Direct Lục Xung opposites of either selected birth-year animal. */
function conflictingDayAnimals() {
  const banned = new Set();
  for (const animal of selectedYearAnimals()) {
    const opposite = LUC_XUNG_OF[animal];
    if (opposite) banned.add(opposite);
  }
  return banned;
}

function activeRules() {
  return {
    namTuoi: Boolean(ruleNamTuoi?.checked),
    ghost: Boolean(ruleGhost?.checked),
    tamNuong: Boolean(ruleTamNuong?.checked),
    nguyetKy: Boolean(ruleNguyetKy?.checked),
    taboo: Boolean(ruleTaboo?.checked),
    conflict: Boolean(ruleConflict?.checked),
    hacDao: Boolean(ruleHacDao?.checked),
  };
}

/**
 * Classify a lunar day under active filters.
 * Hard exclusions first, then Hắc Đạo (caution), then Hoàng Đạo (preferred).
 */
function classifyDay(data, rules, conflictAnimals, birthYearAnimals) {
  const checks = [
    {
      id: "namTuoi",
      enabled: rules.namTuoi,
      hit: birthYearAnimals.includes(data.yearAnimal),
      emoji: "🔁",
      exclude: true,
    },
    {
      id: "ghost",
      enabled: rules.ghost,
      hit: data.lunarMonth === 7,
      emoji: "👻",
      exclude: true,
    },
    {
      id: "tamNuong",
      enabled: rules.tamNuong,
      hit: TAM_NUONG_DAYS.has(data.lunarDay),
      emoji: "🧙‍♀️",
      exclude: true,
    },
    {
      id: "nguyetKy",
      enabled: rules.nguyetKy,
      hit: NGUYET_KY_DAYS.has(data.lunarDay),
      emoji: "5️⃣",
      exclude: true,
    },
    {
      id: "taboo",
      enabled: rules.taboo,
      hit: TABOO_DAY_BY_MONTH[data.lunarMonth] === data.lunarDay,
      emoji: "⚠️",
      exclude: true,
    },
    {
      id: "conflict",
      enabled: rules.conflict,
      hit: conflictAnimals.has(data.dayAnimal),
      emoji: "⚔️",
      exclude: true,
    },
  ];

  for (const rule of checks) {
    if (rule.enabled && rule.hit) {
      return {
        excluded: true,
        hacDao: false,
        hoangDao: false,
        emoji: rule.emoji,
        rule: rule.id,
      };
    }
  }

  const hacList = HAC_DAO_BY_MONTH[data.lunarMonth] || [];
  if (rules.hacDao && hacList.includes(data.dayAnimal)) {
    return {
      excluded: false,
      hacDao: true,
      hoangDao: false,
      emoji: "☁️",
      rule: "hacDao",
    };
  }

  const hoangList = HOANG_DAO_BY_MONTH[data.lunarMonth] || [];
  if (hoangList.includes(data.dayAnimal)) {
    return {
      excluded: false,
      hacDao: false,
      hoangDao: true,
      emoji: "🌟",
      rule: "hoangDao",
    };
  }
  return {
    excluded: false,
    hacDao: false,
    hoangDao: false,
    emoji: "🌙",
    rule: null,
  };
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

/** Resize backing store only when CSS size or DPR actually changes. */
function ensureCanvasSize(cssWidth, cssHeight, dpr) {
  const bufW = Math.round(cssWidth * dpr);
  const bufH = Math.round(cssHeight * dpr);
  const changed =
    canvasLayout.cssW !== cssWidth ||
    canvasLayout.cssH !== cssHeight ||
    canvasLayout.dpr !== dpr ||
    canvas.width !== bufW ||
    canvas.height !== bufH;

  if (changed) {
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.width = bufW;
    canvas.height = bufH;
    canvasLayout = { cssW: cssWidth, cssH: cssHeight, dpr };
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return changed;
}

function clearResizeTimer() {
  if (resizeTimer !== null) {
    clearTimeout(resizeTimer);
    resizeTimer = null;
  }
}

function drawCalendar() {
  // A real redraw cancels any pending debounced resize.
  clearResizeTimer();

  const view = viewYearMonth();
  if (!view) return;
  const { year, month } = view;

  const dpr = window.devicePixelRatio || 1;
  const cssWidth = Math.min(900, canvas.parentElement.clientWidth || 900);
  // Stacked 3-line cells need a bit more height on narrow screens.
  const compact = cssWidth < 700;
  const cssHeight = Math.round(cssWidth * (compact ? 1.05 : 0.8));
  ensureCanvasSize(cssWidth, cssHeight, dpr);

  const w = cssWidth;
  const h = cssHeight;
  const headerH = compact ? 28 : 36;
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
  ctx.font = `600 ${compact ? 10 : 12}px 'Be Vietnam Pro', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let c = 0; c < cols; c++) {
    ctx.fillText(WEEKDAYS[c], cellW * c + cellW / 2, headerH / 2);
  }

  const totalDays = daysInMonth(year, month);
  const startCol = mondayIndex(year, month, 1);
  const highlights = selectedKeys();
  const rules = activeRules();
  const conflictAnimals = conflictingDayAnimals();
  const birthYearAnimals = selectedYearAnimals();

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
    const mark = classifyDay(data, rules, conflictAnimals, birthYearAnimals);

    // Cell fill: excluded = red; Hắc Đạo = yellow; Hoàng Đạo = green.
    if (mark.excluded) {
      ctx.fillStyle = isHighlight
        ? "rgba(192, 69, 58, 0.42)"
        : "rgba(192, 69, 58, 0.28)";
    } else if (mark.hacDao) {
      ctx.fillStyle = isHighlight
        ? "rgba(212, 160, 23, 0.45)"
        : "rgba(212, 160, 23, 0.32)";
    } else if (mark.hoangDao) {
      ctx.fillStyle = isHighlight
        ? "rgba(46, 140, 90, 0.42)"
        : "rgba(72, 168, 110, 0.32)";
    } else if (isHighlight) {
      ctx.fillStyle = "rgba(15, 107, 92, 0.14)";
    } else {
      ctx.fillStyle = "transparent";
    }
    ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
    ctx.strokeStyle = mark.excluded
      ? "rgba(160, 50, 42, 0.4)"
      : mark.hacDao
        ? "rgba(180, 130, 20, 0.4)"
        : mark.hoangDao
          ? "rgba(46, 120, 80, 0.35)"
          : "rgba(29, 42, 36, 0.1)";
    ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);

    const lunarLabel = `${mark.emoji}${data.lunarDay}/${data.lunarMonth}`;
    const stemLabel = `${ELEMENT_EMOJI[data.dayElement] || ""}${ANIMAL_EMOJI[data.dayAnimal] || ""}`;
    const dayLabel =
      year === 2025 && month === 10 && day === 2 ? `${day} 💒` : String(day);

    if (compact) {
      // 3 stacked lines for narrow screens
      const padX = Math.max(3, cellW * 0.08);
      const line1 = y + cellH * 0.14;
      const line2 = y + cellH * 0.42;
      const line3 = y + cellH * 0.72;
      const daySize = Math.max(10, Math.min(13, cellW * 0.28));
      const lunarSize = Math.max(8, Math.min(11, cellW * 0.22));
      const stemSize = Math.max(11, Math.min(16, cellW * 0.3));

      ctx.fillStyle = "#1d2a24";
      ctx.font = `700 ${daySize}px 'Be Vietnam Pro', sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(dayLabel, x + padX, line1);

      ctx.fillStyle = "#4d6158";
      ctx.font = `600 ${lunarSize}px 'Be Vietnam Pro', sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(lunarLabel, x + cellW / 2, line2);

      ctx.fillStyle = "#1d2a24";
      ctx.font = `${stemSize}px 'Be Vietnam Pro', sans-serif`;
      ctx.fillText(stemLabel, x + cellW / 2, line3);
    } else {
      // Wide layout: corners + centered stem
      ctx.fillStyle = "#1d2a24";
      ctx.font = "700 13px 'Be Vietnam Pro', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(dayLabel, x + 8, y + 8);

      ctx.fillStyle = "#4d6158";
      ctx.font = "600 11px 'Be Vietnam Pro', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(lunarLabel, x + cellW - 8, y + 8);

      ctx.fillStyle = "#1d2a24";
      ctx.font = `${Math.max(16, Math.min(22, cellW * 0.22))}px 'Be Vietnam Pro', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stemLabel, x + cellW / 2, y + cellH / 2 + 6);
    }
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
  //updateStem(dateA, stemA);
  //updateStem(dateB, stemB);
  updateCompareTable();
  drawCalendar();
}

function setDefaults() {
  dateA.value = "1990-03-12";
  dateB.value = "1992-04-20";
  hourA.value = "12";
  hourB.value = "7";
  viewMonth.value = "10";
  viewYear.value = "2025";
}

function shiftMonth(delta) {
  const view = viewYearMonth();
  if (!view) return;
  let { year, month } = view;
  month += delta;
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  year = Math.min(2099, Math.max(1900, year));
  viewMonth.value = String(month);
  viewYear.value = String(year);
  refresh();
}

for (const el of [
  dateA,
  dateB,
  hourA,
  hourB,
  viewMonth,
  viewYear,
  ruleNamTuoi,
  ruleGhost,
  ruleTamNuong,
  ruleNguyetKy,
  ruleTaboo,
  ruleConflict,
  ruleHacDao,
]) {
  if (!el) continue;
  el.addEventListener("input", refresh);
  el.addEventListener("change", refresh);
}
document.getElementById("month-prev").addEventListener("click", () => shiftMonth(-1));
document.getElementById("month-next").addEventListener("click", () => shiftMonth(1));

window.addEventListener("resize", () => {
  // Trailing debounce: each resize resets the timer; draw 200ms after the last one.
  clearResizeTimer();
  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    drawCalendar();
  }, 200);
});

setDefaults();
refresh();
