import { expect, test } from "@playwright/test";

test("clicking a card runs a view transition into the detail page", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "View Transitions API");
  await page.addInitScript(() => {
    const w = window as unknown as { __vt: number };
    w.__vt = 0;
    const original = document.startViewTransition?.bind(document);
    if (original) {
      document.startViewTransition = ((arg: Parameters<typeof original>[0]) => {
        w.__vt++;
        return original(arg);
      }) as typeof document.startViewTransition;
    }
  });
  await page.goto("/shelves/images");
  await expect(page.getByText(/of 6 prompts/)).toBeVisible();
  // Let the full-route prefetch for the card finish so the destination is ready in one commit.
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: "Golden-hour desert portrait" }).click();
  await expect(page).toHaveURL(/\/p\/golden-hour-desert-portrait$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Golden-hour desert portrait");
  expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBeGreaterThan(
    0,
  );
});

test("home → featured tile transitions without duplicate-name errors", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "View Transitions API");
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.addInitScript(() => {
    const w = window as unknown as { __vt: number };
    w.__vt = 0;
    const original = document.startViewTransition?.bind(document);
    if (original) {
      document.startViewTransition = ((arg: Parameters<typeof original>[0]) => {
        w.__vt++;
        const t = original(arg);
        // Surface the browser's rejection (e.g. duplicate view-transition-name) as a console error.
        t.ready.catch((err: Error) => console.error(`view transition failed: ${err.message}`));
        return t;
      }) as typeof document.startViewTransition;
    }
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const featured = page
    .getByRole("heading", { name: /Fresh off/ })
    .locator("xpath=ancestor::section[1]");
  await featured.getByRole("link", { name: "Pencil sketch to watercolour" }).click();
  await expect(page).toHaveURL(/\/p\/sketch-to-watercolor$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pencil sketch to watercolour");
  expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBeGreaterThan(
    0,
  );
  expect(errors).toEqual([]);
});

test("navigating between prompts keeps working (Activity + transitions)", async ({ page }) => {
  await page.goto("/p/golden-hour-desert-portrait");
  await page.getByRole("link", { name: /^Next:/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
    "Golden-hour desert portrait",
  );
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Golden-hour desert portrait");
});
