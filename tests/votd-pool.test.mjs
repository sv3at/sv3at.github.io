import { describe, it, expect } from "vitest";
import { FAMOUS_VERSE_REFS } from "../src/verse-of-day-refs.mjs";
import { USFM_LIST } from "../scripts/usfm-books.mjs";

describe("VOTD pool (FAMOUS_VERSE_REFS)", () => {
  it("has length 500", () => {
    expect(FAMOUS_VERSE_REFS.length).toBe(500);
  });

  it("has no duplicate (id, chapter, verse) rows", () => {
    const seen = new Set();
    for (const r of FAMOUS_VERSE_REFS) {
      const k = `${r.id}|${r.c}|${r.v}`;
      expect(seen.has(k), `duplicate: ${k}`).toBe(false);
      seen.add(k);
    }
  });

  it("matches per-book layout: 8 for GEN..ZEC, 7 for MAL..REV in USFM order", () => {
    const first38 = USFM_LIST.slice(0, 38).map((b) => b.id);
    const last28 = USFM_LIST.slice(38).map((b) => b.id);
    let i = 0;
    for (const id of first38) {
      for (let k = 0; k < 8; k++) {
        expect(FAMOUS_VERSE_REFS[i].id, `at index ${i}`).toBe(id);
        i += 1;
      }
    }
    for (const id of last28) {
      for (let k = 0; k < 7; k++) {
        expect(FAMOUS_VERSE_REFS[i].id, `at index ${i}`).toBe(id);
        i += 1;
      }
    }
    expect(i).toBe(500);
  });

  it("has positive chapter and verse numbers on every ref", () => {
    for (const r of FAMOUS_VERSE_REFS) {
      expect(r.id).toBeTruthy();
      expect(typeof r.c).toBe("number");
      expect(r.c).toBeGreaterThan(0);
      expect(typeof r.v).toBe("number");
      expect(r.v).toBeGreaterThan(0);
    }
  });
});
