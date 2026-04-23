/**
 * Vite serves `public/` at the site root → `/bible-data/…`.
 * Plain `python -m http.server` from the project root serves files as-is → `/public/bible-data/…`.
 */
import { cleanVerseText, versePlain, isStrongsVerseCell, stepStrongUrl, lookupLexEntry } from "./verse-model.mjs";
import {
  FAMOUS_VERSE_REFS,
  getSessionVotdIndex,
  setSessionVotdIndex,
  pickRandomVotdIndex,
} from "./verse-of-day-refs.mjs";
import {
  BIBLEAPP_TRANSLATE_READY,
  initGoogleTranslate,
  scheduleSyncPageLanguageToPrimaryBible,
} from "./google-translate.mjs";
import { getPrimaryBibleUiHintText, getVotdPoolHintText } from "./translation-hint-i18n.mjs";
import { getUiBundle, applyAppChromeI18n } from "./ui-i18n.mjs";

let dataBase = "/bible-data/";

async function resolveDataBase() {
  const candidates = ["/bible-data/", "/public/bible-data/"];
  if (typeof window !== "undefined") {
    try {
      candidates.push(new URL("public/bible-data/", window.location.href).href);
    } catch {
      /* ignore */
    }
  }
  const seen = new Set();
  for (const base of candidates) {
    if (seen.has(base)) continue;
    seen.add(base);
    const manifestUrl = base.endsWith("/") ? `${base}manifest.json` : `${base}/manifest.json`;
    try {
      const r = await fetch(manifestUrl, { method: "GET", cache: "no-store" });
      if (r.ok) return base.endsWith("/") ? base : `${base}/`;
    } catch {
      /* network / CORS */
    }
  }
  return "/bible-data/";
}

const $ = (id) => document.getElementById(id);

const els = {
  translation: $("translation"),
  compareToggle: $("compare-toggle"),
  compareField: $("compare-field"),
  translationCompare: $("translation-compare"),
  book: $("book"),
  chapter: $("chapter"),
  prev: $("prev"),
  next: $("next"),
  random: $("random"),
  status: $("status"),
  passage: $("passage"),
  passageCompare: $("passage-compare"),
  ref: $("ref"),
  verses: $("verses"),
  refCompare: $("ref-compare"),
  versesCompare: $("verses-compare"),
  footnote: $("footnote"),
  lexDialog: $("lex-dialog"),
  lexTitle: $("lex-dialog-title"),
  lexLemma: $("lex-dialog-lemma"),
  lexDef: $("lex-dialog-def"),
  lexStep: $("lex-dialog-step"),
  lexClose: $("lex-dialog-close"),
  lexAttrib: $("lex-dialog-attrib"),
  votd: $("votd"),
  votdRef: $("votd-ref"),
  votdText: $("votd-text"),
  votdRefresh: $("votd-refresh"),
  votdGoto: $("votd-goto"),
  votdHintBtn: $("votd-hint-btn"),
  translationHint: $("translation-hint"),
};

function updateBibleHelpHints() {
  const tTr = getPrimaryBibleUiHintText(currentMeta);
  if (els.translationHint) {
    els.translationHint.setAttribute("title", tTr);
    els.translationHint.setAttribute("aria-label", tTr);
  }
  const tVotd = getVotdPoolHintText(currentMeta);
  if (els.votdHintBtn) {
    els.votdHintBtn.setAttribute("title", tVotd);
    els.votdHintBtn.setAttribute("aria-label", tVotd);
  }
  applyAppChromeI18n(currentMeta);
}

/** @type {number} */
let votdListIndex = getSessionVotdIndex();

/** New Testament book ids (USFM) for “Random” */
const NT_IDS = new Set(
  "MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV".split(" "),
);

let manifest = null;
let dataCache = new Map();
/** @type {Record<string, {l?: string, t?: string, d?: string}> | undefined} */
let lexiconData;
let currentData = null;
let currentDataFile = null;
let currentMeta = null;
let compareEnabled = false;
let compareData = null;
let compareMeta = null;
let currentBookId = null;
let currentChapterNum = 1;
let highlightVerse = null;
let highlightWordRef = "";
let highlightWordSide = "";
let pendingVerseScroll = false;

async function ensureLexicon() {
  if (lexiconData !== undefined) return lexiconData;
  const f = manifest && manifest.lexiconFile;
  if (!f) {
    lexiconData = {};
    return lexiconData;
  }
  try {
    lexiconData = await fetchJson(`${dataBase}${f}`);
  } catch {
    lexiconData = {};
  }
  return lexiconData;
}

