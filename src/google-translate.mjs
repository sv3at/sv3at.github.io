/**
 * Google Website Translator: loads the widget, maps the primary (first) Bible
 * to a page UI language, and can sync the translate dropdown to match.
 */
const INCLUDED_LANGUAGES =
  "en,de,es,fr,it,pt,br,ru,uk,pl,cs,ro,el,he,ar,fa,hi,th,ja,ko,vi,id,tr,nl,sv,da,fi,nb,zh-CN,zh-TW";

const ID_TO_GOOGLE = {
  synodal: "ru",
  cuv: "zh-CN",
  almeida: "pt",
  rccv: "ro",
  bkr: "cs",
};

/**
 * @param {{ id?: string, language?: string } | null | undefined} meta
 * @returns {string} BCP-47 / Google code (e.g. en, ru, zh-CN)
 */
export function inferGoogleLangForPrimaryBible(meta) {
  if (!meta) return "en";
  const fromId = ID_TO_GOOGLE[meta.id];
  if (fromId) return fromId;
  const l = (meta.language || "").toLowerCase();
  if (l.includes("russian") || l.includes("рус")) return "ru";
  if (l.includes("chinese (traditional") || l.includes("繁")) return "zh-TW";
  if (l.includes("chinese") || l.includes("mandarin") || l.includes("union") || l.includes("中文")) return "zh-CN";
  if (l.includes("portug") || l.includes("brazil")) return "pt";
  if (l.includes("romanian") || (l.includes("rom") && l.includes("anian"))) return "ro";
  if (l.includes("czech") || l.includes("čes") || l.includes("cesk")) return "cs";
  if (l.includes("german") || l.includes("deutsch")) return "de";
  if (l.includes("spanish") || l.includes("español") || l.includes("castell")) return "es";
  if (l.includes("french") || l.includes("français") || l.includes("fran")) return "fr";
  if (l.includes("korean") || l.includes("hangul") || l.includes("한")) return "ko";
  if (l.includes("japanese") || l.includes("日本")) return "ja";
  if (l.includes("italian") || l.includes("italia")) return "it";
  if (l.includes("dutch") || l.includes("nederlands")) return "nl";
  if (l.includes("swedish") || l.includes("svensk")) return "sv";
  if (l.includes("greek") || l.includes("ελ")) return "el";
  if (l.includes("hungarian") || l.includes("magyar")) return "hu";
  if (l.includes("polish") || l.includes("polsk")) return "pl";
  if (l.includes("ukrainian") || l.includes("україн")) return "uk";
  if (l.includes("english") || l.includes("eng ")) return "en";
  return "en";
}

let started = false;
let lastScheduledMeta = null;
let scheduleTimer = null;
let scheduleTries = 0;

/** Dispatched when the Google translate language control is ready. */
export const BIBLEAPP_TRANSLATE_READY = "bibleapp-translateready";
const READY_EVENT = BIBLEAPP_TRANSLATE_READY;

function getGoogTeCombo() {
  return document.querySelector("#google_translate_element .goog-te-combo") || document.querySelector(".goog-te-combo");
}

/** @param {string} val */
function valueTailSeg(val) {
  const s = (val || "").toLowerCase();
  const segs = s.split(/[\\/|]/).filter(Boolean);
  return (segs[segs.length - 1] || "") || s;
}

/**
 * Picks a combo option. Google often uses values like `/en/ru` (en source → target ru).
 * @param {HTMLSelectElement} select
 * @param {string} code
 * @returns {number} index, or -1
 */
