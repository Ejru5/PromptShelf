import { expect, test } from "@playwright/test";

test.describe("site shell", () => {
  test("home renders header, footer and no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

    await page.goto("/");
    await expect(page.getByRole("link", { name: "Promptshelf home" }).first()).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("menu opens, lists every shelf, and closes with Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("navigation", { name: "Shelves" }).getByRole("link")).toHaveCount(
      8,
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("skip link targets main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  });
});

test("unknown pages show the 404 page", async ({ page }) => {
  const res = await page.goto("/definitely-not-a-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This shelf is empty." })).toBeVisible();
});

test("unknown shelf slug is a 404", async ({ page }) => {
  const res = await page.goto("/shelves/not-a-shelf");
  expect(res?.status()).toBe(404);
});

test("no page scrolls sideways", async ({ page }) => {
  for (const path of [
    "/",
    "/shelves",
    "/shelves/images",
    "/shelves/ui",
    "/p/golden-hour-desert-portrait",
    "/collections",
    "/collections/starter-pack",
  ]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test("security and caching headers are set", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(res.headers()["x-frame-options"]).toBe("SAMEORIGIN");
  const media = await request.get("/results/golden-hour-desert-portrait/golden.jpg");
  expect(media.status()).toBe(200);
  expect(media.headers()["cache-control"]).toContain("max-age=86400");
});
