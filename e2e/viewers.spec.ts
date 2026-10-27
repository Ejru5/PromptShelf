import { expect, test } from "@playwright/test";

test.describe("result viewers", () => {
  test("image results switch via tabs and open in a lightbox", async ({ page }) => {
    await page.goto("/p/golden-hour-desert-portrait");
    const tabs = page.getByRole("tablist", { name: "Results" });
    await expect(tabs.getByRole("tab")).toHaveCount(3);
    await tabs.getByRole("tab", { name: "blue hour" }).click();
    await expect(tabs.getByRole("tab", { name: "blue hour" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByText(/Result 2 of 3/)).toBeVisible();

    await page
      .getByRole("button", { name: /Enlarge image: The same dune scene at blue hour/ })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("before/after slider responds to keyboard and pointer", async ({ page }) => {
    await page.goto("/p/sketch-to-watercolor");
    const slider = page.getByRole("slider", { name: /Compare sketch and watercolour/ });
    await expect(slider).toHaveValue("50");
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveValue("52");
    const box = (await slider.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.2, box.y + box.height / 2);
    const value = Number(await slider.inputValue());
    expect(value).toBeGreaterThan(14);
    expect(value).toBeLessThan(26);
  });

  test("video result offers mp4 + webm and toggles play/pause", async ({ page }) => {
    await page.goto("/p/drone-over-desert-dunes");
    const video = page.locator("section[aria-label=Results] video");
    await expect(video.locator("source")).toHaveCount(2);
    await expect(video.locator("source").nth(1)).toHaveAttribute("type", "video/webm");
    // Autoplays when visible (muted, looping).
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  });

  test("UI preview runs in an isolated sandbox and stays interactive", async ({ page }) => {
    await page.goto("/p/pricing-table-with-toggle");
    const iframe = page.locator("iframe[title$='live preview']");
    await expect(iframe).toHaveAttribute("sandbox", "allow-scripts allow-forms");
    const frame = page.frameLocator("iframe[title$='live preview']");
    // Lazy iframe + parallel workers: give the sandboxed document time to load.
    await expect(frame.getByText("$24", { exact: true })).toBeVisible({ timeout: 15_000 });
    await frame.getByRole("button", { name: /Yearly/ }).click();
    await expect(frame.getByText("$19", { exact: true })).toBeVisible({ timeout: 10_000 });
    // The sandboxed document has an opaque origin: it can't touch our storage.
    const origin = await iframe.evaluate((f: HTMLIFrameElement) => {
      try {
        return f.contentWindow!.document.domain;
      } catch {
        return "blocked";
      }
    });
    expect(origin).toBe("blocked");
  });

  test("UI preview viewport + code tab", async ({ page, isMobile }) => {
    test.skip(isMobile, "viewport switching is a desktop affordance");
    await page.goto("/p/command-palette-search");
    await page.getByRole("button", { name: "Mobile" }).click();
    await expect(page.getByText(/^390px/)).toBeVisible();
    await page.getByRole("tab", { name: "code" }).click();
    await expect(page.locator(".code-output").first()).toContainText("<!doctype html>");
  });

  test("document viewer flips pages and links the PDF", async ({ page, request }) => {
    await page.goto("/p/project-proposal");
    await expect(page.getByText("1 / 2")).toBeVisible();
    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("2 / 2")).toBeVisible();
    await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
    const href = await page.getByRole("link", { name: "Sample PDF" }).getAttribute("href");
    const res = await request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("pdf");
  });

  test("text output is typeset and code output highlighted", async ({ page }) => {
    await page.goto("/p/landing-page-hero-copy");
    await expect(page.locator(".prose-output h1").first()).toHaveText(
      "Close your books in an afternoon, not a week.",
    );
    await page.goto("/p/explain-and-optimize-sql");
    await expect(page.locator(".code-output pre.shiki")).toBeVisible();
    expect(await page.locator(".code-output .line").count()).toBeGreaterThan(20);
  });

  test("copy code button copies to the clipboard", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/p/regex-from-examples");
    await page.getByRole("button", { name: "Copy code" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain("UK_POSTCODE");
  });
});
