# GitHub Pages (user/org root site)

This app uses root paths like `/bible-data/…`, which fits a **user or organization** GitHub Pages site (`https://<username>.github.io/`).

## Requirements

1. Repository name is exactly `<username>.github.io` (or org equivalent).
2. Commit generated `public/bible-data/*` (run `npm run build:bible` locally when data changes).

## Workflow

The repo includes `.github/workflows/deploy-pages.yml`:

- Runs on push to `main` (and manual dispatch).
- `npm ci`, `npm test`, `npm run build`, then deploys `dist/`.

## GitHub setup

1. **Settings → Pages**
2. **Build and deployment → Source: GitHub Actions**
3. Push to `main` and wait for the workflow.

Site URL: `https://<username>.github.io/`