async function showLexiconFor(strongId) {
  const u = getUiBundle(currentMeta);
  const lex = await ensureLexicon();
  const row = lookupLexEntry(lex, strongId);
  els.lexTitle.textContent = u.lexStrongsTitle(strongId);
  if (row && (row.l || row.t || row.d)) {
    const bits = [];
    if (row.l) bits.push(row.l);
    if (row.t) bits.push(`(${row.t})`);
    els.lexLemma.textContent = bits.join(" ") || "—";
    els.lexDef.textContent = row.d || "—";
  } else {
    els.lexLemma.textContent = u.lexNoGloss;
    els.lexDef.textContent = u.lexUseStep;
  }
  els.lexStep.href = stepStrongUrl(strongId);
  els.lexAttrib.textContent = u.lexAttrib;
  if (els.lexDialog.showModal) els.lexDialog.showModal();
  else window.alert(`${strongId}: ${els.lexLemma.textContent}`);
}

function appendInteractiveText(container, text, verseNum, tokenCursor, side) {
  const parts = String(text || "").split(/(\s+)/);
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      container.appendChild(document.createTextNode(part));
      continue;
    }
    const tokenRef = `${verseNum}:${tokenCursor.i}`;
    tokenCursor.i += 1;
    const token = document.createElement("span");
    token.className = "word-token";
    token.dataset.wordRef = tokenRef;
    if (highlightWordRef && highlightWordRef === tokenRef && highlightWordSide === side) token.classList.add("word-highlight");
    token.textContent = part;
    token.addEventListener("click", (ev) => {
      ev.stopPropagation();
      highlightWordRef = tokenRef;
      highlightWordSide = side;
      void loadPassage();
    });
    container.appendChild(token);
  }
}

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

function setStatus(msg, isError = false) {
  els.status.textContent = msg;
  els.status.classList.toggle("error", isError);
}

function setLoading(loading) {
  document.body.classList.toggle("loading", loading);
}

async function loadBlobJson(file) {
  if (dataCache.has(file)) return dataCache.get(file);
  setLoading(true);
  try {
    const d = await fetchJson(`${dataBase}${file}`);
    dataCache.set(file, d);
    return d;
  } finally {
    setLoading(false);
  }
}

function booksInOrder(d) {
  return d.bookOrder || Object.keys(d.books);
}

function maxChapter(usfm) {
  const b = currentData.books[usfm];
  if (!b || !b.ch) return 0;
  return b.ch.length - 1;
}

function bookIndex() {
  return booksInOrder(currentData).indexOf(currentBookId);
}

function updateNav() {
  const order = booksInOrder(currentData);
  const i = bookIndex();
  const max = maxChapter(currentBookId);
  const hasPrev = i > 0 || currentChapterNum > 1;
  const hasNext = i < order.length - 1 || currentChapterNum < max;
  els.prev.disabled = !hasPrev;
  els.next.disabled = !hasNext;
}

function fillBookSelect() {
  const order = booksInOrder(currentData);
  els.book.replaceChildren();
  for (const id of order) {
    const b = currentData.books[id];
    if (!b) continue;
    const o = document.createElement("option");
    o.value = id;
    o.textContent = b.n || id;
    els.book.appendChild(o);
  }
  els.book.disabled = order.length === 0;
}

function fillChapterSelect() {
  const n = maxChapter(currentBookId);
  els.chapter.replaceChildren();
  for (let c = 1; c <= n; c++) {
    const o = document.createElement("option");
    o.value = String(c);
    o.textContent = String(c);
    els.chapter.appendChild(o);
  }
  els.chapter.disabled = n === 0;
  if (currentChapterNum < 1) currentChapterNum = 1;
  if (currentChapterNum > n) currentChapterNum = n;
  els.chapter.value = String(currentChapterNum);
  updateNav();
}

function fillTranslationSelects(sorted) {
  els.translation.replaceChildren();
  els.translationCompare.replaceChildren();
  for (const t of sorted) {
    const one = document.createElement("option");
    one.value = t.id;
    one.textContent = `${t.name} (${t.language || "—"})`;
    if (t.id === "synodal") one.selected = true;
    els.translation.appendChild(one);

    const two = document.createElement("option");
    two.value = t.id;
    two.textContent = `${t.name} (${t.language || "—"})`;
    els.translationCompare.appendChild(two);
  }
}

