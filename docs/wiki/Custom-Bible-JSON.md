# Custom Bible versions (JSON)

Add your own translation files without changing app code.

## 1) Add your JSON file

Place your translation JSON in:

- `public/bible-data/t-yourid.json`

Example:

- `public/bible-data/t-myversion.json`

## 2) Required JSON shape

```json
{
  "bookOrder": ["GEN", "EXO", "LEV"],
  "books": {
    "GEN": {
      "n": "Genesis",
      "ch": [
        null,
        ["In the beginning...", "..."],
        ["Thus the heavens...", "..."]
      ]
    }
  },
  "_meta": {
    "name": "My Version",
    "language": "English",
    "license": "Your license",
    "source": "Your source"
  }
}
```

Notes:

- `bookOrder`: USFM book ids in display order.
- `books[USFM].n`: display name.
- `books[USFM].ch`: chapters; index `1` is chapter 1 (`ch[0]` is `null`).
- Each chapter is an array of verse strings; index `0` is verse 1.
- `_meta` is optional but recommended (footer).

## 3) Register in `manifest.json`

```json
{
  "id": "myversion",
  "name": "My Version",
  "language": "English",
  "license": "Your license",
  "dataFile": "t-myversion.json",
  "source": "Your source"
}
```

Reload the app.

## 4) USFM book IDs

Examples: `GEN`, `EXO`, … `PSA`, … `MAT`, `MRK`, … `REV`. You may use a subset (e.g. NT only).

## 5) Optional: Strong’s verse objects

```json
{
  "p": "In the beginning God created the heaven and the earth.",
  "s": [
    { "w": "In the beginning", "n": "H7225" },
    { "w": "God", "n": "H430" },
    { "w": "the heaven", "ns": ["H853", "H8064"] }
  ]
}
```

## 6) Common mistakes

- Invalid JSON (trailing commas, comments)
- Wrong `dataFile` in `manifest.json`
- Missing `bookOrder`
- Non-USFM book ids
- Chapter arrays not 1-indexed
- One big string per chapter instead of verse arrays
