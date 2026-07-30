import {
  gregorianToLunarAnimals,
  formatPillar,
  ZODIAC,
  ANIMAL_EMOJI,
  TAM_HOP_GROUPS,
  TU_HANH_XUNG_GROUPS,
} from "./lunacy.js?v=4";

const dateInput = document.getElementById("date");
const hourInput = document.getElementById("hour");
const minuteInput = document.getElementById("minute");
const lunarMeta = document.getElementById("lunar-meta");
const tableBody = document.querySelector("#pillars tbody");
const clockCanvas = document.getElementById("zodiac-clock");
const clockCtx = clockCanvas.getContext("2d");

/** Traditional double-hour: Rat 23–1, Buffalo 1–3, … Pig 21–23. */
const HOUR_STARTS = ZODIAC.map((_, i) => (i === 0 ? 23 : i * 2 - 1));

const SLICE_COLORS = [
  "#c45c3e",
  "#d4a017",
  "#6b8f3c",
  "#2f7d6d",
  "#3a7ca5",
  "#5b6db0",
  "#7a5ea7",
  "#a34d8d",
  "#b85c6e",
  "#8b6b4a",
  "#5a7a6a",
  "#4a6670",
];

let clockLayout = { cssW: 0, cssH: 0, dpr: 0 };
let clockResizeTimer = null;
/** Selected animal on the clock, or null when none. */
let selectedClockAnimal = null;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function setDefaults() {
  dateInput.value = "2025-10-02";
  hourInput.value = "4";
  minuteInput.value = "15";
}

function parseInputs() {
  const [year, month, day] = dateInput.value.split("-").map(Number);
  const hour = Number(hourInput.value);
  const minute = Number(minuteInput.value);
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new Error("Pick a valid date and time.");
  }
  return { year, month, day, hour, minute };
}

/** Canvas angle: midnight at top, clockwise. */
function hourToAngle(hour) {
  return -Math.PI / 2 + ((hour % 24) / 24) * Math.PI * 2;
}

function fillRingSlice(ctx, cx, cy, rInner, rOuter, a0, a1, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter, a0, a1, false);
  ctx.arc(cx, cy, rInner, a1, a0, true);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function ensureClockSize(cssWidth, cssHeight, dpr) {
  const bufW = Math.round(cssWidth * dpr);
  const bufH = Math.round(cssHeight * dpr);
  const changed =
    clockLayout.cssW !== cssWidth ||
    clockLayout.cssH !== cssHeight ||
    clockLayout.dpr !== dpr ||
    clockCanvas.width !== bufW ||
    clockCanvas.height !== bufH;

  if (changed) {
    clockCanvas.style.width = `${cssWidth}px`;
    clockCanvas.style.height = `${cssHeight}px`;
    clockCanvas.width = bufW;
    clockCanvas.height = bufH;
    clockLayout = { cssW: cssWidth, cssH: cssHeight, dpr };
  }
  clockCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return changed;
}

/** Undirected edges within each group (i < j so each line is drawn once). */
function groupEdges(groups) {
  const edges = [];
  for (const group of groups) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        edges.push([group[i], group[j]]);
      }
    }
  }
  return edges;
}

function drawRelationLines(ctx, dots, edges, color, lineWidth, selectedAnimal) {
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  const dim = [];
  const bright = [];
  for (const edge of edges) {
    const [a, b] = edge;
    if (!selectedAnimal || a === selectedAnimal || b === selectedAnimal) {
      bright.push(edge);
    } else {
      dim.push(edge);
    }
  }

  const batches = selectedAnimal
    ? [
        [dim, withAlpha(color, 0.25)],
        [bright, color],
      ]
    : [[bright, color]];

  for (const [list, stroke] of batches) {
    ctx.strokeStyle = stroke;
    for (const [a, b] of list) {
      const pa = dots[a];
      const pb = dots[b];
      if (!pa || !pb) continue;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }
  }
}

/** `#rrggbb` + alpha 0–1 → `rgba(...)`. */
function withAlpha(hex, alpha) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Map canvas CSS coords to an animal ring slice, or null. */
function animalAtPoint(x, y) {
  const cssW = clockLayout.cssW || clockCanvas.clientWidth;
  const cssH = clockLayout.cssH || clockCanvas.clientHeight;
  const cx = cssW / 2;
  const cy = cssH / 2;
  const rOuter = Math.min(cx, cy) * 0.96;
  const rInner = rOuter * 0.8;
  const dx = x - cx;
  const dy = y - cy;
  const r = Math.hypot(dx, dy);
  if (r < rInner || r > rOuter) return null;

  // 0 at top, increasing clockwise → fractional hour 0–24
  const hour = ((((Math.atan2(dy, dx) + Math.PI / 2) / (Math.PI * 2)) % 1) + 1) % 1 * 24;
  const animalIndex = Math.floor((((hour + 1) % 24) / 2));
  return ZODIAC[animalIndex] || null;
}

