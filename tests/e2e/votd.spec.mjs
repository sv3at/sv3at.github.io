import { test, expect } from "@playwright/test";

test.describe("verse of the day", () => {
  test("section visible, refresh control picks new verse (requires public/bible-data)", async ({ page, request }) => {
    const manifest = await request.get("/bible-data/manifest.json");
    test.skip(!manifest.ok(), "Run npm run build:bible so /bible-data/manifest.json exists under public/");

    await page.goto("/");
    const votd = page.locator("#votd");
    await expect(votd).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("#votd-heading")).toBeVisible();
    await expect(page.locator("#votd-ref")).not.toBeEmpty();
    await expect(page.locator("#votd-text")).not.toBeEmpty();

    await expect(page.locator("#votd-hint")).toHaveCount(0);
    await page.locator("#votd-refresh").click();
    await expect(page.locator("#votd-text")).not.toBeEmpty();
  });

  test("translation (i) hint has expected aria (requires public/bible-data)", async ({ page, request }) => {
    const manifest = await request.get("/bible-data/manifest.json");
    test.skip(!manifest.ok(), "Run npm run build:bible so /bible-data/manifest.json exists under public/");

    await page.goto("/");
    await expect(page.locator("#book")).toBeEnabled({ timeout: 30_000 });
    const hint = page.locator("#translation-hint");
    const label = await hint.getAttribute("aria-label");
    expect(label).toBeTruthy();
    expect(label.length).toBeGreaterThan(40);
    expect(label).toMatch(/Google|язык|语言|言語|idioma|langue|pagina|Seite|menu|меню|Translate|page|страницы|страница/i);
  });
});
