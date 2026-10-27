import Fuse, { type FuseResultMatch, type IFuseOptions } from "fuse.js";
import { CATEGORIES, getCategoryDef } from "@/config/categories";
import type { Collection, Prompt } from "@/content/schema";
import { publicExcerpt } from "./access";

/** One searchable prompt — small enough to ship to the browser for the ⌘K palette. */
export type SearchDoc = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  shelf: string;
  models: string[];
  tags: string[];
  excerpt: string;
  thumb?: string;
  access: "free" | "premium";
};

export type SearchIndex = {
  prompts: SearchDoc[];
  collections: { slug: string; title: string; description: string; color: string; count: number }[];
};

export function buildSearchIndex(prompts: Prompt[], collections: Collection[]): SearchIndex {
  return {
    prompts: prompts.map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      category: p.category,
      shelf: getCategoryDef(p.category)?.name ?? p.category,
      models: p.models,
      tags: p.tags,
      excerpt: publicExcerpt(p),
      thumb: p.cover?.src,
      access: p.access,
    })),
    collections: collections.map((c) => ({
      slug: c.slug,
      title: c.title,
      description: c.description,
      color: c.color,
      count: c.prompts.length,
    })),
  };
}

const OPTIONS: IFuseOptions<SearchDoc> = {
  keys: [
    { name: "title", weight: 0.42 },
    { name: "tags", weight: 0.18 },
    { name: "summary", weight: 0.14 },
    { name: "shelf", weight: 0.1 },
    { name: "models", weight: 0.1 },
    { name: "excerpt", weight: 0.06 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
  minMatchCharLength: 2,
  // Extended search treats spaces as AND, so each word is fuzzy-matched on its own
  // ("neon rain" finds "Neon city in the rain").
  useExtendedSearch: true,
  includeMatches: true,
  includeScore: true,
};

/**
 * Strip Fuse extended-search operators so typed punctuation is just text, and drop
 * one-character words in multi-word queries ("Veo 3" → "Veo") — they're below the
 * minimum match length and would make the AND fail.
 */
export function toFusePattern(query: string) {
  return query
    .split(/\s+/)
    .map((t) =>
      t
        .replace(/^[!'=^]+/, "")
        .replace(/[$|]+$/, "")
        .replace(/\|/g, ""),
    )
    .filter((t, _i, all) => t.length > 1 || (all.length === 1 && t.length > 0))
    .join(" ");
}

export type SearchHit = {
  doc: SearchDoc;
  score: number;
  titleMatches?: readonly [number, number][];
};

export function createSearcher(index: SearchIndex) {
  const fuse = new Fuse(index.prompts, OPTIONS);
  return {
    search(query: string, opts: { shelf?: string; limit?: number } = {}): SearchHit[] {
      const q = query.trim();
      const pool = (hits: SearchHit[]) =>
        hits.filter((h) => !opts.shelf || h.doc.category === opts.shelf).slice(0, opts.limit ?? 50);
      if (!q) return pool(index.prompts.map((doc) => ({ doc, score: 0 })));
      const pattern = toFusePattern(q);
      if (!pattern) return [];
      return pool(
        fuse.search(pattern).map((r) => ({
          doc: r.item,
          score: r.score ?? 1,
          titleMatches: r.matches?.find((m: FuseResultMatch) => m.key === "title")?.indices,
        })),
      );
    },
    collections(query: string, limit = 3) {
      const q = query.trim().toLowerCase();
      if (!q) return index.collections.slice(0, limit);
      return index.collections
        .filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
        .slice(0, limit);
    },
    shelves(query: string) {
      const q = query.trim().toLowerCase();
      return CATEGORIES.filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.short.toLowerCase().includes(q) ||
          c.slug.includes(q),
      );
    },
  };
}

/** Split text into [plain, highlighted] runs from Fuse match indices (inclusive ranges). */
export function highlightRuns(text: string, ranges?: readonly [number, number][]) {
  if (!ranges?.length) return [{ text, hit: false }];
  const runs: { text: string; hit: boolean }[] = [];
  let last = 0;
  for (const [start, end] of [...ranges].sort((a, b) => a[0] - b[0])) {
    if (end - start < 1 || start < last) continue; // skip 1-char noise and overlaps
    if (start > last) runs.push({ text: text.slice(last, start), hit: false });
    runs.push({ text: text.slice(start, end + 1), hit: true });
    last = end + 1;
  }
  if (last < text.length) runs.push({ text: text.slice(last), hit: false });
  return runs;
}
