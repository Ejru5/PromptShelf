import { describe, expect, it } from "vitest";
import { getAllPrompts, getCollections } from "@/lib/content";
import { buildSearchIndex, createSearcher, highlightRuns } from "@/lib/search";

describe("search", async () => {
  const index = buildSearchIndex(await getAllPrompts(), await getCollections());
  const s = createSearcher(index);
  const top = (q: string, shelf?: string) => s.search(q, { shelf }).map((h) => h.doc.slug);

  it("finds by title, including with typos", () => {
    expect(top("pricing table")[0]).toBe("pricing-table-with-toggle");
    expect(top("pricng tabel")[0]).toBe("pricing-table-with-toggle");
    expect(top("watercolour")[0]).toBe("sketch-to-watercolor");
  });

  it("finds by model, tag and shelf name", () => {
    expect(top("Veo 3")).toContain("drone-over-desert-dunes");
    expect(top("cyberpunk")).toContain("neon-city-in-the-rain");
    expect(top("reports").length).toBeGreaterThan(3);
  });

  it("filters by shelf", () => {
    const hits = s.search("loop", { shelf: "motion" });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.doc.category === "motion")).toBe(true);
  });

  it("returns everything for an empty query and nothing for nonsense", () => {
    expect(s.search("", { limit: 999 })).toHaveLength(index.prompts.length);
    expect(top("zzqxjv")).toEqual([]);
  });

  it("matches shelves and collections", () => {
    expect(s.shelves("ui").map((c) => c.slug)).toContain("ui");
    expect(s.collections("launch")[0].slug).toBe("launch-week-kit");
  });

  it("keeps the client index small", () => {
    expect(JSON.stringify(index).length).toBeLessThan(60_000);
  });
});

describe("highlightRuns", () => {
  it("splits text around matched ranges and ignores single-char noise", () => {
    expect(
      highlightRuns("Pricing table", [
        [0, 6],
        [8, 8],
      ]),
    ).toEqual([
      { text: "Pricing", hit: true },
      { text: " table", hit: false },
    ]);
    expect(highlightRuns("abc")).toEqual([{ text: "abc", hit: false }]);
  });
});

describe("multi-word and punctuation", async () => {
  const s = createSearcher(buildSearchIndex(await getAllPrompts(), await getCollections()));
  const top = (q: string) => s.search(q).map((h) => h.doc.slug);

  it("matches each word independently", () => {
    expect(top("neon rain")[0]).toBe("neon-city-in-the-rain");
    expect(top("desert drone")[0]).toBe("drone-over-desert-dunes");
    expect(top("poster").length).toBeLessThanOrEqual(3);
  });

  it("treats operator characters as plain text", () => {
    expect(() => s.search("!'^= $|")).not.toThrow();
    expect(top("'pricing")[0]).toBe("pricing-table-with-toggle");
  });
});
