/**
 * Vietnamese lunar zodiac helpers, ported from src/lunacy/lunacy.py
 * Lunar conversion derived from python-lunardate (GPLv2).
 */

const ZODIAC = [
  "Rat",
  "Buffalo",
  "Tiger",
  "Cat",
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig",
];

const ELEMENTS = [
  "Wood",
  "Wood",
  "Fire",
  "Fire",
  "Earth",
  "Earth",
  "Metal",
  "Metal",
  "Water",
  "Water",
];

const ELEMENT_EMOJI = {
  Wood: "🌳",
  Fire: "🔥",
  Earth: "🌍",
  Metal: "⚙️",
  Water: "💧",
};

const ANIMAL_EMOJI = {
  Rat: "🐀",
  Buffalo: "🐃",
  Tiger: "🐅",
  Cat: "🐈",
  Dragon: "🐉",
  Snake: "🐍",
  Horse: "🐴",
  Goat: "🐐",
  Monkey: "🐒",
  Rooster: "🐓",
  Dog: "🐕",
  Pig: "🐷",
};

// Chinese/Vietnamese lunar year bitmaps for 1900–2099 (from lunardate)
const YEAR_INFOS = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0,
  0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540,
  0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0, 0x0b4b5, 0x06a50,
  0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0,
  0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2,
  0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573,
  0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4,
  0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5,
  0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46,
  0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58,
  0x05ac0, 0x0ab60, 0x096d5, 0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50,
  0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, 0x0a950, 0x0b4a0,
  0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260,
  0x0ea65, 0x0d530, 0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0,
  0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2, 0x049b0,
  0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63, 0x09370,
  0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06aa0, 0x1a6c4, 0x0aae0,
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0,
  0x0a6d0, 0x055d4, 0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50,
  0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, 0x0b273, 0x06930, 0x07337, 0x06aa0,
  0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, 0x0e968, 0x0d520,
  0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
];

function yearInfoToYearDay(yearInfo) {
  let res = 29 * 12;
  let leap = false;
  if (yearInfo % 16 !== 0) {
    leap = true;
    res += 29;
  }
  yearInfo = Math.floor(yearInfo / 16);
  for (let i = 0; i < 12 + (leap ? 1 : 0); i++) {
    if (yearInfo % 2 === 1) res += 1;
    yearInfo = Math.floor(yearInfo / 2);
  }
  return res;
}

const YEAR_DAYS = YEAR_INFOS.map(yearInfoToYearDay);
const START_UTC = Date.UTC(1900, 0, 31);

function enumMonth(yearInfo) {
  const months = [];
  for (let i = 1; i <= 12; i++) months.push([i, 0]);
  const leapMonth = yearInfo % 16;
  if (leapMonth > 0 && leapMonth <= 12) {
    months.splice(leapMonth, 0, [leapMonth, 1]);
  } else if (leapMonth > 12) {
    throw new Error(`yearInfo ${yearInfo} mod 16 should be in [0, 12]`);
  }

  return months.map(([month, isLeapMonth]) => {
    const days = isLeapMonth
      ? ((yearInfo >> 16) % 2) + 29
      : ((yearInfo >> (16 - month)) % 2) + 29;
    return { month, days, isLeapMonth: Boolean(isLeapMonth) };
  });
}

function fromOffset(offset) {
  offset = Math.trunc(offset);
  let idx = 0;
  for (; idx < YEAR_DAYS.length; idx++) {
    if (offset < YEAR_DAYS[idx]) break;
    offset -= YEAR_DAYS[idx];
  }
  const year = 1900 + idx;
  const yearInfo = YEAR_INFOS[idx];
  let month = 1;
  let day = 1;
  let isLeapMonth = false;
  for (const entry of enumMonth(yearInfo)) {
    if (offset < entry.days) {
      month = entry.month;
      day = offset + 1;
      isLeapMonth = entry.isLeapMonth;
      break;
    }
    offset -= entry.days;
  }
  return { year, month, day, isLeapMonth };
}

function solarToUtcDays(year, month, day) {
  return Math.floor((Date.UTC(year, month - 1, day) - START_UTC) / 86400000);
}

function fromSolarDate(year, month, day) {
  return fromOffset(solarToUtcDays(year, month, day));
}

function lunarToSolarOffset(lunar) {
  const startYear = 1900;
  const endYear = startYear + YEAR_INFOS.length;
  if (lunar.year < startYear || lunar.year >= endYear) {
    throw new Error(`year out of range [${startYear}, ${endYear})`);
  }
  const yearIdx = lunar.year - startYear;
  let offset = 0;
  for (let i = 0; i < yearIdx; i++) offset += YEAR_DAYS[i];

  let found = false;
  for (const entry of enumMonth(YEAR_INFOS[yearIdx])) {
    if (
      entry.month === lunar.month &&
      entry.isLeapMonth === Boolean(lunar.isLeapMonth)
    ) {
      if (lunar.day < 1 || lunar.day > entry.days) {
        throw new Error("day out of range");
      }
      offset += lunar.day - 1;
      found = true;
      break;
    }
    offset += entry.days;
  }
  if (!found) throw new Error("month out of range");
  return offset;
}

function daysBetweenLunar(a, b) {
  return lunarToSolarOffset(a) - lunarToSolarOffset(b);
}

/**
 * Convert Gregorian date/time to lunar zodiac pillars.
 */
function gregorianToLunarAnimals(year, month, day, hour = null, minute = null) {
  const lunar = fromSolarDate(year, month, day);
  const offset = 1984;

  const yearBranchIndex = ((lunar.year - offset) % 12 + 12) % 12;
  const yearStemIndex = ((lunar.year - offset) % 10 + 10) % 10;
  const monthBranchIndex = (lunar.month + 1) % 12;
  const monthStemIndex = (lunar.month - 1) % 10;

  const baseDate = { year: 2025, month: 8, day: 2, isLeapMonth: false };
  const daysDiff = daysBetweenLunar(lunar, baseDate);
  const dayBranchIndex = (((ZODIAC.indexOf("Goat") + daysDiff) % 12) + 12) % 12;
  const dayStemIndex = ((daysDiff % 10) + 10) % 10;

  const data = {
    lunarDay: lunar.day,
    lunarMonth: lunar.month,
    lunarYear: lunar.year,
    isLeapMonth: lunar.isLeapMonth,
    yearAnimal: ZODIAC[yearBranchIndex],
    yearElement: ELEMENTS[yearStemIndex],
    monthAnimal: ZODIAC[monthBranchIndex],
    monthElement: ELEMENTS[monthStemIndex],
    dayAnimal: ZODIAC[dayBranchIndex],
    dayElement: ELEMENTS[dayStemIndex],
  };

  if (hour !== null && hour !== undefined) {
    hour = ((hour % 24) + 24) % 24;
    const animalIndex = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
    const elementIndex = hour % 10;
    data.hour = hour;
    data.minute = minute || 0;
    data.hourAnimal = ZODIAC[animalIndex];
    data.hourElement = ELEMENTS[elementIndex];
  }

  return data;
}

function formatPillar(element, animal) {
  return {
    element,
    animal,
    elementEmoji: ELEMENT_EMOJI[element] || "",
    animalEmoji: ANIMAL_EMOJI[animal] || "",
    label: `${ELEMENT_EMOJI[element] || ""} ${element} · ${ANIMAL_EMOJI[animal] || ""} ${animal}`,
  };
}

export {
  ZODIAC,
  ELEMENTS,
  ELEMENT_EMOJI,
  ANIMAL_EMOJI,
  fromSolarDate,
  gregorianToLunarAnimals,
  formatPillar,
};
