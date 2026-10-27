import { expect, test } from "@playwright/test";

test("styleguide renders every building block without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto("/styleguide");
  await expect(page.getByTestId("sg-category")).toHaveCount(8);
  await expect(page.getByRole("heading", { name: "Folder-tab cards" })).toBeVisible();
  await expect(page.locator("mark[data-blank]")).toHaveCount(1);
  await expect(page.getByRole("term")).toHaveCount(6);
  expect(errors).toEqual([]);
});

test("note toast shows the handwritten message", async ({ page }) => {
  await page.goto("/styleguide");
  await page.getByRole("button", { name: "Note toast" }).click();
  await expect(page.getByTestId("toast")).toHaveText("copied! go make something ↗");
  await expect(page.getByTestId("toast")).toBeHidden({ timeout: 5000 });
});

test("styleguide is not indexed", async ({ page }) => {
  await page.goto("/styleguide");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
