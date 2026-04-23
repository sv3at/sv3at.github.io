import { describe, it, expect, beforeEach } from "vitest";
import {
  FAMOUS_VERSE_REFS,
  getDailyVotdIndex,
  getSessionVotdIndex,
  VOTD_SESSION_KEY,
  pickRandomVotdIndex,
} from "../src/verse-of-day-refs.mjs";
describe("FAMOUS_VERSE_REFS", () => {
  it("is non-empty and all entries are valid shapes", () => {
    expect(FAMOUS_VERSE_REFS.length).toBe(500);
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

describe("getSessionVotdIndex", () => {
  beforeEach(() => {
    try {
      sessionStorage.removeItem(VOTD_SESSION_KEY);
    } catch {
      /* ignore */
    }
  });

  it("is stable and in range when sessionStorage is available", () => {
    const a = getSessionVotdIndex();
    const b = getSessionVotdIndex();
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(FAMOUS_VERSE_REFS.length);
  });
});

describe("pickRandomVotdIndex", () => {
  it("tries to avoid the excluded index", () => {
    const a = new Set();
    for (let t = 0; t < 20; t++) a.add(pickRandomVotdIndex(0));
    expect(a.size).toBeGreaterThan(1);
  });
});
