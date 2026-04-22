# Rebuilding data

```bash
npm run build:bible
```

Fetches from Bolls, GitHub raw (open-bibles, thiagobodruk, openscriptures/strongs), and rewrites `public/bible-data/`. Respect upstream rate limits.

Output includes:

- `manifest.json`
- `t-*.json` per translation
- `lexicon-slim.json` (Strong’s glosses)
