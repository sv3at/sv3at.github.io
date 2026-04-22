# Architecture and handoff

Snapshot of how the app works today and what to preserve when changing code.

## Current product state

- Offline-first reader; data under `public/bible-data/`.
- KJV has per-word Strong’s (`{ p, s }` verse cells); other translations use plain string verses.
- Strong’s chips: local gloss dialog + STEP links.
- Parallel reading: two translations on one page.
- Parallel Psalms: Synodal vs MT/English chapter mapping when `PSA` is open.
- Verse highlight mirrors across columns; word highlight is **single-side only**.
- Verse auto-scroll runs only when verse focus is intentionally set (not on word click).

## Key files

| Path | Role |
|------|------|
| `index.html` | Shell, toolbar, parallel containers |
| `src/main.js` | State, fetch, render, parallel mode, Psalm mapping, selection |
| `src/style.css` | Layout, parallel mode, highlights |
| `src/verse-model.mjs` | Pure helpers (used by app + tests) |
| `scripts/build-bible-data.mjs` | Build translations + lexicon |
| `scripts/kjv-strongs.mjs` | Bolls `<S>…</S>` parsing |
| `scripts/strong-lexicon-vm.mjs` | VM dictionary loader |
| `scripts/usfm-books.mjs` | USFM list and Bolls book map |
| `public/bible-data/` | Generated runtime bundle |
| `tests/*.test.mjs` | Vitest |

## Commands

```bash
npm install
npm test
npm run build:bible
npm run dev
npm run build && npm run preview
```

## Behavior contracts

1. No runtime Bible API; content is local JSON.
2. Do not assume every verse is a string (KJV uses `{ p, s }`). Use `versePlain` / `isStrongsVerseCell` from `verse-model.mjs`.
3. Keep `resolveDataBase()` probing `/bible-data/`, `/public/bible-data/`, and URL-relative `public/bible-data/`.
4. Parallel mode: compare UI disabled when off; `.passage.parallel-enabled` for side-by-side + horizontal scroll on small screens.
5. Selection: mirrored verses; words local per side; controlled verse scroll flag.
6. Psalm mapping only in parallel mode for `PSA` between synodal and non-synodal sides.

## Tests

| File | Guards |
|------|--------|
| `tests/kjv-strongs.test.mjs` | Strong’s parsing |
| `tests/verse-model.test.mjs` | Helpers |
| `tests/strong-lexicon-vm.test.mjs` | VM loader |
| `tests/usfm-books.test.mjs` | Canon map |
| `tests/manifest-shape.test.mjs` | Manifest schema; optional bundle checks |

Tests pass without `public/bible-data`; bundle checks skip if missing.

## Prompts for agents

- Bugfix: cite symptom, files, run `npm test`.
- Feature: preserve offline model and KJV `{p,s}`.
- Data: edit `build-bible-data.mjs`, run `build:bible`, update wiki pages.
- UI: `index.html` + `style.css` + `main.js` together for layout regressions.

## Backlog

- E2E (Playwright) for parallel + Psalms + selection.
- Optional “clear highlights”.
- Optional JSON schema check for custom translations.

## Attribution

- KJV: PD text; Strong’s tags from Bolls export.
- Lexicon: Open Scriptures Strong’s dictionaries (CC BY-SA).
