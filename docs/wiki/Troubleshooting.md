# Troubleshooting

| Symptom | Things to check |
|---------|------------------|
| Blank or “Could not load Bible data” | Run `npm run build:bible`; confirm `public/bible-data/manifest.json` exists. |
| 404 on `manifest.json` | Server cwd: project root for Python, or use Vite. |
| MIME / module errors | You are on `file://` — use `http://localhost…`. |
| Russian or other language empty | Rebuild; confirm `t-synodal.json` (etc.) is non-zero size. |
| Parallel Psalms mismatch | Synodal vs English chapter numbering is adjusted in parallel mode; see Architecture doc. |
