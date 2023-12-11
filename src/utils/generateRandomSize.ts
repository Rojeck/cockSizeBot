import { ChanceDataValue } from '../types';

const chanceData = [
  { cm: 0, number: 9 },
  { cm: 1, number: 11 },
  { cm: 2, number: 26 },
  { cm: 3, number: 117 },
  { cm: 4, number: 159 },
  { cm: 5, number: 156 },
  { cm: 6, number: 181 },
  { cm: 7, number: 207 },
  { cm: 8, number: 250 },
  { cm: 9, number: 476 },
  { cm: 10, number: 543 },
  { cm: 11, number: 589 },
  { cm: 12, number: 652 },
  { cm: 13, number: 717 },
  { cm: 14, number: 842 },
  { cm: 15, number: 686 },
  { cm: 16, number: 536 },
  { cm: 17, number: 373 },
  { cm: 18, number: 360 },
  { cm: 19, number: 337 },
  { cm: 20, number: 298 },
  { cm: 21, number: 275 },
  { cm: 22, number: 306 },
  { cm: 23, number: 309 },
  { cm: 24, number: 285 },
  { cm: 25, number: 148 },
  { cm: 26, number: 133 },
  { cm: 27, number: 126 },
  { cm: 28, number: 149 },
  { cm: 29, number: 148 },
  { cm: 30, number: 108 },
  { cm: 31, number: 112 },
  { cm: 32, number: 124 },
  { cm: 33, number: 107 },
  { cm: 34, number: 84 },
  { cm: 35, number: 76 },
  { cm: 36, number: 69 },
  { cm: 37, number: 65 },
  { cm: 38, number: 44 },
  { cm: 39, number: 86 },
  { cm: 40, number: 37 },
  { cm: 41, number: 60 },
  { cm: 42, number: 12 },
  { cm: 43, number: 11 },
  { cm: 44, number: 9 },
];

export default function generateRandomValue(): number {
  const total = chanceData.reduce(
    (acc: number, item: ChanceDataValue) => acc + item.number,
    0,
  );
  const random = Math.random() * total;
  let cumulative = 0;

  for (const item of chanceData) {
    cumulative += item.number;
    if (random < cumulative) {
      return item.cm;
    }
  }
}
