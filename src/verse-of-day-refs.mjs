/**
 * USFM + chapter + verse. Single verses only; pool is a mix of OT/NT.
 * Tuned for 66-book Protestant canons in bundled translations.
 */
export const FAMOUS_VERSE_REFS = [
  { id: "GEN", c: 1, v: 1 },
  { id: "JHN", c: 1, v: 1 },
  { id: "JHN", c: 3, v: 16 },
  { id: "JHN", c: 14, v: 6 },
  { id: "JHN", c: 11, v: 25 },
  { id: "JHN", c: 8, v: 12 },
  { id: "PSA", c: 23, v: 1 },
  { id: "PSA", c: 119, v: 105 },
  { id: "PSA", c: 46, v: 10 },
  { id: "PSA", c: 121, v: 1 },
  { id: "PSA", c: 1, v: 1 },
  { id: "PSA", c: 27, v: 1 },
  { id: "PSA", c: 100, v: 4 },
  { id: "PSA", c: 19, v: 14 },
  { id: "ROM", c: 8, v: 28 },
  { id: "ROM", c: 3, v: 23 },
  { id: "ROM", c: 5, v: 8 },
  { id: "ROM", c: 6, v: 23 },
  { id: "ROM", c: 12, v: 2 },
  { id: "ROM", c: 8, v: 31 },
  { id: "MAT", c: 5, v: 9 },
  { id: "MAT", c: 6, v: 33 },
  { id: "MAT", c: 5, v: 16 },
  { id: "MAT", c: 11, v: 28 },
  { id: "MAT", c: 6, v: 34 },
  { id: "LUK", c: 2, v: 10 },
  { id: "LUK", c: 6, v: 31 },
  { id: "1CO", c: 13, v: 4 },
  { id: "1CO", c: 10, v: 13 },
  { id: "1CO", c: 6, v: 19 },
  { id: "2CO", c: 4, v: 7 },
  { id: "2CO", c: 5, v: 17 },
  { id: "GAL", c: 2, v: 20 },
  { id: "EPH", c: 2, v: 8 },
  { id: "EPH", c: 3, v: 20 },
  { id: "PHP", c: 4, v: 13 },
  { id: "PHP", c: 4, v: 6 },
  { id: "PHP", c: 1, v: 6 },
  { id: "PHP", c: 2, v: 3 },
  { id: "COL", c: 3, v: 23 },
  { id: "1TH", c: 5, v: 16 },
  { id: "2TI", c: 1, v: 7 },
  { id: "HEB", c: 11, v: 1 },
  { id: "HEB", c: 13, v: 5 },
  { id: "JAS", c: 1, v: 2 },
  { id: "JAS", c: 4, v: 7 },
  { id: "1PE", c: 5, v: 7 },
  { id: "1PE", c: 3, v: 8 },
  { id: "1JN", c: 4, v: 7 },
  { id: "1JN", c: 4, v: 19 },
  { id: "1JN", c: 1, v: 1 },
  { id: "REV", c: 3, v: 20 },
  { id: "PRO", c: 3, v: 5 },
  { id: "PRO", c: 3, v: 6 },
  { id: "ISA", c: 40, v: 31 },
  { id: "ISA", c: 41, v: 10 },
  { id: "ISA", c: 6, v: 8 },
  { id: "JER", c: 29, v: 11 },
  { id: "JOS", c: 1, v: 9 },
  { id: "JOS", c: 1, v: 7 },
  { id: "RUT", c: 1, v: 16 },
  { id: "DEU", c: 6, v: 4 },
  { id: "LUK", c: 1, v: 37 },
  { id: "JHN", c: 3, v: 17 },
  { id: "JHN", c: 1, v: 12 },
  { id: "JHN", c: 3, v: 36 },
  { id: "ROM", c: 10, v: 9 },
  { id: "ROM", c: 1, v: 16 },
  { id: "JHN", c: 3, v: 30 },
];

const LEN = FAMOUS_VERSE_REFS.length;

/**
 * Deterministic per calendar day (local timezone) index into FAMOUS_VERSE_REFS.
 * @param {Date} d
 */
export function getDailyVotdIndex(d = new Date()) {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const start = new Date(t.getFullYear(), 0, 0);
  const doy = Math.floor((t - start) / 864e5);
  const n = t.getFullYear() * 400 + doy;
  return n % LEN;
}

/**
 * @param {number} excludeIndex
 */
export function pickRandomVotdIndex(excludeIndex = -1) {
  if (LEN <= 1) return 0;
  for (let k = 0; k < 32; k++) {
    const i = Math.floor(Math.random() * LEN);
    if (i !== excludeIndex) return i;
  }
  return (excludeIndex + 1) % LEN;
}
