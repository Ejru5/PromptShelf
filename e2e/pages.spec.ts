import { expect, test, type Page } from "@playwright/test";
import slugs from "../src/content/.generated/slugs.json" with { type: "json" };

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

test.describe("home", () => {
  test("hero, dial and sections render without errors", async ({ page, isMobile }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Prompts");
    await expect(page.getByRole("heading", { name: /Four steps/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Fresh off/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /New on/ })).toBeVisible();
    if (isMobile) {
      await expect(page.getByRole("radiogroup", { name: "Shelves" })).toBeHidden();
    } else {
      await expect(page.getByRole("radiogroup", { name: "Shelves" })).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test("dial turns with buttons and arrow keys", async ({ page, isMobile }) => {
    test.skip(isMobile, "dial is desktop-only; phones get the strip");
    await page.goto("/");
    const dial = page.getByRole("radiogroup", { name: "Shelves" });
    await expect(dial.getByRole("radio", { checked: true })).toHaveAccessibleName(/^01 Images/);
    await page.getByRole("button", { name: "Next shelf" }).click();
    await expect(dial.getByRole("radio", { checked: true })).toHaveAccessibleName(/^02 Video/);
    await dial.getByRole("radio", { checked: true }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(dial.getByRole("radio", { checked: true })).toHaveAccessibleName(/^03 Motion/);
    await expect(dial.getByRole("radio", { checked: true })).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(dial.getByRole("radio", { checked: true })).toHaveAccessibleName(/^08 Code/);
    await page.getByRole("link", { name: /Open Code/ }).click();
    await expect(page).toHaveURL(/\/shelves\/code$/);
  });
});

test.describe("shelves", () => {
  test("index lists all eight shelves", async ({ page }) => {
    await page.goto("/shelves");
    await expect(page.getByRole("main").getByRole("article")).toHaveCount(8);
  });

  test("shelf page filters by model and level via the URL", async ({ page }) => {
    await page.goto("/shelves/images");
    await expect(page.getByText(/of 6 prompts/)).toBeVisible();
    const grid = page.getByRole("region", { name: "Images prompts" });
    await expect(grid.getByRole("article")).toHaveCount(6);
    await page.getByRole("button", { name: /^Ideogram 3/ }).click();
    await expect(page).toHaveURL(/model=Ideogram\+3/);
    await expect(grid.getByRole("article")).toHaveCount(2);
    await page.getByLabel("Level").selectOption("intermediate");
    await expect(page).toHaveURL(/level=intermediate/);
    await expect(grid.getByRole("article")).toHaveCount(1);
    await page.getByRole("button", { name: "Clear filters" }).first().click();
    await expect(grid.getByRole("article")).toHaveCount(6);
  });

  test("sort A–Z reorders cards", async ({ page }) => {
    await page.goto("/shelves/code?sort=az");
    // Wait for the interactive browser (it replaces the server-rendered grid).
    await expect(page.getByText(/of 6 prompts/)).toBeVisible();
    await expect(page.getByLabel("Sort")).toHaveValue("az");
    const titles = await page
      .getByRole("region", { name: "Code & dev prompts" })
      .getByRole("heading", { level: 3 })
      .allTextContents();
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
  });
});

test.describe("prompt detail", () => {
  test("shows title, prompt, specs and related links", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/p/golden-hour-desert-portrait");
    await expect(
      page.getByRole("heading", { level: 1, name: "Golden-hour desert portrait" }),
    ).toBeVisible();
    await expect(page.getByTestId("prompt-text").locator("[data-blank]")).toHaveCount(2);
    await expect(page.getByRole("term").filter({ hasText: "Aspect ratio" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Images/ }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /More from/ })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("prev/next walk the shelf", async ({ page }) => {
    await page.goto("/p/golden-hour-desert-portrait");
    await page.getByRole("link", { name: /^Next:/ }).click();
    await expect(page).not.toHaveURL(/golden-hour-desert-portrait/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("unknown prompt is a real 404", async ({ page }) => {
    const res = await page.goto("/p/not-a-real-prompt");
    expect(res?.status()).toBe(404);
  });
});

test.describe("collections", () => {
  test("index and detail", async ({ page }) => {
    await page.goto("/collections");
    await expect(page.getByRole("main").getByRole("article")).toHaveCount(slugs.collections.length);
    await page.getByRole("link", { name: "Starter pack" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Starter pack" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(8);
  });

  test("unknown collection is a real 404", async ({ page }) => {
    const res = await page.goto("/collections/nope");
    expect(res?.status()).toBe(404);
  });
});

test("every prompt page responds 200", async ({ request }) => {
  for (const slug of slugs.prompts) {
    const res = await request.get(`/p/${slug}`);
    expect(res.status(), slug).toBe(200);
  }
});
