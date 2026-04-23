/**
 * Prints EIGHT (×38) and SEVEN (×28) string lines: n unique (c-v) per book
 * (spread by chapter + bump v to avoid dups in single-chapter books).
 * Save stdout into `scripts/votd-500-picks.mjs` (keep/merge the comment header), then `npm run build-votd`.
 * Docs: docs/wiki/Verse-of-the-Day-Pool.md
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { USFM_LIST } from "./usfm-books.mjs";

const kjv = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../public/bible-data/t-kjv.json"), "utf8"),
);
const { books: B } = kjv;
const first38 = USFM_LIST.slice(0, 38).map((b) => b.id);
const last28 = USFM_LIST.slice(38).map((b) => b.id);

/**
 * @param {string} id
 * @param {number} n
 */
function pickN(id, n) {
  const ch = B[id].ch;
  const nc = ch.length - 1;
  if (nc < 1) throw new Error(id + " no ch");
  const out = /** @type {string[]} */ ([]);
  const used = new Set();
  for (let j = 0; j < n; j++) {
    let c = 1;
    if (nc >= n) c = 1 + Math.min(nc - 1, Math.floor((j * (nc - 1)) / Math.max(1, n - 1)));
    else c = 1;
    let v = 1;
    const maxV = ch[c].length;
    for (;;) {
      if (v > maxV) {
        c += 1;
        if (c > nc) throw new Error(`${id} oob filling ${j}/${n}`);
        v = 1;
        const m = ch[c].length;
        if (v > m) continue;
        continue;
      }
      const key = `${c}|${v}`;
      if (!used.has(key)) {
        used.add(key);
        out.push(`${c}-${v}`);
        break;
      }
      v += 1;
    }
  }
  if (out.length !== n || new Set(out).size !== n) throw new Error(`${id} len ${out.length} unique ${new Set(out).size}`);
  return out.join(";");
}

const kNeedQuote = (id) =>
  ["1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "1CO", "2CO", "1TH", "2TH", "1TI", "2TI", "1PE", "2PE", "1JN", "2JN", "3JN"].includes(
    id,
  );

let lines = "export const EIGHT_BY_BOOK = {\n";
for (const id of first38) {
  const k = kNeedQuote(id) ? JSON.stringify(id) : id;
  lines += `  ${k}: "${pickN(id, 8)}",\n`;
}
lines += "};\n\nexport const SEVEN_BY_BOOK = {\n";
for (const id of last28) {
  const k = kNeedQuote(id) ? JSON.stringify(id) : id;
  lines += `  ${k}: "${pickN(id, 7)}",\n`;
}
lines += "};\n";
process.stdout.write(lines);
