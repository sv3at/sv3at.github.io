# Verse of the day (VOTD) — 500-verse pool

The header card **“Verse of the day”** shows a single verse from a fixed list of **500** well-known, single-verse references, spread across all **66** books of a typical Protestant canon. The list is **not** fetched at runtime; it is bundled as JSON and validated against the KJV data file when (re)built.

## What the user sees

- **One verse per browser tab session** (via `sessionStorage`): reloading the page in the same tab keeps the **same** verse; closing the tab starts a new session and a new random index.
- A **round refresh control** (circular arrows, no label) under the verse picks another random line from the same 500 and updates the session index. Its `title` / `aria-label` come from **`votdRefreshLabel`** in `ui-i18n.mjs` (primary-Bible language).
- The **`(i)`** next to the VOTD title uses the same **visual pattern** as the `(i)` next to **Translation** (`.ui-hint-btn`). Its `title` / `aria-label` follow **`getVotdPoolHintText`**, and clicking it can post the same text to the status line. Default English text is also set in `index.html` for before/without JS.
- “Open in reader” jumps the main view to that reference.

`getDailyVotdIndex()` in `src/verse-of-day-refs.mjs` is **only** for **tests** (deterministic per calendar day). The app UI uses the **session** index, not the day-of-year index.

## 500 = coverage rule

- **38 books** (`GEN` through `ZEC` in USFM order, see `USFM_LIST` in `scripts/usfm-books.mjs`): **8** distinct `(chapter, verse)` pairs per book.  
- **28 books** (`MAL` through `REV`): **7** pairs per book.  
- \(8 \times 38 + 7 \times 28 = 500\).

The **layout** (which chapter/verse per slot) is generated to spread across chapters; you can hand-edit `scripts/votd-500-picks.mjs` to swap in more “famous” lines, then re-run the build. Book IDs use bundled data keys (**Ezekiel = `EZK`**, not `EZE`).

## Source files (authoritative)

| Path | Role |
|------|------|
| `src/votd-500.json` | **500** objects `{ "id", "c", "v" }` in canonical order. **Do not** edit by hand unless you re-validate. |
| `src/verse-of-day-refs.mjs` | Imports the JSON, exports `FAMOUS_VERSE_REFS`, `VOTD_SESSION_KEY`, `getSessionVotdIndex`, `setSessionVotdIndex`, `getDailyVotdIndex` (tests), `pickRandomVotdIndex`. |
| `scripts/votd-500-picks.mjs` | Human/editor-facing **string maps**: `EIGHT_BY_BOOK` (38 books) and `SEVEN_BY_BOOK` (28 books), each value like `"1-1;2-1;3-1;…"`. |
| `scripts/build-votd-500.mjs` | Reads picks + `public/bible-data/t-kjv.json`, checks every verse exists, enforces 500 entries, writes `src/votd-500.json`. |
| `scripts/gen-picks-layout.mjs` | **Optional** one-off: prints new `EIGHT_BY_BOOK` / `SEVEN_BY_BOOK` object text from KJV (spread layout). Pipe or paste into `votd-500-picks.mjs`, then add the file header. |
| `scripts/usfm-books.mjs` | `USFM_LIST` — same order as the build walks when flattening to 500 rows. |
| `src/translation-hint-i18n.mjs` | `getVotdPoolHintText(meta)` (parallel to `getPrimaryBibleUiHintText`). |
| `src/main.js` | `updateBibleHelpHints()` updates Translation + VOTD `(i)`; VOTD click can mirror full text in the status line. |
| `index.html` | `#votd-hint-btn`, `#votd-refresh` (round refresh), `.votd-actions`, `.votd-refresh-wrap`. |

## Rebuilding `votd-500.json`

1. You need a valid **`t-kjv.json`** (e.g. after `npm run build:bible` or with your own checked-in bundle).
2. **After changing** `scripts/votd-500-picks.mjs`:
   ```bash
   npm run build-votd
   ```
3. This runs `node scripts/build-votd-500.mjs`. If a reference is out of range for KJV, the script throws and does not overwrite the JSON.
4. Regenerate the **picks** layout from scratch (optional):
   ```bash
   node scripts/gen-picks-layout.mjs
   ```
   Save output into `votd-500-picks.mjs` (keep the comment header at the top), then `npm run build-votd` again.

`package.json` defines `"build-votd": "node scripts/build-votd-500.mjs"`. It is **independent** of `npm run build` (Vite), but the app will break at runtime if `src/votd-500.json` is missing while `verse-of-day-refs.mjs` imports it—**commit** the JSON, or add the build to your release checklist.

## Tests

- `tests/verse-of-day-refs.test.mjs`: pool length **500**; `getSessionVotdIndex` / `VOTD_SESSION_KEY`; `getDailyVotdIndex` in range; `pickRandomVotdIndex`.
- `tests/google-translate-lang.test.mjs`: `getVotdPoolHintText` (with `getPrimaryBibleUiHintText`) for at least Synodal (Cyrillic) and KJV (English).

## See also

- [Rebuilding-Data.md](Rebuilding-Data.md) — `npm run build:bible` (translations + KJV for validation).
- [Project-Layout.md](Project-Layout.md) — paths at a glance.
