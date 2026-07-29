import { gregorianToLunarAnimals, formatPillar } from "./lunacy.js?v=3";

const dateInput = document.getElementById("date");
const hourInput = document.getElementById("hour");
const minuteInput = document.getElementById("minute");
const lunarMeta = document.getElementById("lunar-meta");
const tableBody = document.querySelector("#pillars tbody");

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
}

for (const el of [dateInput, hourInput, minuteInput]) {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
}

setDefaults();
render();