async function selectTranslation(m) {
  currentMeta = m;
  const d = await loadBlobJson(m.dataFile);
  currentData = d;
  currentDataFile = m.dataFile;
  if (!d.books) {
    setStatus(getUiBundle(m).invalidData, true);
    updateBibleHelpHints();
    return;
  }
  if (!currentBookId || !d.books[currentBookId]) {
    const jhn = d.books.JHN ? "JHN" : booksInOrder(d)[0];
    currentBookId = jhn;
  }
  fillBookSelect();
  els.book.value = currentBookId;
  if (currentChapterNum < 1) currentChapterNum = 1;
  fillChapterSelect();
  updateBibleHelpHints();
}

async function selectCompareTranslation(m) {
  compareMeta = m;
  compareData = await loadBlobJson(m.dataFile);
  if (!compareData.books) {
    setStatus(getUiBundle(currentMeta).invalidSecond, true);
    return;
  }
}

function appendStrongsChips(container, ids) {
  const u = getUiBundle(currentMeta);
  for (const id of ids) {
    const a = document.createElement("a");
    a.className = "strongs";
    a.href = stepStrongUrl(id);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = id;
    a.title = u.strongsChipTitle(id);
    a.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
      ev.preventDefault();
      void showLexiconFor(id);
    });
    container.appendChild(a);
  }
}

function renderStrongsTokens(tspan, segments, verseNum, tokenCursor, side) {
  tspan.classList.add("verse-tokens");
  tspan.appendChild(document.createTextNode(" "));
  for (const seg of segments) {
    const wrap = document.createElement("span");
    wrap.className = "w";
    appendInteractiveText(wrap, seg.w, verseNum, tokenCursor, side);
    if (seg.ns && seg.ns.length) appendStrongsChips(wrap, seg.ns);
    else if (seg.n) appendStrongsChips(wrap, [seg.n]);
    tspan.appendChild(wrap);
    tspan.appendChild(document.createTextNode(" "));
  }
}

function mapMtToSynodalPsalmChapter(mtChapter) {
  if (mtChapter <= 8) return mtChapter;
  if (mtChapter <= 113) return mtChapter - 1;
  if (mtChapter <= 115) return 113;
  if (mtChapter === 116) return 114;
  if (mtChapter >= 117 && mtChapter <= 146) return mtChapter - 1;
  if (mtChapter === 147) return 146;
  return mtChapter;
}

function mapSynodalToMtPsalmChapter(synChapter) {
  if (synChapter <= 8) return synChapter;
  if (synChapter <= 112) return synChapter + 1;
  if (synChapter === 113) return 114;
  if (synChapter === 114) return 116;
  if (synChapter >= 115 && synChapter <= 145) return synChapter + 1;
  if (synChapter === 146) return 147;
  return synChapter;
}

function isSynodalMeta(meta) {
  return !!meta && meta.id === "synodal";
}

function mapChapterForParallel(primaryMetaIn, compareMetaIn, bookId, chapterNum) {
  if (bookId !== "PSA") return chapterNum;
  const primarySyn = isSynodalMeta(primaryMetaIn);
  const compareSyn = isSynodalMeta(compareMetaIn);
  if (primarySyn && !compareSyn) return mapSynodalToMtPsalmChapter(chapterNum);
  if (!primarySyn && compareSyn) return mapMtToSynodalPsalmChapter(chapterNum);
  return chapterNum;
}

function renderVerseList(data, meta, refEl, listEl, chapterNum, side) {
  const b = data.books[currentBookId];
  const tname = (meta && meta.name) || (data._meta && data._meta.name) || "—";
  if (!b || !b.ch[chapterNum]) {
    refEl.textContent = `${currentBookId} ${chapterNum} — ${tname}`;
    listEl.replaceChildren();
    const empty = document.createElement("li");
    empty.className = "verse verse-missing";
    empty.textContent = getUiBundle(currentMeta).missingChapter;
    listEl.appendChild(empty);
    return;
  }
  refEl.textContent = `${b.n} ${chapterNum} — ${tname}`;
  listEl.replaceChildren();
  const chA = b.ch[chapterNum];
  for (let vi = 0; vi < chA.length; vi++) {
    const vnum = vi + 1;
    const cell = chA[vi];
    const text = versePlain(cell);
    const visible = cleanVerseText(text);
    if (!visible.trim() && highlightVerse == null) continue;
    const li = document.createElement("li");
    li.className = "verse";
    if (highlightVerse != null && vnum === highlightVerse) li.classList.add("verse-highlight");
    li.dataset.verse = String(vnum);
    li.addEventListener("click", () => {
      highlightVerse = vnum;
      pendingVerseScroll = true;
      void loadPassage();
    });
    const n = document.createElement("span");
    n.className = "vnum";
    n.textContent = String(vnum);
    const tspan = document.createElement("span");
    tspan.className = "vtext";
    const tokenCursor = { i: 0 };
    if (isStrongsVerseCell(cell)) renderStrongsTokens(tspan, cell.s, vnum, tokenCursor, side);
    else {
      tspan.appendChild(document.createTextNode(" "));
      appendInteractiveText(tspan, visible || " ", vnum, tokenCursor, side);
      tspan.appendChild(document.createTextNode(" "));
    }
    li.appendChild(n);
    li.appendChild(tspan);
    listEl.appendChild(li);
  }
}

