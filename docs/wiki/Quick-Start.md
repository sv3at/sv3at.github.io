# Quick start

From the **project root** (where `package.json` lives):

```bash
npm install
npm run build:bible
npm run dev
```

- `build:bible` downloads upstream sources and writes `public/bible-data/` (large; needs network).
- `dev` starts Vite. Open the printed URL.
- The **500-verse** “Verse of the day” data (`src/votd-500.json`) is **committed** with the repo. Run `npm run build-votd` only if you **edit** `scripts/votd-500-picks.mjs` (see [Verse-of-the-Day-Pool.md](Verse-of-the-Day-Pool.md)).

Optional checks:

```bash
npm test
npm run build
npm run preview
```

If the app shows “Could not load Bible data”, run `build:bible` and confirm `public/bible-data/manifest.json` exists.
