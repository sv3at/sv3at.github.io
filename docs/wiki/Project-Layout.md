# Project layout

| Path | Purpose |
|------|---------|
| `index.html` | Shell + toolbar |
| `src/main.js` | UI, navigation, parallel reading, data loading |
| `src/style.css` | Layout and typography |
| `src/verse-model.mjs` | Pure verse / Strong’s helpers (shared with tests) |
| `tests/*.test.mjs` | Vitest (`npm test`) |
| `public/bible-data/` | Generated bundle — regenerate with `npm run build:bible` |
| `scripts/build-bible-data.mjs` | Download + normalize translations + lexicon |
| `scripts/kjv-strongs.mjs` | Bolls KJV → plain text + Strong’s segments |
| `scripts/usfm-books.mjs` | USFM order and Bolls book number map |
| `scripts/votd-500-picks.mjs` | 500-verse VOTD layout; edit, then `npm run build-votd` |
| `scripts/build-votd-500.mjs` | Validate picks vs `t-kjv.json` → `src/votd-500.json` |
| `scripts/gen-picks-layout.mjs` | Optional: regenerate `votd-500-picks` from KJV |
| `src/votd-500.json` | 500 `{id,c,v}` for “Verse of the day” (committed; source for regen) |
| `src/verse-of-day-refs.mjs` | Imports pool + VOTD session + random index helpers |
| `scripts/strong-lexicon-vm.mjs` | VM loader for Open Scriptures dictionary scripts |
| `.github/workflows/deploy-pages.yml` | GitHub Pages deploy (optional) |
| `docs/wiki/` | Detailed documentation (this wiki mirror) |