async function renderPassage() {
  if (!currentData || !currentBookId) return;
  if (currentData._strongs || (compareEnabled && compareData && compareData._strongs)) void ensureLexicon();

  const primaryChapterNum = currentChapterNum;
  const u = getUiBundle(currentMeta);
  renderVerseList(currentData, currentMeta, els.ref, els.verses, primaryChapterNum, "primary");

  let foot = "";
  const src = (currentMeta && currentMeta.source) || (currentData._meta && currentData._meta.source) || "";
  const lic = (currentMeta && currentMeta.license) || (currentData._meta && currentData._meta.license) || "";
  foot = `${u.lblPrimary} ${src} · ${u.lblLicense} ${lic} · ${u.lblStored}`;

  const parallelActive = !!(compareEnabled && compareData && compareMeta);
  els.passage.classList.toggle("parallel-enabled", parallelActive);
  els.passageCompare.hidden = !parallelActive;
  if (parallelActive) {
    const compareChapterNum = mapChapterForParallel(currentMeta, compareMeta, currentBookId, currentChapterNum);
    renderVerseList(compareData, compareMeta, els.refCompare, els.versesCompare, compareChapterNum, "compare");
    if (compareChapterNum !== currentChapterNum && currentBookId === "PSA") {
      const leftName = (currentMeta && currentMeta.name) || u.primaryName;
      const rightName = (compareMeta && compareMeta.name) || u.secondName;
      foot += u.fmtPsalmMap(leftName, String(currentChapterNum), rightName, String(compareChapterNum));
    }
    const csrc = (compareMeta && compareMeta.source) || (compareData._meta && compareData._meta.source) || "";
    const clic = (compareMeta && compareMeta.license) || (compareData._meta && compareData._meta.license) || "";
    foot += ` ${u.secondIntro} ${csrc} · ${u.license2} ${clic}.`;
  } else {
    els.refCompare.textContent = "";
    els.versesCompare.replaceChildren();
  }

  if (currentData._strongs || (compareEnabled && compareData && compareData._strongs)) {
    foot += u.strFootStrongs;
  }
  if (highlightWordRef) {
    foot += u.strFootWordHl;
  }

  els.footnote.textContent = foot;
  setStatus("");
  els.passage.hidden = false;
  if (highlightVerse != null && pendingVerseScroll) {
    const row = els.verses.querySelector(`[data-verse="${highlightVerse}"]`);
    row?.scrollIntoView({ block: "center", behavior: "smooth" });
    pendingVerseScroll = false;
  }
  updateNav();
}

async function loadPassage() {
  setStatus(getUiBundle(currentMeta).statusBusy);
  els.passage.hidden = true;
  try {
    await renderPassage();
  } catch (e) {
    setStatus(e.message, true);
    els.passage.hidden = true;
  }
}

async function goPrev() {
  const order = booksInOrder(currentData);
  if (currentChapterNum > 1) {
    currentChapterNum -= 1;
  } else {
    const i = bookIndex();
    if (i <= 0) return;
    const prev = order[i - 1];
    currentBookId = prev;
    els.book.value = currentBookId;
    currentChapterNum = maxChapter(currentBookId);
  }
  els.chapter.value = String(currentChapterNum);
  highlightVerse = null;
  pendingVerseScroll = false;
  highlightWordRef = "";
  highlightWordSide = "";
  await loadPassage();
}

