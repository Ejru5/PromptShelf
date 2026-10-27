import { expect, test } from "@playwright/test";
import slugs from "../src/content/.generated/slugs.json" with { type: "json" };

test.describe("⌘K palette", () => {
  test("opens with Ctrl/⌘+K, filters as you type, Enter navigates", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard shortcut");
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.getByRole("dialog", { name: "Search prompts" });
    await expect(dialog).toBeVisible();
    const box = dialog.getByRole("combobox");
    await expect(box).toBeFocused();
    await box.fill("neon rain");
    await expect(dialog.getByRole("option").first()).toContainText("Neon city in the rain");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/p\/neon-city-in-the-rain$/);
    await expect(dialog).toBeHidden();
  });

  test("arrow keys move the active option; / opens; Escape closes", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard shortcut");
    await page.goto("/shelves");
    await page.keyboard.press("/");
    const dialog = page.getByRole("dialog", { name: "Search prompts" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("combobox").fill("pricing");
    const options = dialog.getByRole("option");
    await expect(options.first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("header search button opens the palette (and works on phones)", async ({ page }) => {
    await page.goto("/collections");
    await page
      .getByRole("link", { name: /Search/ })
      .first()
      .click();
    const dialog = page.getByRole("dialog", { name: "Search prompts" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("combobox").fill("zzqxjvk");
    await expect(dialog.getByText("nothing on this shelf…")).toBeVisible();
  });
});

test.describe("search page", () => {
  test("query from the URL, typo tolerant, shelf filter", async ({ page }) => {
    await page.goto("/search?q=watercolur");
    await expect(page.getByText(/result.* for “watercolur”/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pencil sketch to watercolour" })).toBeVisible();

    await page.getByRole("searchbox", { name: "Search prompts" }).fill("loop");
    await expect(page).toHaveURL(/q=loop/);
    await page
      .getByRole("group", { name: "Filter by shelf" })
      .getByRole("button", { name: /^Motion/ })
      .click();
    await expect(page).toHaveURL(/shelf=motion/);
    const titles = await page
      .getByRole("main")
      .getByRole("heading", { level: 3 })
      .allTextContents();
    expect(titles.length).toBeGreaterThan(0);
  });

  test("empty results show a friendly state", async ({ page }) => {
    await page.goto("/search?q=zzqxjvk");
    await expect(page.getByRole("heading", { name: /Nothing on the shelf/ })).toBeVisible();
  });
});

test.describe("SEO", () => {
  test("sitemap lists every prompt, shelf and collection", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const s of slugs.prompts) expect(xml, s).toContain(`/p/${s}</loc>`);
    for (const s of slugs.collections) expect(xml, s).toContain(`/collections/${s}</loc>`);
    expect(xml).toContain("/shelves/images</loc>");
  });

  test("robots allows the site and points at the sitemap", async ({ request }) => {
    const txt = await (await request.get("/robots.txt")).text();
    expect(txt).toMatch(/Allow: \//);
    expect(txt).toMatch(/Disallow: \/styleguide/);
    expect(txt).toMatch(/Sitemap: .*\/sitemap\.xml/);
  });

  test("prompt pages carry valid JSON-LD, canonical and OG tags", async ({ page }) => {
    await page.goto("/p/one-page-resume");
    const ld = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!,
    );
    const work = ld["@graph"].find((n: { "@type": string }) => n["@type"] === "CreativeWork");
    expect(work.name).toBe("One-page designer resume");
    expect(work.isAccessibleForFree).toBe(true);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/p\/one-page-resume$/,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /opengraph-image/,
    );
    await expect(page).toHaveTitle("One-page designer resume · Promptshelf");
  });
});
