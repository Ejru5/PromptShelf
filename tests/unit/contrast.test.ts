import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/config/categories";
import { contrastRatio } from "@/lib/color";

describe("category palette contrast (WCAG)", () => {
  for (const c of CATEGORIES) {
    it(`${c.slug}: small text (deep) on tint ≥ 4.5`, () => {
      expect(contrastRatio(c.palette.deep, c.palette.tint)).toBeGreaterThanOrEqual(4.5);
    });
    it(`${c.slug}: large titles on tint ≥ 3`, () => {
      expect(contrastRatio(c.palette.title, c.palette.tint)).toBeGreaterThanOrEqual(3);
    });
  }

  it("secondary and muted text pass AA on every neutral surface", () => {
    for (const bg of ["#f1f0ed", "#ffffff", "#e9e7e2", "#ebe9e4"]) {
      expect(contrastRatio("#4c4a46", bg), `ink-2 on ${bg}`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio("#696660", bg), `ink-3 on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
