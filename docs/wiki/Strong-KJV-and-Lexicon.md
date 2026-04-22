# KJV Strong’s and lexicon

## Verse shape

KJV verses are objects:

```json
{
  "p": "Plain English text",
  "s": [
    { "w": "In the beginning", "n": "H7225" },
    { "w": "the heaven", "ns": ["H853", "H8064"] }
  ]
}
```

Other translations use **plain string** verses.

## In the app

- Strong’s ids link to STEP Bible (`?q=strong=H430` / `G2316`).
- Plain click opens a short local gloss from `lexicon-slim.json`.
- Ctrl/Cmd-click (or open in new tab) goes to STEP without the dialog.

## Rebuild

```bash
npm run build:bible
```

Lexicon is built from Open Scriptures Strong’s Hebrew/Greek dictionary scripts (**CC BY-SA**). Attribute as required when redistributing.
