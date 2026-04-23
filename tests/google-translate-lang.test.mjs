import { describe, it, expect } from "vitest";
import { inferGoogleLangForPrimaryBible } from "../src/google-translate.mjs";
import { getPrimaryBibleUiHintText, getVotdPoolHintText } from "../src/translation-hint-i18n.mjs";

describe("inferGoogleLangForPrimaryBible", () => {
  it("maps known package ids to Google language codes", () => {
    expect(inferGoogleLangForPrimaryBible({ id: "synodal" })).toBe("ru");
    expect(inferGoogleLangForPrimaryBible({ id: "cuv" })).toBe("zh-CN");
    expect(inferGoogleLangForPrimaryBible({ id: "almeida" })).toBe("pt");
  });

  it("falls back to English for unknown", () => {
    expect(inferGoogleLangForPrimaryBible({ id: "kjv" })).toBe("en");
  });
});

describe("getPrimaryBibleUiHintText", () => {
  it("returns a Russian hint for Synodal (primary Bible)", () => {
    const t = getPrimaryBibleUiHintText({ id: "synodal" });
    expect(t).toMatch(/[А-Яа-яЁё]/u);
  });

  it("returns an English hint for an English-typical id", () => {
    const t = getPrimaryBibleUiHintText({ id: "kjv" });
    expect(t).toContain("The page language");
  });
});

describe("getVotdPoolHintText", () => {
  it("returns Russian for Synodal", () => {
    const t = getVotdPoolHintText({ id: "synodal" });
    expect(t).toMatch(/[А-Яа-яЁё]/u);
  });

  it("returns English for KJV", () => {
    const t = getVotdPoolHintText({ id: "kjv" });
    expect(t).toMatch(/verses|verse|pool|well-known/i);
  });
});
