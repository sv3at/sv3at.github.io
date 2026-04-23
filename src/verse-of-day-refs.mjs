/**
 * 500 single-verse refs in `votd-500.json` (8 per OT book GEN..ZEC, 7 per MAL..REV).
 * Rebuild: `npm run build-votd` (see `scripts/votd-500-picks.mjs`). Docs: `docs/wiki/Verse-of-the-Day-Pool.md`.
 * Session index for the reader; `getDailyVotdIndex` for tests only.
 */
import FAMOUS_VERSE_REFS from "./votd-500.json" with { type: "json" };

export { FAMOUS_VERSE_REFS };

const LEN = FAMOUS_VERSE_REFS.length;

export const VOTD_SESSION_KEY = "fotw-bible-votd-index";

/** When `sessionStorage` is missing or fails, keep one index per page load. */
let memoryVotdIndex = null;

/**
 * One random verse per tab session, stable across reloads; cleared when the tab
 * is closed. A new session gets a new random pick. When storage is not available
 * the index is still stable for the current page.
 * @returns {number}
 */
export function getSessionVotdIndex() {
  if (memoryVotdIndex != null) return memoryVotdIndex;
  if (typeof window === "undefined" || !window.sessionStorage) {
    memoryVotdIndex = Math.floor(Math.random() * LEN);
    return memoryVotdIndex;
  }
  try {
    const s = window.sessionStorage.getItem(VOTD_SESSION_KEY);
    if (s != null) {
      const n = parseInt(s, 10);
      if (Number.isFinite(n) && n >= 0 && n < LEN) {
        memoryVotdIndex = n;
        return n;
      }
    }
  } catch {
    /* use fresh random + memory */
  }
  const i = Math.floor(Math.random() * LEN);
  memoryVotdIndex = i;
  try {
    window.sessionStorage.setItem(VOTD_SESSION_KEY, String(i));
  } catch {
    /* still have memoryVotdIndex */
  }
  return i;
}

/**
 * @param {number} i
 */
export function setSessionVotdIndex(i) {
  if (i >= 0 && i < LEN) {
    memoryVotdIndex = i;
  }
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    if (i >= 0 && i < LEN) {
      window.sessionStorage.setItem(VOTD_SESSION_KEY, String(i));
    }
  } catch {
    /* ignore */
  }
}

/**
 * Deterministic per calendar day (local timezone) index into FAMOUS_VERSE_REFS.
 * Kept for tests; the reader uses the session index instead.
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
