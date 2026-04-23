import { describe, it, expect } from "vitest";
import { getPrimaryBibleUiHintText, getVotdPoolHintText } from "../src/translation-hint-i18n.mjs";

describe("getVotdPoolHintText", () => {
  it("returns non-empty English for null or undefined primary Bible", () => {
    expect(getVotdPoolHintText(null).length).toBeGreaterThan(20);
    expect(getVotdPoolHintText(undefined).length).toBeGreaterThan(20);
  });

  it("matches en string for KJV", () => {
    const t = getVotdPoolHintText({ id: "kjv" });
    expect(t).toMatch(/verso|verses|well-known|refresh|pool|large|round/i);
  });
});

describe("getPrimaryBibleUiHintText", () => {
  it("returns English for null", () => {
    const t = getPrimaryBibleUiHintText(null);
    expect(t).toContain("The page language");
  });
});