function findOptionIndexForTarget(select, code) {
  const c = (code || "en").toLowerCase();
  if (c === "en") {
    for (let i = 0; i < select.options.length; i++) {
      if ((select.options[i].value || "").trim() === "") return i;
    }
    return 0;
  }
  for (let i = 0; i < select.options.length; i++) {
    const val = (select.options[i].value || "").toLowerCase();
    const t = (select.options[i].text || "").toLowerCase();
    if (!val) continue;
    if (c === "zh-cn" && (val.includes("zh-cn") || (t.includes("simplified") && t.includes("chinese")))) return i;
    if (c === "zh-tw" && (val.includes("zh-tw") || (t.includes("traditional") && t.includes("chinese")))) return i;
  }
  for (let i = 0; i < select.options.length; i++) {
    const val = (select.options[i].value || "").toLowerCase();
    if (!val) continue;
    const last = valueTailSeg(val);
    if (last === c) return i;
    if (c === "pt" && (last === "pt" || last === "pt-br" || val.includes("pt-"))) return i;
  }
  for (let i = 0; i < select.options.length; i++) {
    const val = (select.options[i].value || "").toLowerCase();
    if (!val) continue;
    if (val.includes("/" + c + "/") || val.includes("/" + c + "|") || val.endsWith("/" + c) || val.includes("|" + c + "|") || val.endsWith("|" + c)) {
      return i;
    }
  }
  for (let i = 0; i < select.options.length; i++) {
    const v = (select.options[i].value || "").toLowerCase();
    if (v && v.includes(c) && c.length > 1) return i;
  }
  return -1;
}

/**
 * @param {{ id?: string, language?: string } | null} meta
 * @returns {boolean}
 */
export function applySyncPageLanguageToPrimaryBible(meta) {
  const code = inferGoogleLangForPrimaryBible(meta);
  const sel = getGoogTeCombo();
  if (!sel || !sel.options || sel.options.length === 0) return false;
  const idx = findOptionIndexForTarget(sel, code);
  if (idx < 0) return false;
  if (sel.selectedIndex === idx) {
    return true;
  }
  sel.selectedIndex = idx;
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

/**
 * Retries until the translate combo is present (script loads asynchronosly)
 * and applies the language for the current primary Bible.
 * @param {{ id?: string, language?: string } | null} meta
 */
export function scheduleSyncPageLanguageToPrimaryBible(meta) {
  if (typeof document === "undefined" || !meta) return;
  lastScheduledMeta = meta;
  scheduleTries = 0;
  if (scheduleTimer) {
    clearInterval(/** @type {any} */ (scheduleTimer));
    scheduleTimer = null;
  }
  const tick = () => {
    if (lastScheduledMeta !== meta) return;
    scheduleTries += 1;
    if (applySyncPageLanguageToPrimaryBible(meta) || scheduleTries > 80) {
      if (scheduleTimer) {
        clearInterval(/** @type {any} */ (scheduleTimer));
        scheduleTimer = null;
      }
    }
  };
  tick();
  /** @type {any} */ (scheduleTimer) = setInterval(tick, 100);
}

export function initGoogleTranslate() {
  if (typeof window === "undefined" || !document.getElementById("google_translate_element") || started) {
    return;
  }
  started = true;
  window.googleTranslateElementInit = function googleTranslateElementInit() {
    const g = window.google;
    if (!g?.translate?.TranslateElement) {
      window.dispatchEvent(new Event(READY_EVENT));
      return;
    }
    const L = g.translate.TranslateElement;
    const opt = {
      pageLanguage: "en",
      includedLanguages: INCLUDED_LANGUAGES,
      autoDisplay: false,
    };
    if (L.InlineLayout != null) opt.layout = L.InlineLayout.SIMPLE;
    // eslint-disable-next-line new-cap
    new L(opt, "google_translate_element");
    let didSignal = false;
    const signalReady = () => {
      if (!getGoogTeCombo()?.options?.length) return;
      if (lastScheduledMeta) applySyncPageLanguageToPrimaryBible(/** @type {any} */ (lastScheduledMeta));
      if (!didSignal) {
        didSignal = true;
        window.dispatchEvent(new Event(READY_EVENT));
      }
    };
    for (const ms of [0, 100, 300, 800, 1500, 3000]) {
      setTimeout(signalReady, ms);
    }
  };
  const s = document.createElement("script");
  s.defer = true;
  s.onerror = () => window.dispatchEvent(new Event(READY_EVENT));
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.head.appendChild(s);
}
