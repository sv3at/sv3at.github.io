# Rebuilding data

```bash
npm run build:bible
```

Fetches from Bolls, GitHub raw (open-bibles, thiagobodruk, openscriptures/strongs), and rewrites `public/bible-data/`. Respect upstream rate limits.

Output includes:

- `manifest.json`
- `t-*.json` per translation
- `lexicon-slim.json` (Strong’s glosses)

## Verse-of-the-day JSON (`votd-500.json`)

The **“Verse of the day”** 500-verse list is **not** produced by `build:bible`. It is built from `scripts/votd-500-picks.mjs` and validated against **`t-kjv.json`** (so you need a KJV in the tree first):

```bash
npm run build-votd
```

Full workflow and file list: [Verse-of-the-Day-Pool.md](Verse-of-the-Day-Pool.md).
