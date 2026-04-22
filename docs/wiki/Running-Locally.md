# Running locally

The app uses ES modules and `fetch()`. Use **http://** or **https://**, not `file://`.

## Vite (recommended)

```bash
npm run dev
```

Vite serves `public/` at the site root, so Bible data is at `/bible-data/…`.

## Python `http.server`

Run from the **project root** (folder with `index.html` and `public/`):

```bash
cd path/to/project
python -m http.server 8765
```

Then open `http://127.0.0.1:8765/`.

With Python’s default handler, `public/` is **not** mounted at `/`; files appear under `/public/`. The app probes multiple bases until `manifest.json` loads:

1. `/bible-data/` — Vite and typical static deploys.
2. `/public/bible-data/` — Python from project root.
3. `public/bible-data/` relative to the current page URL — when the app is under a subpath.

## If the page fails

- Serve from the correct folder so `/` returns `index.html`.
- Confirm `public/bible-data/manifest.json` exists after `npm run build:bible`.
- DevTools → Network: `manifest.json` should return **200**.

## Why `python -m http.server` sometimes “does not load”

1. **Wrong folder** — document root must be the project root that contains `index.html`.
2. **`public/` vs Vite** — paths differ; the app tries both common layouts.
3. **Missing data** — run `npm run build:bible`.
4. **`file://`** — modules and `fetch` often break; use a local HTTP server.
