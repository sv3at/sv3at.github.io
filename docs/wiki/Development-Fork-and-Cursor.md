# Fork and continue in Cursor

## Fork on GitHub

1. Open the repository on GitHub.
2. **Fork** to your account or org.

CLI option:

```bash
gh repo fork <owner>/<repo> --clone
```

## Clone your fork

```bash
git clone https://github.com/<you>/<your-fork>.git
cd <your-fork>
```

Optional upstream:

```bash
git remote add upstream https://github.com/<owner>/<repo>.git
git fetch upstream
```

## Open in Cursor

**File → Open Folder…** → select the cloned repo.

## Install and verify

```bash
npm install
npm test
npm run build:bible
npm run dev
```

## Read next

- [Home](Home.md) — wiki index and publish steps
- [Architecture and handoff](Architecture-and-Handoff.md) — behavior contracts and file map
- [Running locally](Running-Locally.md)

## Workflow

```bash
git checkout -b feat/<short-name>
# edit
npm test
npm run build
# if data pipeline changed:
npm run build:bible
git add .
git commit -m "Describe change"
git push -u origin HEAD
gh pr create
```

## Cursor agent prompt template

> Implement [feature/bugfix]. Follow [Architecture and handoff](Architecture-and-Handoff.md). Touch only required files; run `npm test` and `npm run build`.

## Sync fork (optional)

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Common issues

- Blank app: run `npm run build:bible`.
- Wrong cwd: run commands from repo root (`package.json` here).
- Python vs Vite paths: see [Running locally](Running-Locally.md).
