import { test, expect } from "@playwright/test";

test.describe("home page", () => {
  test("title and main heading", async ({ page }) => {
    await page.goto("/");
    // Default primary is synodal (RU); heading follows getUiBundle (not always English).
    await expect(page).toHaveTitle(/Reader|ридер|阅读|閱讀|Bibbia|Bíblia|Lecteur|Lect|читанн|뷰어/);
    await expect(page.locator("#app-title")).toHaveText(/Bible|Библ|聖經|bibbia|Bíblia|kőnyv|ch reader|Lecteur|lezer|Bibbia|Bijbel|阅读|閱讀|뷰어/);
  });

  test("translation and book UI after data loads (requires public/bible-data)", async ({ page, request }) => {
    const manifest = await request.get("/bible-data/manifest.json");
    test.skip(!manifest.ok(), "Run npm run build:bible so /bible-data/manifest.json exists under public/");

    await page.goto("/");
    await expect(page.locator("#translation option")).not.toHaveCount(0, { timeout: 30_000 });
    await expect(page.locator("#book")).toBeEnabled({ timeout: 5_000 });
    await expect(page.locator(".gt-corner").first()).toBeVisible();
  });
});
