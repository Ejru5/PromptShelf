import { describe, expect, it } from "vitest";
import { CATEGORIES, getCategoryDef, isCategorySlug, paletteVars } from "@/config/categories";

describe("categories config", () => {
  it("has unique slugs and sequential numbers", () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    CATEGORIES.forEach((c, i) => expect(c.number).toBe(String(i + 1).padStart(2, "0")));
  });

  it("uses valid hex colours", () => {
    for (const c of CATEGORIES) {
      for (const hex of Object.values(c.palette)) expect(hex).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("looks up categories by slug", () => {
    expect(getCategoryDef("images")?.name).toBe("Images");
    expect(getCategoryDef("nope")).toBeUndefined();
    expect(isCategorySlug("ui")).toBe(true);
    expect(isCategorySlug("UI")).toBe(false);
  });

  it("exposes the palette as CSS variables", () => {
    const vars = paletteVars(CATEGORIES[0].palette) as Record<string, string>;
    expect(vars["--accent"]).toBe(CATEGORIES[0].palette.accent);
    expect(vars["--tint"]).toBe(CATEGORIES[0].palette.tint);
    expect(vars["--deep"]).toBe(CATEGORIES[0].palette.deep);
    expect(vars["--title"]).toBe(CATEGORIES[0].palette.title);
  });
});
