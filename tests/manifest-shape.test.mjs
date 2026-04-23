import { describe, it, expect } from "vitest";
import { readFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { constants as fsConstants } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "public", "bible-data", "manifest.json");
const kjvPath = join(root, "public", "bible-data", "t-kjv.json");

async function fileExists(p) {
  try {
    await access(p, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

const hasGeneratedBundle = await fileExists(manifestPath);

/** @param {unknown} m */
function validateManifestShape(m) {
  const errors = [];
  if (!m || typeof m !== "object") errors.push("manifest must be an object");
  else {
    if (m.version !== 1) errors.push("manifest.version should be 1");
    if (!Array.isArray(m.translations)) errors.push("manifest.translations must be an array");
    else {
      for (const t of m.translations) {
        if (!t || typeof t !== "object") {
          errors.push("each translation must be an object");
          continue;
        }
        if (typeof t.id !== "string" || !t.id) errors.push("translation.id required");
        if (typeof t.dataFile !== "string" || !t.dataFile) errors.push(`translation.dataFile required (${t.id})`);
      }
    }
    if ("lexiconFile" in m && m.lexiconFile != null && typeof m.lexiconFile !== "string") {
      errors.push("lexiconFile must be a string when set");
    }
  }
  return errors;
}

describe("manifest schema (static expectations)", () => {
  it("validator accepts a minimal valid manifest", () => {
    const m = {
      version: 1,
      translations: [{ id: "kjv", name: "KJV", language: "en", license: "PD", dataFile: "t-kjv.json" }],
      lexiconFile: "lexicon-full.json",
    };
    expect(validateManifestShape(m)).toEqual([]);
  });

  it("validator rejects bad rows", () => {
    expect(validateManifestShape({ version: 1, translations: [{}] }).length).toBeGreaterThan(0);
    expect(validateManifestShape(null).length).toBeGreaterThan(0);
  });
});

describe.skipIf(!hasGeneratedBundle)("generated public/bible-data (after npm run build:bible)", () => {
  it("manifest.json is well-formed and lists KJV with Strong features", async () => {
    const m = JSON.parse(await readFile(manifestPath, "utf8"));
    expect(validateManifestShape(m)).toEqual([]);
    const kjv = m.translations.find((t) => t.id === "kjv");
    expect(kjv, "kjv entry").toBeTruthy();
    expect(kjv.features).toContain("strongs");
    expect(m.lexiconFile).toBe("lexicon-full.json");
  });

  it("t-kjv.json has _strongs and object verse cells in Genesis 1", async () => {
    const data = JSON.parse(await readFile(kjvPath, "utf8"));
    expect(data._strongs).toBe(true);
    const v1 = data.books.GEN.ch[1][0];
    expect(v1).toBeTruthy();
    expect(typeof v1.p).toBe("string");
    expect(Array.isArray(v1.s)).toBe(true);
    expect(v1.s.some((x) => x.n === "H430" || (x.ns && x.ns.includes("H430")))).toBe(true);
  });
});