async function goNext() {
  const order = booksInOrder(currentData);
  const max = maxChapter(currentBookId);
  if (currentChapterNum < max) {
    currentChapterNum += 1;
  } else {
    const i = bookIndex();
    if (i < 0 || i >= order.length - 1) return;
    currentBookId = order[i + 1];
    els.book.value = currentBookId;
    currentChapterNum = 1;
  }
  els.chapter.value = String(currentChapterNum);
  highlightVerse = null;
  pendingVerseScroll = false;
  highlightWordRef = "";
  highlightWordSide = "";
  await loadPassage();
}

function pickRandomVerse() {
  const d = currentData;
  if (!d) return null;
  const candidates = booksInOrder(d).filter((id) => NT_IDS.has(id) && d.books[id]);
  if (candidates.length === 0) return null;
  for (let t = 0; t < 20; t++) {
    const bid = candidates[Math.floor(Math.random() * candidates.length)];
    const b = d.books[bid];
    const nCh = maxChapter(bid);
    if (nCh < 1) continue;
    const ch = 1 + Math.floor(Math.random() * nCh);
    const chA = b.ch[ch];
    if (!chA || !chA.length) continue;
    const nV = chA.length;
    const v = 1 + Math.floor(Math.random() * nV);
    if (chA[v - 1] == null || cleanVerseText(versePlain(chA[v - 1])).trim() === "") continue;
    return { bookId: bid, chapter: ch, verse: v };
  }
  return null;
}

async function syncCompareToSelection() {
  if (!compareEnabled) return;
  const id = els.translationCompare.value;
  const m = manifest.translations.find((x) => x.id === id);
  if (m) await selectCompareTranslation(m);
}

function getVersePlainForRef(d, { id, c, v }) {
  const b = d.books[id];
  if (!b || !b.ch[c]) return null;
  const chA = b.ch[c];
  if (v < 1 || v > chA.length) return null;
  const cell = chA[v - 1];
  if (cell == null) return null;
  return versePlain(cell);
}

function renderVotd() {
  if (!els.votd || !els.votdText || !els.votdRef) return;
  if (!currentData) {
    els.votd.hidden = true;
    return;
  }
  const ref = FAMOUS_VERSE_REFS[votdListIndex];
  if (!ref) {
    els.votd.hidden = true;
    return;
  }
  els.votd.hidden = false;
  const b = currentData.books[ref.id];
  const bookName = b ? b.n : ref.id;
  els.votdRef.textContent = `${bookName} ${ref.c}:${ref.v}`;
  const t = getVersePlainForRef(currentData, ref);
  if (t == null || !cleanVerseText(t)) {
    els.votdText.textContent = getUiBundle(currentMeta).votdMiss;
  } else {
    els.votdText.textContent = cleanVerseText(t);
  }
  if (els.votdText) els.votdText.setAttribute("cite", `${ref.id} ${ref.c}:${ref.v}`);
}

// --- event listeners ---
els.translation.addEventListener("change", async () => {
  highlightVerse = null;
  pendingVerseScroll = false;
  highlightWordRef = "";
  highlightWordSide = "";
  const id = els.translation.value;
  const m = manifest.translations.find((x) => x.id === id);
  if (m) {
    currentChapterNum = 1;
    await selectTranslation(m);
    if (compareEnabled && els.translationCompare.value === m.id) {
      const alt = manifest.translations.find((x) => x.id !== m.id);
      if (alt) els.translationCompare.value = alt.id;
    }
    await syncCompareToSelection();
    await loadPassage();
    scheduleSyncPageLanguageToPrimaryBible(m);
    renderVotd();
  }
});

els.compareToggle.addEventListener("change", async () => {
  compareEnabled = !!els.compareToggle.checked;
  els.compareField.hidden = !compareEnabled;
  els.translationCompare.disabled = !compareEnabled;
  if (!compareEnabled && highlightWordSide === "compare") {
    highlightWordRef = "";
    highlightWordSide = "";
  }
  if (compareEnabled) await syncCompareToSelection();
  await loadPassage();
});

els.translationCompare.addEventListener("change", async () => {
  if (!compareEnabled) return;
  if (els.translationCompare.value === els.translation.value) {
    setStatus(getUiBundle(currentMeta).pickDifferentCompare, true);
    return;
  }
  highlightWordRef = "";
  highlightWordSide = "";
  await syncCompareToSelection();
  await loadPassage();
});

els.book.addEventListener("change", async () => {
  highlightVerse = null;
  pendingVerseScroll = false;
  highlightWordRef = "";
  highlightWordSide = "";
  currentBookId = els.book.value;
  currentChapterNum = 1;
  fillChapterSelect();
  await loadPassage();
});

