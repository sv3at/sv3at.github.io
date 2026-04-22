# Wiki home (mirror)

This folder is a **mirror** of what you can publish as the GitHub **Wiki** for this repository. GitHub Wikis are a separate git repo; keeping `docs/wiki/` in the main repo lets you version docs, review in PRs, and copy pages into the wiki when you want.

## Pages

| Topic | File |
|------|------|
| Quick start | [Quick-Start.md](Quick-Start.md) |
| Running locally (Vite, Python, paths) | [Running-Locally.md](Running-Locally.md) |
| Project layout | [Project-Layout.md](Project-Layout.md) |
| Translations and data sources | [Translations-and-Sources.md](Translations-and-Sources.md) |
| KJV Strong’s and lexicon | [Strong-KJV-and-Lexicon.md](Strong-KJV-and-Lexicon.md) |
| Rebuilding data | [Rebuilding-Data.md](Rebuilding-Data.md) |
| Troubleshooting | [Troubleshooting.md](Troubleshooting.md) |
| GitHub Pages deploy | [GitHub-Pages.md](GitHub-Pages.md) |
| Licenses | [Licenses.md](Licenses.md) |
| Custom translation JSON | [Custom-Bible-JSON.md](Custom-Bible-JSON.md) |
| Fork + Cursor workflow | [Development-Fork-and-Cursor.md](Development-Fork-and-Cursor.md) |
| Architecture and handoff | [Architecture-and-Handoff.md](Architecture-and-Handoff.md) |

## Publish these files to GitHub Wiki

1. On GitHub: **Wiki** → create the wiki if it does not exist (creates the wiki git repo).
2. Clone the wiki (replace owner/repo):

   ```bash
   git clone https://github.com/<owner>/<repo>.wiki.git
   cd <repo>.wiki
   ```

3. Copy markdown from this repo’s `docs/wiki/` into the wiki clone (same filenames work as page titles, e.g. `Home.md` → **Home** page).

4. Commit and push:

   ```bash
   git add .
   git commit -m "Import wiki from docs/wiki mirror"
   git push
   ```

You can repeat step 3 whenever you update docs in the main repo.