function canvasEventPoint(event) {
  const rect = clockCanvas.getBoundingClientRect();
  const scaleX = (clockLayout.cssW || clockCanvas.clientWidth) / rect.width;
  const scaleY = (clockLayout.cssH || clockCanvas.clientHeight) / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function drawZodiacClock() {
  if (!clockCanvas || !clockCtx) return;

  const cssWidth = Math.min(
    560,
    clockCanvas.parentElement?.clientWidth || 560,
  );
  const cssHeight = cssWidth;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ensureClockSize(cssWidth, cssHeight, dpr);

  const ctx = clockCtx;
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const cx = cssWidth / 2;
  const cy = cssHeight / 2;
  const rOuter = Math.min(cx, cy) * 0.96;
  const rInner = rOuter * 0.8;
  const rEmoji = (rInner + rOuter) / 2;
  const gap = 0.012;
  const dotR = Math.max(3, cssWidth * 0.012);
  const lineW = Math.max(1.5, cssWidth * 0.004);
  const dots = {};

  for (let i = 0; i < ZODIAC.length; i++) {
    const animal = ZODIAC[i];
    const startHour = HOUR_STARTS[i];
    const endHour = (startHour + 2) % 24;
    const a0 = hourToAngle(startHour) + gap;
    const a1 = hourToAngle(endHour) - gap;
    const mid = hourToAngle(startHour + 1);

    fillRingSlice(ctx, cx, cy, rInner, rOuter, a0, a1, SLICE_COLORS[i]);

    ctx.strokeStyle = "#1d2a24";
    ctx.lineWidth = Math.max(2, cssWidth * 0.006);
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, a0, a1, false);
    ctx.arc(cx, cy, rInner, a1, a0, true);
    ctx.closePath();
    ctx.stroke();

    dots[animal] = {
      x: cx + Math.cos(mid) * rInner,
      y: cy + Math.sin(mid) * rInner,
      mid,
    };
  }

  drawRelationLines(
    ctx,
    dots,
    groupEdges(TAM_HOP_GROUPS),
    "#2f7d4a",
    lineW,
    selectedClockAnimal,
  );
  drawRelationLines(
    ctx,
    dots,
    groupEdges(TU_HANH_XUNG_GROUPS),
    "#c0392b",
    lineW,
    selectedClockAnimal,
  );

  for (const animal of ZODIAC) {
    const { x, y, mid } = dots[animal];
    ctx.beginPath();
    ctx.arc(x, y, dotR, 0, Math.PI * 2);
    ctx.fillStyle = "#1d2a24";
    ctx.fill();

    const ex = cx + Math.cos(mid) * rEmoji;
    const ey = cy + Math.sin(mid) * rEmoji;
    ctx.font = `${Math.round(cssWidth * 0.072)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ANIMAL_EMOJI[animal] || "", ex, ey);
  }
}

function render() {
  try {
    const { year, month, day, hour, minute } = parseInputs();
    const data = gregorianToLunarAnimals(year, month, day, hour, minute);

    const leap = data.isLeapMonth ? " (leap)" : "";
    lunarMeta.textContent = `Lunar ${data.lunarYear}-${pad2(data.lunarMonth)}-${pad2(data.lunarDay)}${leap}`;

    const rows = [
      ["Year", formatPillar(data.yearElement, data.yearAnimal)],
      ["Month", formatPillar(data.monthElement, data.monthAnimal)],
      ["Day", formatPillar(data.dayElement, data.dayAnimal)],
      ["Hour", formatPillar(data.hourElement, data.hourAnimal)],
    ];

    tableBody.innerHTML = rows
      .map(
        ([pillar, p]) => `
      <tr>
        <th scope="row">${pillar}</th>
        <td><span class="emoji" aria-hidden="true">${p.elementEmoji}</span> ${p.element}</td>
        <td><span class="emoji" aria-hidden="true">${p.animalEmoji}</span> ${p.animal}</td>
      </tr>`
      )
      .join("");
  } catch (err) {
    lunarMeta.textContent = err.message || "Unable to convert that date.";
    tableBody.innerHTML = "";
  }
  drawZodiacClock();
}

for (const el of [dateInput, hourInput, minuteInput]) {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
}

window.addEventListener("resize", () => {
  clearTimeout(clockResizeTimer);
  clockResizeTimer = setTimeout(render, 100);
});

clockCanvas.addEventListener("click", (event) => {
  const { x, y } = canvasEventPoint(event);
  const animal = animalAtPoint(x, y);
  if (!animal) {
    if (selectedClockAnimal) {
      selectedClockAnimal = null;
      drawZodiacClock();
    }
    return;
  }
  selectedClockAnimal = selectedClockAnimal === animal ? null : animal;
  drawZodiacClock();
});

clockCanvas.style.cursor = "pointer";

setDefaults();
render();
