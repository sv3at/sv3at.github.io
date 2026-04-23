import { describe, it, expect } from "vitest";
import { FAMOUS_VERSE_REFS, getDailyVotdIndex, pickRandomVotdIndex } from "../src/verse-of-day-refs.mjs";

describe("FAMOUS_VERSE_REFS", () => {
  it("is non-empty and all entries are valid shapes", () => {
    expect(FAMOUS_VERSE_REFS.length).toBeGreaterThan(20);
    for (const r of FAMOUS_VERSE_REFS) {
      expect(r.id).toBeTruthy();
      expect(typeof r.c).toBe("number");
      expect(r.c).toBeGreaterThan(0);
      expect(typeof r.v).toBe("number");
      expect(r.v).toBeGreaterThan(0);
    }
  });
});

describe("getDailyVotdIndex", () => {
  it("returns in-bounds index", () => {
    const d = new Date(2024, 5, 12);
    const i = getDailyVotdIndex(d);
    expect(i).toBeGreaterThanOrEqual(0);
    expect(i).toBeLessThan(FAMOUS_VERSE_REFS.length);
  });
});

describe("pickRandomVotdIndex", () => {
  it("tries to avoid the excluded index", () => {
    const a = new Set();
    for (let t = 0; t < 20; t++) a.add(pickRandomVotdIndex(0));
    expect(a.size).toBeGreaterThan(1);
  });
});
