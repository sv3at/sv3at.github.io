# Translations and data sources

Each `id` matches `manifest.json` (legacy bible-api ids where applicable).

| `id` | Description (short) | Primary source |
|------|---------------------|----------------|
| `kjv` | King James Version with Strong’s (`{ p, s }` verse cells) | Bolls `KJV.json`; lexicon from Open Scriptures |
| `web` | World English Bible | Bolls `WEB.json` |
| `ylt` | Young's Literal Translation | Bolls `YLT.json` |
| `asv` | American Standard Version 1901 | Bolls `ASV.json` |
| `cuv` | Chinese Union (和合本) | Bolls `CUV.json` |
| `dra` | Douay-Rheims (American edition) | Bolls `DRB.json` (id `dra`) |
| `darby` | Darby Bible (English) | seven1m/open-bibles `eng-darby.zefania.xml` |
| `bbe` | Bible in Basic English | thiagobodruk `en_bbe.json` |
| `bkr` | Bible kralická (Czech) | seven1m/open-bibles `cze-bkr.zefania.xml` |
| `clementine` | Latin Vulgate (Clementine) | Bolls `VULG.json` |
| `almeida` | Portuguese Almeida family text | thiagobodruk `pt_aa.json` |
| `rccv` | Romanian Cornilescu line | thiagobodruk `ro_cornilescu.json` |
| `synodal` | Russian Synodal | Bolls `SYNOD.json` |
| `cherokee` | Cherokee New Testament only | seven1m/open-bibles `chr-cherokee.usfx.xml` |
| `webbe` | World English Bible, British edition | seven1m/open-bibles `eng-gb-webbe.usfx.xml` |
| `oeb-us` | Label: Open English Bible (US) | Same text as `web` (see OEB note) |
| `oeb-cw` | Label: Open English Bible (Commonwealth) | Same text as `web` (see OEB note) |

## Open English Bible (`oeb-us` / `oeb-cw`)

The single-file Open English OSIS in [seven1m/open-bibles](https://github.com/seven1m/open-bibles) is not a practical full 66-book one-file import for this app. The build reuses Bolls **WEB** for both `t-oeb-us.json` and `t-oeb-cw.json`. Replace those files if you obtain a full OEB export in the same JSON shape.

## `rccv` note

Uses thiagobodruk `ro_cornilescu`; wording may differ from other “RCCV” editions.

## `cherokee`

USFX is NT-only; `bookOrder` reflects available books.

## `bbe` (Bible in Basic English)

thiagobodruk marks BBE under **CC BY-NC**; verify redistribution terms.
