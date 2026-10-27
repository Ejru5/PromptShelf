/**
 * Data access for prompts and collections.
 *
 * Today the data is the bundle built from `content/` by `npm run content`.
 * Every function is async and returns plain objects so the source can later
 * become a database (add `"use cache"` + `cacheTag` here) without touching pages.
 */
import raw from "@/content/.generated/content.json";
import {
  CATEGORIES,
  getCategoryDef,
  type CategoryDef,
  type CategorySlug,
} from "@/config/categories";
import type { Collection, ContentBundle, Media, Prompt } from "@/content/schema";
import { publicExcerpt } from "./access";

const bundle = raw as unknown as ContentBundle;
const promptsBySlug = new Map(bundle.prompts.map((p) => [p.slug, p]));
const collectionsBySlug = new Map(bundle.collections.map((c) => [c.slug, c]));

/** Lightweight prompt shape for cards and client components (no template/results). */
export type PromptCard = Pick<
  Prompt,
  | "slug"
  | "title"
  | "summary"
  | "category"
  | "models"
  | "tags"
  | "difficulty"
  | "access"
  | "featured"
  | "created"
  | "cover"
  | "excerpt"
> & {
  resultKind: Prompt["results"][number]["kind"] | null;
  resultCount: number;
  blankCount: number;
  /** Short preview for text/code cards (first lines of the first result). */
  snippet?: string;
  /** For video cards: the clip to play on hover. */
  video?: { src: string; type: string; fallback?: { src: string; type: string } };
  /** For before/after cards: the "before" image (cover is the "after"). */
  before?: Media;
  pageCount?: number;
};

export function toCard(p: Prompt): PromptCard {
  const first = p.results[0];
  let snippet: string | undefined;
  if (p.access === "premium") snippet = undefined;
  else if (first?.kind === "text") snippet = first.markdown.replace(/[#*_>`]/g, "").slice(0, 280);
  else if (first?.kind === "code") snippet = first.code.split("\n").slice(0, 14).join("\n");
  const video = p.results.find((r) => r.kind === "video");
  const coverResult = p.results.find((r) => r.kind === "before-after");
  const doc = p.results.find((r) => r.kind === "document");
  return {
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    category: p.category,
    models: p.models,
    tags: p.tags,
    difficulty: p.difficulty,
    access: p.access,
    featured: p.featured,
    created: p.created,
    cover: p.cover,
    excerpt: publicExcerpt(p),
    resultKind: first?.kind ?? null,
    resultCount: p.results.length,
    blankCount: p.blanks.length,
    snippet,
    video:
      video?.kind === "video"
        ? { src: video.video.src, type: video.video.type, fallback: video.video.fallback }
        : undefined,
    before:
      first?.kind === "before-after" && coverResult?.kind === "before-after"
        ? coverResult.before
        : undefined,
    pageCount: doc?.kind === "document" ? doc.pages.length : undefined,
  };
}

export async function getAllPrompts(): Promise<Prompt[]> {
  return bundle.prompts;
}

export async function getPrompt(slug: string): Promise<Prompt | null> {
  return promptsBySlug.get(slug) ?? null;
}

export async function getPromptsByCategory(category: CategorySlug | string): Promise<Prompt[]> {
  return bundle.prompts.filter((p) => p.category === category);
}

export async function getFeaturedPrompts(limit = 8): Promise<Prompt[]> {
  const featured = bundle.prompts.filter((p) => p.featured);
  return featured.slice(0, limit);
}

/** Newest prompts across all shelves. */
export async function getLatestPrompts(limit = 8): Promise<Prompt[]> {
  return bundle.prompts.slice(0, limit);
}

/**
 * Related prompts: same shelf scores highest, then shared tags and models.
 * Ties go to the newest.
 */
export async function getRelatedPrompts(prompt: Prompt, limit = 6): Promise<Prompt[]> {
  const tags = new Set(prompt.tags);
  const models = new Set(prompt.models);
  return bundle.prompts
    .filter((p) => p.slug !== prompt.slug)
    .map((p, index) => {
      let score = p.category === prompt.category ? 3 : 0;
      for (const t of p.tags) if (tags.has(t)) score += 2;
      for (const m of p.models) if (models.has(m)) score += 1;
      return { p, score, index };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((x) => x.p);
}

/** Previous/next prompt within the same shelf (wraps around). */
export async function getShelfNeighbours(prompt: Prompt) {
  const list = bundle.prompts.filter((p) => p.category === prompt.category);
  const i = list.findIndex((p) => p.slug === prompt.slug);
  if (list.length < 2 || i < 0) return { prev: null, next: null };
  return {
    prev: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
  };
}

/** A tiny preview used in fans and stacks: an image, or a text/code snippet. */
export type Thumb =
  | { kind: "image"; media: Media; alt: string }
  | { kind: "text" | "code"; text: string; alt: string };

export function thumbOf(p: Prompt): Thumb | null {
  if (p.cover) return { kind: "image", media: p.cover, alt: p.title };
  const first = p.results[0];
  if (first?.kind === "text")
    return { kind: "text", text: first.markdown.slice(0, 240), alt: p.title };
  if (first?.kind === "code") {
    return { kind: "code", text: first.code.split("\n").slice(0, 12).join("\n"), alt: p.title };
  }
  return null;
}

export type ShelfSummary = {
  category: CategoryDef;
  count: number;
  /** Up to 3 thumbnails for stacked previews. */
  covers: Media[];
  thumbs: Thumb[];
  latest: Prompt | null;
};

export async function getShelfSummaries(): Promise<ShelfSummary[]> {
  return CATEGORIES.map((category) => {
    const list = bundle.prompts.filter((p) => p.category === category.slug);
    return {
      category,
      count: list.length,
      covers: list
        .map((p) => p.cover)
        .filter((c): c is Media => c !== null)
        .slice(0, 3),
      thumbs: list
        .map(thumbOf)
        .filter((t): t is Thumb => t !== null)
        .slice(0, 3),
      latest: list[0] ?? null,
    };
  });
}

export async function getShelf(slug: string) {
  const category = getCategoryDef(slug);
  if (!category) return null;
  return { category, prompts: await getPromptsByCategory(slug) };
}

export async function getCollections(): Promise<Collection[]> {
  return bundle.collections;
}

export async function getCollection(slug: string) {
  const collection = collectionsBySlug.get(slug);
  if (!collection) return null;
  const prompts = collection.prompts
    .map((s) => promptsBySlug.get(s))
    .filter((p): p is Prompt => Boolean(p));
  return { collection, prompts };
}

/** Collections that include a given prompt. */
export async function getCollectionsForPrompt(slug: string): Promise<Collection[]> {
  return bundle.collections.filter((c) => c.prompts.includes(slug));
}

export async function getStats() {
  return {
    prompts: bundle.prompts.length,
    collections: bundle.collections.length,
    shelves: CATEGORIES.length,
    models: new Set(bundle.prompts.flatMap((p) => p.models)).size,
  };
}
