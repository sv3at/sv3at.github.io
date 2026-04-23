/**
 * Emits `src/votd-500.json` from `votd-500-picks.mjs`, validated against t-kjv.json.
 * Run: `npm run build-votd` or `node scripts/build-votd-500.mjs`
 * Docs: docs/wiki/Verse-of-the-Day-Pool.md
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { EIGHT_BY_BOOK, SEVEN_BY_BOOK } from "./votd-500-picks.mjs";
import { USFM_LIST } from "./usfm-books.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const kjv = JSON.parse(readFileSync(join(root, "public/bible-data/t-kjv.json"), "utf8"));
const { books: B } = kjv;

const first38 = USFM_LIST.slice(0, 38).map((b) => b.id);
const last28 = USFM_LIST.slice(38).map((b) => b.id);

function verseExists(id, c, v) {
  const book = B[id];
  if (!book) return { ok: false, reason: `no book ${id}` };
  const ch = book.ch;
  if (!ch || c < 1 || c >= ch.length) return { ok: false, reason: `${id} ch ${c} oob` };
  const cells = ch[c];
  if (!Array.isArray(cells) || v < 1 || v > cells.length) return { ok: false, reason: `${id} ${c}:${v} oob` };
  return { ok: true };
}

function parseSegments(id, s, nExpected) {
  const parts = s
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length !== nExpected) {
    return { err: `${id} expected ${nExpected} segments, got ${parts.length}` };
  }
  const out = [];
  for (const p of parts) {
    const m = p.match(/^(\d+)-(\d+)$/);
    if (!m) return { err: `${id} bad segment ${p}` };
    out.push({ c: +m[1], v: +m[2] });
  }
  return { out };
}

const order = [];

for (const id of first38) {
  const r = parseSegments(id, EIGHT_BY_BOOK[id], 8);
  if (r.err) throw new Error(r.err);
  for (const { c, v } of r.out) {
    const ex = verseExists(id, c, v);
    if (!ex.ok) throw new Error(ex.reason);
    order.push([id, c, v]);
  }
}

for (const id of last28) {
  const r = parseSegments(id, SEVEN_BY_BOOK[id], 7);
  if (r.err) throw new Error(r.err);
  for (const { c, v } of r.out) {
    const ex = verseExists(id, c, v);
    if (!ex.ok) throw new Error(ex.reason);
    order.push([id, c, v]);
  }
}

if (order.length !== 500) {
  throw new Error(`len ${order.length} expected 500`);
}

const arr = order.map(([id, c, v]) => ({ id, c, v }));
const outPath = join(root, "src/votd-500.json");
writeFileSync(outPath, `${JSON.stringify(arr, null, 2)}\n`, "utf8");
console.log("wrote", outPath, arr.length);