els.chapter.addEventListener("change", () => {
  highlightVerse = null;
  pendingVerseScroll = false;
  highlightWordRef = "";
  highlightWordSide = "";
  currentChapterNum = parseInt(els.chapter.value, 10) || 1;
  void loadPassage();
});

els.prev.addEventListener("click", () => void goPrev());
els.next.addEventListener("click", () => void goNext());

els.lexClose.addEventListener("click", () => {
  if (els.lexDialog.open) els.lexDialog.close();
});

els.random.addEventListener("click", () => {
  setStatus(getUiBundle(currentMeta).statusBusy);
  highlightWordRef = "";
  highlightWordSide = "";
  const p = pickRandomVerse();
  if (!p) {
    setStatus(getUiBundle(currentMeta).randomNtFail, true);
    return;
  }
  currentBookId = p.bookId;
  currentChapterNum = p.chapter;
  highlightVerse = p.verse;
  pendingVerseScroll = true;
  els.book.value = currentBookId;
  fillChapterSelect();
  els.chapter.value = String(currentChapterNum);
  void loadPassage();
});

if (els.votdRefresh) {
  els.votdRefresh.addEventListener("click", () => {
    votdListIndex = pickRandomVotdIndex(votdListIndex);
    setSessionVotdIndex(votdListIndex);
    renderVotd();
  });
}

if (els.votdHintBtn) {
  els.votdHintBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setStatus(getVotdPoolHintText(currentMeta), false);
  });
}

els.votdGoto.addEventListener("click", () => {
  const ref = FAMOUS_VERSE_REFS[votdListIndex];
  if (!ref || !currentData) return;
  if (!currentData.books[ref.id]) {
    setStatus(getUiBundle(currentMeta).passageUnavailable, true);
    return;
  }
  setStatus(getUiBundle(currentMeta).statusBusy);
  currentBookId = ref.id;
  currentChapterNum = ref.c;
  highlightVerse = ref.v;
  highlightWordRef = "";
  highlightWordSide = "";
  pendingVerseScroll = true;
  els.book.value = currentBookId;
  fillChapterSelect();
  els.chapter.value = String(currentChapterNum);
  void loadPassage();
});

async function init() {
  try {
    setStatus(getUiBundle(null).loading);
    dataBase = await resolveDataBase();
    manifest = await fetchJson(`${dataBase}manifest.json`);
    if (!manifest.translations || manifest.translations.length === 0) {
      setStatus(getUiBundle(null).noTranslations, true);
      return;
    }
    const enFirst = (a, b) => {
      const al = (a.language || "").toLowerCase();
      const bl = (b.language || "").toLowerCase();
      if (al.startsWith("english") && !bl.startsWith("english")) return -1;
      if (bl.startsWith("english") && !al.startsWith("english")) return 1;
      return a.name.localeCompare(b.name);
    };
    const sorted = [...manifest.translations].sort(enFirst);
    fillTranslationSelects(sorted);
    const tr = els.translation.value || "synodal";
    const m = sorted.find((x) => x.id === tr) || sorted[0];
    els.translation.value = m.id;
    const fallbackCompare = sorted.find((x) => x.id !== m.id) || m;
    els.translationCompare.value = fallbackCompare.id;
    compareEnabled = !!els.compareToggle.checked;
    els.compareField.hidden = !compareEnabled;
    els.translationCompare.disabled = !compareEnabled;
    await selectTranslation(m);
    await syncCompareToSelection();
    currentBookId = "JHN";
    if (els.book.querySelector(`option[value="JHN"]`)) {
      els.book.value = "JHN";
    } else {
      const first = booksInOrder(currentData)[0];
      if (first) {
        currentBookId = first;
        els.book.value = first;
      }
    }
    currentChapterNum = 3;
    if (els.chapter.querySelector(`option[value="3"]`)) els.chapter.value = "3";
    else currentChapterNum = parseInt(els.chapter.value, 10) || 1;
    await loadPassage();
    scheduleSyncPageLanguageToPrimaryBible(m);
    renderVotd();
    updateBibleHelpHints();
  } catch (e) {
    setStatus(getUiBundle(null).fmtLoadError(dataBase, e.message), true);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener(BIBLEAPP_TRANSLATE_READY, () => {
    if (currentMeta) {
      scheduleSyncPageLanguageToPrimaryBible(/** @type {any} */ (currentMeta));
    }
  });
}
void init();
initGoogleTranslate();
