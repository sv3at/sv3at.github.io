/**
 * Fetches public-domain Bible data (Bolls static JSON, thiagobodruk JSON, seven1m open-bibles XML)
 * and writes a portable bundle to public/bible-data/.
 * Run: npm run build:bible
 */
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { USFM_LIST, BNUMBER_TO_USFM, USFM_BY_ID } from "./usfm-books.mjs";
import { kjvPlainFromBollsHtml, kjvStrongsSegments } from "./kjv-strongs.mjs";
import { loadStrongDictionaryScript } from "./strong-lexicon-vm.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "bible-data");

const stripHtml = (s) => {
  if (s == null) return "";
  return String(s)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/&#?\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/** @returns {Record<string, {n:string, ch: (string|null)[][]}>} */
function emptyBookShell() {
  return {};
}

function setVerse(books, usfm, chNum, vNum, text) {
  if (!books[usfm]) books[usfm] = { n: USFM_BY_ID[usfm].n, ch: [null] };
  if (!books[usfm].ch[chNum]) books[usfm].ch[chNum] = [];
  const a = books[usfm].ch[chNum];
  if (a.length < vNum) a.length = vNum;
  a[vNum - 1] = text;
}

// --- Bolls: array of { book, chapter, verse, text } (book = 1..) ---
function fromBolls(rows) {
  const books = emptyBookShell();
  for (const r of rows) {
    const bn = parseInt(r.book, 10);
    if (bn < 1 || bn > 66) continue;
    const u = BNUMBER_TO_USFM[bn];
    setVerse(books, u, parseInt(r.chapter, 10), parseInt(r.verse, 10), stripHtml(r.text));
  }
  return { books, bookOrder: USFM_LIST.map((b) => b.id) };
}

/** KJV with Strong's segments from Bolls `<S>n</S>` markup (Bolls static KJV.json). */
function fromBollsKjvStrongs(rows) {
  const books = emptyBookShell();
  for (const r of rows) {
    const bn = parseInt(r.book, 10);
    if (bn < 1 || bn > 66) continue;
    const u = BNUMBER_TO_USFM[bn];
    const ch = parseInt(r.chapter, 10);
    const v = parseInt(r.verse, 10);
    const cell = {
      p: kjvPlainFromBollsHtml(r.text),
      s: kjvStrongsSegments(r.text, bn),
    };
    setVerse(books, u, ch, v, cell);
  }
  return { books, bookOrder: USFM_LIST.map((b) => b.id), _strongs: true };
}

/** Normalize whitespace; keep full text (no truncation). */
function normLexField(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Full Strong's lexicon fields from Open Scriptures Hebrew/Greek dictionary
 * scripts (CC BY-SA): lemma, transliteration, optional pronunciation (Hebrew),
 * derivation, strongs_def, kjv_def — all included when present.
 */
async function buildLexiconFull() {
  const gUrl =
    "https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js";
  const hUrl =
    "https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js";
  const gJs = await downloadText(gUrl);
  const hJs = await downloadText(hUrl);
  const greek = loadStrongDictionaryScript(gJs);
  const hebrew = loadStrongDictionaryScript(hJs);
  const full = {};
  const add = (dict) => {
    for (const [k, v] of Object.entries(dict)) {
      if (!v || typeof v !== "object") continue;
      const lemma = normLexField(v.lemma);
      const tr = normLexField(v.translit || v.xlit);
      const pron = normLexField(v.pron);
      const sd = normLexField(v.strongs_def);
      const kd = normLexField(v.kjv_def);
      const dv = normLexField(v.derivation);
      /** @type {Record<string, string>} */
      const o = {};
      if (lemma) o.l = lemma;
      if (tr) o.t = tr;
      if (pron) o.p = pron;
      if (sd) o.sd = sd;
      if (kd) o.kd = kd;
      if (dv) o.dv = dv;
      if (Object.keys(o).length) full[k] = o;
    }
  };
  add(hebrew);
  add(greek);
  await writeFile(join(outDir, "lexicon-full.json"), JSON.stringify(full), "utf8");
  console.log("Wrote lexicon-full.json entries", Object.keys(full).length);
}

// --- thiagodruk: [{ abbrev, book, chapters: [ [v,v], [v,v] ] }] ---
function fromThiagodruk(arr) {
  if (!Array.isArray(arr) || arr.length < 66) {
    throw new Error("thiagodruk: expected 66 books");
  }
  const books = emptyBookShell();
  for (let i = 0; i < 66; i++) {
    const usfm = USFM_LIST[i].id;
    const name = USFM_LIST[i].n;
    if (!arr[i].chapters) throw new Error(`thiagodruk: missing chapters ${i}`);
    const chs = [null, ...arr[i].chapters.map((verses) => (verses || []).map((v) => stripHtml(v) || " "))];
    books[usfm] = { n: name, ch: chs };
  }
  return { books, bookOrder: USFM_LIST.map((b) => b.id) };
}

// --- Zefania: <BIBLEBOOK> ... <CHAPTER> <VERS> ---
function fromZefaniaXml(xml) {
  const books = emptyBookShell();
  const bbooks = xml.split(/<BIBLEBOOK\b/);
  for (const b of bbooks) {
    if (b.length < 10) continue;
    const bn = b.match(/bnumber="(\d+)"/);
    if (!bn) continue;
    const bnum = parseInt(bn[1], 10);
    if (bnum < 1 || bnum > 66) continue;
    const bnameM = b.match(/bname="([^"]*)"/);
    const usfm = BNUMBER_TO_USFM[bnum];
    const bname = bnameM ? bnameM[1] : USFM_BY_ID[usfm].n;
    books[usfm] = { n: bname, ch: [null] };
    const chapters = b.split(/<CHAPTER\b/);
    for (const chB of chapters) {
      if (chB.length < 5) continue;
      const cnm = chB.match(/cnumber="(\d+)"/);
      if (!cnm) continue;
      const cnum = parseInt(cnm[1], 10);
      const re = /<VERS vnumber="(\d+)">([\s\S]*?)<\/VERS>/g;
      let m;
      while ((m = re.exec(chB))) {
        setVerse(books, usfm, cnum, parseInt(m[1], 10), stripHtml(m[2]));
      }
    }
  }
  return { books, bookOrder: USFM_LIST.map((b) => b.id) };
}

// --- USFX: book id="JHN" ... <c id="1"/> <v id="1" ...> ... <ve/> ---
function stripUsfxText(inner) {
  return stripHtml(
    inner
      .replace(/<f[^>]*>[\s\S]*?<\/f>/gi, " ")
      .replace(/<fr[^>]*>[\s\S]*?<\/fr>/gi, " "),
  );
}

function fromUsfx(xml, { onlyProtestant66 = true } = {}) {
  const books = emptyBookShell();
  const parts = xml.split(/<book id="/);
  for (const part of parts) {
    const m = part.match(/^([A-Z0-9]+)">/);
    if (!m) continue;
    const id = m[1];
    if (onlyProtestant66) {
      if (!USFM_BY_ID[id]) continue;
    } else {
      if (!/^[0-9A-Z]{2,3}$/.test(id)) continue;
    }
    const nMatch = part.match(
      new RegExp(`<h>[^<]*<\\/h>|<p sfm="mt"[^>]*>[^<]+<\\/p>`, "i"),
    );
    const name = USFM_BY_ID[id] ? USFM_BY_ID[id].n : nMatch ? stripHtml(nMatch[0]) : id;
    const block = part.split(/<\/book>/)[0];
    if (!block) continue;
    books[id] = { n: name, ch: [null] };
  const cParts = block.split(/<c id="/);
  for (const cSeg of cParts) {
    const cnumM = cSeg.match(/^(\d+)"\s*(?:\/)?>([\s\S]*)/);
    if (!cnumM) continue;
    const cnum = parseInt(cnumM[1], 10);
    const cBody = cnumM[2] || cSeg;
    const vTag = /<v id="(\d+)"[^>]*\/>/g;
    const matches = [...cBody.matchAll(vTag)];
    for (let vi = 0; vi < matches.length; vi++) {
      const m0 = matches[vi];
      const vnum = parseInt(m0[1], 10);
      const start = m0.index + m0[0].length;
      const end = vi + 1 < matches.length ? matches[vi + 1].index : cBody.length;
      let chunk = cBody.slice(start, end);
      const endVe = chunk.search(/<ve/i);
      if (endVe >= 0) chunk = chunk.slice(0, endVe);
      setVerse(books, id, cnum, vnum, stripUsfxText(chunk));
    }
  }
}
  const order = USFM_LIST.map((b) => b.id).filter((id) => books[id]);
  for (const id of order) {
    const b = books[id];
    for (let ci = 1; ci < b.ch.length; ci++) {
      if (!b.ch[ci]) continue;
      b.ch[ci] = b.ch[ci].map((v) => (v == null || v === "" ? " " : v));
    }
  }
  return { books, bookOrder: order };
}

async function downloadText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`);
  return r.text();
}

async function writeJson(name, data) {
  const path = join(outDir, name);
  await writeFile(path, JSON.stringify(data), "utf8");
  console.log("Wrote", name, `~${(JSON.stringify(data).length / 1e6).toFixed(2)} MB json`);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const manifest = {
    version: 1,
    about:
      "Derived from bolls.life (bulk JSON), thiagobodruk/bible, seven1m/open-bibles, and openscriptures/strongs (lexicon). Review licenses in each translation entry.",
    translations: [],
    lexiconFile: "lexicon-full.json",
  };

  const bolls = async (slug) => {
    const url = `https://bolls.life/static/translations/${slug}.json`;
    return downloadText(url);
  };
  const th = async (f) => downloadText(`https://raw.githubusercontent.com/thiagobodruk/bible/master/json/${f}.json`);
  const ob = async (f) => downloadText(`https://raw.githubusercontent.com/seven1m/open-bibles/master/${f}`);

  // --- KJV + Strong's (Bolls KJV.json retains <S>n</S> tags) ---
  {
    const j = await bolls("KJV");
    const d = fromBollsKjvStrongs(JSON.parse(j));
    await writeJson(
      "t-kjv.json",
      {
        ...d,
        _meta: {
          name: "King James Version (with Strong's numbers)",
          language: "English",
          license: "Public Domain (text); Strong's tagging from Bolls KJV export",
          source: "Bolls: KJV + Strong's markers",
        },
      },
    );
    manifest.translations.push({
      id: "kjv",
      name: "King James Version (Strong's)",
      language: "English",
      license: "Public Domain (KJV); Strong's from Bolls markup",
      dataFile: "t-kjv.json",
      source: "Bolls static KJV with <S>number</S> Strong's tags; lexicon: openscriptures/strongs",
      features: ["strongs"],
    });
  }

  // --- remaining Bolls translations ---
  for (const [id, meta, slug] of [
    ["web", { name: "World English Bible", language: "English", license: "Public Domain" }, "WEB"],
    ["ylt", { name: "Young's Literal Translation (1898)", language: "English", license: "Public Domain" }, "YLT"],
    ["asv", { name: "American Standard Version 1901", language: "English", license: "Public Domain" }, "ASV"],
    ["cuv", { name: "Chinese Union Version 和合本", language: "Chinese (Traditional/Union, Bolls CUV)", license: "Public Domain" }, "CUV"],
    [
      "dra",
      { name: "Douay-Rheims Bible 1899 American", language: "English (DRB/DRA)", license: "Public Domain" },
      "DRB",
    ],
    ["clementine", { name: "Biblia Sacra Vulgatam Clementinam", language: "Latin", license: "Public Domain" }, "VULG"],
    ["synodal", { name: "Russian Synodal 1876 (SYNOD)", language: "Russian", license: "Public Domain" }, "SYNOD"],
  ]) {
    const j = await bolls(slug);
    const d = fromBolls(JSON.parse(j));
    const fn = `t-${id}.json`;
    await writeJson(
      fn,
      { ...d, _meta: { name: meta.name, language: meta.language, license: meta.license, source: `Bolls: ${slug}` } },
    );
    manifest.translations.push({ id, ...meta, dataFile: fn, source: `Bolls: ${slug}` });
  }

  await buildLexiconFull();

  // --- 3 thiagodruk (bbe, almeida, rccv) ---
  for (const [id, file, meta] of [
    [
      "bbe",
      "en_bbe",
      { name: "Bible in Basic English", language: "English", license: "CC BY-NC (text); verify use in your app" },
    ],
    [
      "almeida",
      "pt_aa",
      { name: "João Ferreira de Almeida (revisada)", language: "Portuguese", license: "varies; verify" },
    ],
    [
      "rccv",
      "ro_cornilescu",
      { name: "Protestant Romanian: Cornilescu (Dumitru) — thiagodruk 'ro_cornilescu'", language: "Romanian", license: "verify" },
    ],
  ]) {
    const arr = JSON.parse(await th(file));
    const d = fromThiagodruk(arr);
    const fn = `t-${id}.json`;
    await writeJson(
      fn,
      { ...d, _meta: { name: meta.name, language: meta.language, license: meta.license, source: `thiagodruk: ${file}` } },
    );
    manifest.translations.push({ id, ...meta, dataFile: fn, source: `thiagodruk: ${file}.json` });
  }

  // --- Zefania: darby, bkr ---
  for (const [id, f, meta] of [
    [
      "darby",
      "eng-darby.zefania.xml",
      { name: "Darby Bible (English, Zefania Unbound 2009)", language: "English", license: "see Zefania metadata" },
    ],
    [
      "bkr",
      "cze-bkr.zefania.xml",
      { name: "Bible Kralická 1613 (Czech, Zefania)", language: "Czech", license: "public domain" },
    ],
  ]) {
    const xml = await ob(f);
    const d = fromZefaniaXml(xml);
    const out = `t-${id}.json`;
    await writeJson(
      out,
      { ...d, _meta: { name: meta.name, language: meta.language, license: meta.license, source: `open-bibles: ${f}` } },
    );
    manifest.translations.push({ id, ...meta, dataFile: out, source: `seven1m/open-bibles: ${f}` });
  }

  // --- USFX: webbe (18MB) + cherokee (NT) ---
  const webbeXml = await ob("eng-gb-webbe.usfx.xml");
  const wbd = fromUsfx(webbeXml, { onlyProtestant66: true });
  await writeJson("t-webbe.json", {
    ...wbd,
    _meta: { name: "World English Bible British (WEBBE)", language: "English (UK)", license: "Public Domain", source: "open-bibles: eng-gb-webbe.usfx.xml" },
  });
  manifest.translations.push({
    id: "webbe",
    name: "World English Bible, British Ed. (WEBBE)",
    language: "English (UK)",
    license: "Public Domain",
    dataFile: "t-webbe.json",
    source: "seven1m/open-bibles: eng-gb-webbe.usfx.xml",
  });

  const chXml = await ob("chr-cherokee.usfx.xml");
  const chd = fromUsfx(chXml, { onlyProtestant66: true });
  await writeJson("t-cherokee.json", {
    ...chd,
    _meta: {
      name: "Cherokee New Testament (USFX)",
      language: "Cherokee (partial NT)",
      license: "public domain (NT)",
      source: "open-bibles: chr-cherokee.usfx.xml (NT books only in file)",
    },
  });
  manifest.translations.push({
    id: "cherokee",
    name: "Cherokee New Testament",
    language: "Cherokee (NT; subset of canon)",
    license: "public domain (NT only in source file)",
    dataFile: "t-cherokee.json",
    source: "seven1m/open-bibles: chr-cherokee.usfx.xml",
  });

  // --- oeb: single-file OSIS in open-bibles is incomplete; duplicate Bolls WEB (honest) ---
  const oebNote =
    "The OEB (Open English) single OSIS in seven1m/open-bibles is not a full 66-book one-file import. This bundle reuses the same text as the World English Bible (Bolls WEB) so navigation stays consistent; replace t-oeb-*.json if you have a full OEB export.";

  await copyFile(join(outDir, "t-web.json"), join(outDir, "t-oeb-us.json"));
  await copyFile(join(outDir, "t-web.json"), join(outDir, "t-oeb-cw.json"));
  manifest.translations.push(
    {
      id: "oeb-us",
      name: "Open English Bible (US) [WEB content — see note]",
      language: "English (US)",
      license: "Public Domain (as WEB; see source)",
      dataFile: "t-oeb-us.json",
      source: oebNote,
    },
    {
      id: "oeb-cw",
      name: "Open English Bible, Commonwealth (UK) [WEB content — see note]",
      language: "English (UK, Commonwealth placeholder)",
      license: "Public Domain (as WEB; see source)",
      dataFile: "t-oeb-cw.json",
      source: oebNote,
    },
  );

  for (const e of manifest.translations) {
    e.sortKey = (e.language || "").toLowerCase() + e.name;
  }
  manifest.translations.sort((a, b) => a.sortKey.localeCompare(b.sortKey) || a.id.localeCompare(b.id));
  for (const e of manifest.translations) delete e.sortKey;

  await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log("Wrote manifest.json; total translations", manifest.translations.length);
  console.log("Data directory:", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
