import { describe, it, expect } from "vitest";
import { getUiBundle, applyAppChromeI18n } from "../src/ui-i18n.mjs";

describe("getUiBundle", () => {
  it("uses Russian chrome for Russian Synodal", () => {
    const u = getUiBundle({ id: "synodal" });
    expect(u.appTitle).toBe("Простой ридер Библии");
    expect(u.book).toBe("Книга");
    expect(u.htmlLang).toBe("ru");
  });

  it("uses English chrome for KJV", () => {
    const u = getUiBundle({ id: "kjv" });
    expect(u.appTitle).toBe("Simple Bible Reader");
    expect(u.book).toBe("Book");
  });

  it("provides load error formatter", () => {
    const u = getUiBundle(null);
    const s = u.fmtLoadError("/bible-data/", "404");
    expect(s).toContain("/bible-data/");
    expect(s).toContain("404");
  });
});

describe("applyAppChromeI18n", () => {
  it("is a no-op in Node (no document)", () => {
    expect(() => applyAppChromeI18n({ id: "kjv" })).not.toThrow();
  });
});
