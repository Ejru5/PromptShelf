import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/config/categories";
import type { Media, Result } from "@/content/schema";
import {
  getAllPrompts,
  getCollection,
  getCollections,
  getPrompt,
  getRelatedPrompts,
  getShelfNeighbours,
  getShelfSummaries,
  toCard,
} from "@/lib/content";
import { blankNames } from "@/lib/prompt-template";

const PUBLIC = path.join(process.cwd(), "public");
const exists = (src: string) => existsSync(path.join(PUBLIC, src));

function mediaOf(r: Result): Media[] {
  switch (r.kind) {
    case "image":
      return [r.image];
    case "before-after":
      return [r.before, r.after];
    case "video":
      return r.poster ? [r.poster] : [];
    case "ui":
      return r.thumbnail ? [r.thumbnail] : [];
    case "document":
      return r.pages;
    default:
      return [];
  }
}

describe("content bundle integrity", async () => {
  const prompts = await getAllPrompts();

  it("has prompts on every shelf", () => {
    for (const c of CATEGORIES) {
      expect(prompts.filter((p) => p.category === c.slug).length, c.slug).toBeGreaterThan(0);
    }
  });

  it("uses unique, kebab-case slugs", () => {
    const slugs = prompts.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("is sorted newest first", () => {
    const dates = prompts.map((p) => p.created);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("lists exactly the blanks used in each template, in order", () => {
    for (const p of prompts) {
      expect(
        p.blanks.map((b) => b.name),
        p.slug,
      ).toEqual(blankNames(p.template));
      for (const b of p.blanks) expect(b.label.length, `${p.slug}.${b.name}`).toBeGreaterThan(0);
    }
  });

  it("copies every referenced media file into public/", () => {
    for (const p of prompts) {
      for (const r of p.results) {
        for (const m of mediaOf(r)) {
          expect(exists(m.src), `${p.slug}: ${m.src}`).toBe(true);
          expect(m.width).toBeGreaterThan(0);
          expect(m.height).toBeGreaterThan(0);
          expect(m.blurDataURL).toMatch(/^data:image\/webp;base64,/);
        }
        if (r.kind === "video") expect(exists(r.video.src), r.video.src).toBe(true);
        if (r.kind === "document" && r.pdf) expect(exists(r.pdf), r.pdf).toBe(true);
      }
    }
  });

  it("gives every visual prompt a card cover", () => {
    const visual = new Set(["images", "video", "motion", "ui", "documents", "reports"]);
    for (const p of prompts.filter((p) => visual.has(p.category))) {
      expect(p.cover, p.slug).not.toBeNull();
    }
  });

  it("inlines UI, text and code results", () => {
    for (const p of prompts) {
      for (const r of p.results) {
        if (r.kind === "ui") expect(r.html).toMatch(/<html|<body|<div/i);
        if (r.kind === "text") expect(r.markdown.length).toBeGreaterThan(50);
        if (r.kind === "code") expect(r.language).not.toBe("text");
      }
    }
  });

  it("is all free today (paid-ready field present)", () => {
    for (const p of prompts) expect(["free", "premium"]).toContain(p.access);
  });

  it("collections only reference existing prompts", async () => {
    const collections = await getCollections();
    expect(collections.length).toBeGreaterThan(0);
    collections.forEach((c, i) => expect(c.number).toBe(String(i + 1).padStart(2, "0")));
    for (const c of collections) {
      const resolved = await getCollection(c.slug);
      expect(resolved?.prompts.length).toBe(c.prompts.length);
    }
  });
});

describe("data access helpers", async () => {
  const prompts = await getAllPrompts();
  const sample = prompts.find((p) => p.slug === "golden-hour-desert-portrait")!;

  it("looks prompts up by slug", async () => {
    expect((await getPrompt(sample.slug))?.title).toBe(sample.title);
    expect(await getPrompt("nope")).toBeNull();
  });

  it("ranks related prompts: never itself, same shelf first", async () => {
    const related = await getRelatedPrompts(sample, 5);
    expect(related.length).toBeGreaterThan(0);
    expect(related.map((p) => p.slug)).not.toContain(sample.slug);
    expect(related[0].category).toBe(sample.category);
  });

  it("wraps shelf neighbours around", async () => {
    const shelf = prompts.filter((p) => p.category === sample.category);
    const { prev, next } = await getShelfNeighbours(shelf[0]);
    expect(prev?.slug).toBe(shelf[shelf.length - 1].slug);
    expect(next?.slug).toBe(shelf[1].slug);
  });

  it("summarises shelves with counts and covers", async () => {
    const summaries = await getShelfSummaries();
    expect(summaries).toHaveLength(CATEGORIES.length);
    expect(summaries.reduce((n, s) => n + s.count, 0)).toBe(prompts.length);
    expect(summaries.find((s) => s.category.slug === "images")?.covers.length).toBeGreaterThan(0);
  });

  it("builds light card data without the template", () => {
    const code = prompts.find((p) => p.category === "code")!;
    const card = toCard(code);
    expect(card).not.toHaveProperty("template");
    expect(card.snippet?.split("\n").length).toBeLessThanOrEqual(14);
    expect(toCard(prompts.find((p) => p.category === "video")!).video?.src).toMatch(/\.mp4$/);
  });
});
