import { expect, test } from "@playwright/test";

test("save prompts to My shelf and remove them", async ({ page }) => {
  await page.goto("/saved");
  await expect(page.getByRole("heading", { name: "Your shelf is empty" })).toBeVisible();

  await page.goto("/p/one-page-resume");
  await page.getByRole("button", { name: /Save “One-page designer resume” to My shelf/ }).click();
  await expect(page.getByTestId("toast").first()).toHaveText("Saved to My shelf");
  await expect(
    page.getByRole("button", { name: /Remove “One-page designer resume”/ }).first(),
  ).toHaveAttribute("aria-pressed", "true");

  await page.goto("/shelves/video");
  await page.getByRole("button", { name: /Save “Ocean sunset dolly”/ }).click({ force: true });

  await page.goto("/saved");
  const shelf = page.getByLabel("Saved prompts shelf");
  await expect(shelf.getByRole("link")).toHaveCount(2);
  await expect(page.getByText(/2 saved prompts/)).toBeVisible();
  // Newest first.
  await expect(shelf.getByRole("link").first()).toHaveAttribute("href", "/p/ocean-sunset-dolly");

  await page.getByRole("button", { name: "Clear shelf" }).click();
  await page.getByRole("button", { name: "Tap again to clear" }).click();
  await expect(page.getByRole("heading", { name: "Your shelf is empty" })).toBeVisible();
});

test("header shows the saved count", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop nav");
  await page.goto("/p/geometric-logo-reveal");
  await page.getByRole("button", { name: /Save “Geometric logo reveal”/ }).click();
  await expect(page.getByRole("navigation", { name: "Main" }).getByLabel("1 saved")).toBeVisible();
});
