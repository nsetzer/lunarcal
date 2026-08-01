import assert from "node:assert/strict";
import test from "node:test";
import { gregorianToLunarAnimals } from "../src/app/lunacy.js";

const cases = [
  {
    input: [2027, 7, 24, 4, 15],
    expect: {
      lunarYear: 2027,
      lunarMonth: 6,
      lunarDay: 21,
      yearElement: "Water",
      yearAnimal: "Goat",
      monthElement: "Earth",
      monthAnimal: "Goat",
      dayElement: "Water",
      dayAnimal: "Dragon",
      hourElement: "Earth",
      hourAnimal: "Tiger",
    },
  },
  {
    input: [2025, 10, 2, 4, 15],
    expect: {
      yearElement: "Fire",
      yearAnimal: "Snake",
      monthElement: "Metal",
      monthAnimal: "Rooster",
      dayElement: "Water",
      dayAnimal: "Dragon",
      hourElement: "Earth",
      hourAnimal: "Tiger",
    },
  },
  {
    input: [1990, 3, 12, 12, 17],
    expect: {
      yearElement: "Earth",
      yearAnimal: "Horse",
      monthElement: "Wood",
      monthAnimal: "Cat",
      dayElement: "Wood",
      dayAnimal: "Rat",
      hourElement: "Fire",
      hourAnimal: "Horse",
    },
  },
  {
    input: [2000, 1, 1, 23, 0],
    expect: {
      yearElement: "Earth",
      yearAnimal: "Cat",
      monthElement: "Wood",
      monthAnimal: "Rat",
      dayElement: "Fire",
      dayAnimal: "Horse",
      hourElement: "Fire",
      hourAnimal: "Rat",
    },
  },
];

for (const { input, expect } of cases) {
  test(`gregorianToLunarAnimals(${input.join(", ")})`, () => {
    const actual = gregorianToLunarAnimals(...input);
    for (const [key, value] of Object.entries(expect)) {
      assert.equal(actual[key], value, key);
    }
  });
}
