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
| `scripts/strong-lexicon-vm.mjs` | VM loader for Open Scriptures dictionary scripts |
| `.github/workflows/deploy-pages.yml` | GitHub Pages deploy (optional) |
| `docs/wiki/` | Detailed documentation (this wiki mirror) |
