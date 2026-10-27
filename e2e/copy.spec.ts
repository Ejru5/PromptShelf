import { expect, test } from "@playwright/test";

test.describe("copy & customize", () => {
  test.beforeEach(async ({ context, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only in Playwright");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("fill blanks, copy the filled prompt, see the note toast", async ({ page }) => {
    await page.goto("/p/golden-hour-desert-portrait");
    await page.getByLabel("Subject", { exact: true }).fill("an astronaut in a white suit");
    await page.getByLabel("Light", { exact: true }).selectOption("blue hour");
    await expect(page.getByRole("button", { name: /edit subject$/ })).toHaveText(
      "an astronaut in a white suit",
    );

    await page.getByRole("button", { name: /^Copy prompt/ }).click();
    await expect(page.getByTestId("toast")).toHaveText("copied! go make something ↗");
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain("Cinematic wide shot of an astronaut in a white suit standing");
    expect(text).toContain("at blue hour");
    expect(text).not.toContain("{{");
  });

  test("values persist across reloads; Reset restores defaults", async ({ page }) => {
    await page.goto("/p/landing-page-hero-copy");
    await page.getByLabel("Product", { exact: true }).fill("Inkwell");
    await page.reload();
    await expect(page.getByLabel("Product", { exact: true })).toHaveValue("Inkwell");
    await page.getByRole("button", { name: /Reset/ }).click();
    await expect(page.getByLabel("Product", { exact: true })).toHaveValue("Ledgerly");
  });

  test("pressing C copies; Open in Claude carries the filled prompt", async ({ page }) => {
    await page.goto("/p/cold-email-sequence");
    await page.locator("body").click({ position: { x: 5, y: 300 } });
    await page.keyboard.press("c");
    await expect(page.getByTestId("toast")).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      "Write a three-email cold outreach sequence from Leah",
    );
    const href = await page.getByRole("link", { name: /Open in Claude/ }).getAttribute("href");
    expect(decodeURIComponent(href!.split("q=")[1])).toContain("from Leah at Trainflow");
  });

  test("copy original keeps the {{blanks}}", async ({ page }) => {
    await page.goto("/p/regex-from-examples");
    await page.getByRole("button", { name: "More copy options" }).click();
    await page.getByRole("menuitem", { name: /Copy original template/ }).click();
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain("{{language}}");
    expect(text).toContain("{{non_matches}}");
  });
});

test("every prompt has an OG image", async ({ request }) => {
  for (const slug of [
    "golden-hour-desert-portrait",
    "command-palette-search",
    "bash-backup-script",
  ]) {
    const res = await request.get(`/p/${slug}/opengraph-image`);
    expect(res.status(), slug).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
  }
});
