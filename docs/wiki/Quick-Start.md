# Quick start

From the **project root** (where `package.json` lives):

```bash
npm install
npm run build:bible
npm run dev
```

- `build:bible` downloads upstream sources and writes `public/bible-data/` (large; needs network).
- `dev` starts Vite. Open the printed URL.

Optional checks:

```bash
npm test
npm run build
npm run preview
```

If the app shows “Could not load Bible data”, run `build:bible` and confirm `public/bible-data/manifest.json` exists.
