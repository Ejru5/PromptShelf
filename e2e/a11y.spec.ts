import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/shelves",
  "/shelves/images",
  "/shelves/ui",
  "/p/golden-hour-desert-portrait",
  "/p/sketch-to-watercolor",
  "/p/pricing-table-with-toggle",
  "/p/project-proposal",
  "/p/refactor-class-to-hooks",
  "/collections",
  "/collections/starter-pack",
  "/search?q=video",
  "/saved",
];

for (const path of PAGES) {
  test(`no WCAG A/AA violations: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Sandboxed third-party-style component previews are audited separately (they're sample outputs).
      .exclude("iframe")
      .analyze();
    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
    }));
    expect(summary).toEqual([]);
  });
}

test("menu and search palette dialogs are accessible when open", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog", { name: "Site menu" })).toBeVisible();
  let results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .include("dialog[open]")
    .analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
  await page.keyboard.press("Escape");

  await page
    .getByRole("link", { name: /Search/ })
    .first()
    .click();
  await page.getByRole("combobox").fill("poster");
  await expect(page.getByRole("option").first()).toBeVisible();
  results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .include("dialog[open]")
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html.slice(0, 80)}`)).toEqual([]);
});
