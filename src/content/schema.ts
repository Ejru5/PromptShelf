/**
 * Content schema — what an author writes in `content/prompts/<shelf>/<slug>/prompt.md`
 * (frontmatter) and `content/collections/<slug>.md`, plus the resolved shapes the
 * app reads after `npm run content` builds them.
 *
 * Paid-ready: every prompt has `access: free | premium` (free today).
 */
import { z } from "zod";
import { CATEGORY_SLUGS, type CategorySlug } from "@/config/categories";

// ---------------------------------------------------------------- source (authoring)

const fileRef = z.string().min(1).describe("File name inside the prompt folder");
const common = {
  caption: z.string().optional(),
  model: z.string().optional(),
  /** Seeded/illustrative result — replace with a real output. Shown as a badge in dev only. */
  placeholder: z.boolean().optional(),
};

export const SourceResult = z.discriminatedUnion("type", [
  z.object({ type: z.literal("image"), file: fileRef, alt: z.string().min(3), ...common }).strict(),
  z
    .object({
      type: z.literal("before-after"),
      before: fileRef,
      after: fileRef,
      alt: z.string().min(3),
      beforeLabel: z.string().default("Before"),
      afterLabel: z.string().default("After"),
      ...common,
    })
    .strict(),
  z
    .object({
      type: z.literal("video"),
      file: fileRef.regex(/\.(mp4|webm)$/i, "Video must be .mp4 or .webm"),
      poster: fileRef.optional(),
      alt: z.string().min(3),
      ...common,
    })
    .strict(),
  z
    .object({
      type: z.literal("ui"),
      file: fileRef.regex(/\.html$/i, "UI results are self-contained .html files"),
      /** Preview frame height in px at desktop width. */
      height: z.number().int().min(120).max(1600).default(520),
      alt: z.string().min(3).optional(),
      ...common,
    })
    .strict(),
  z
    .object({
      type: z.literal("document"),
      pages: z.array(fileRef).min(1),
      pdf: fileRef.regex(/\.pdf$/i).optional(),
      alt: z.string().min(3),
      ...common,
    })
    .strict(),
  z
    .object({
      type: z.literal("text"),
      file: fileRef.regex(/\.(md|txt)$/i),
      ...common,
    })
    .strict(),
  z
    .object({
      type: z.literal("code"),
      file: fileRef,
      language: z.string().optional(),
      filename: z.string().optional(),
      ...common,
    })
    .strict(),
]);
export type SourceResult = z.infer<typeof SourceResult>;

export const BlankSpec = z
  .object({
    label: z.string().optional(),
    default: z.string().optional(),
    placeholder: z.string().optional(),
    options: z.array(z.string()).min(2).optional(),
    hint: z.string().optional(),
  })
  .strict();

const isoDate = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"));

export const PromptFrontmatter = z
  .object({
    title: z.string().min(3).max(90),
    summary: z.string().min(10).max(220),
    category: z.enum(CATEGORY_SLUGS as [CategorySlug, ...CategorySlug[]]),
    models: z.array(z.string().min(1)).min(1),
    tags: z.array(z.string().min(1)).default([]),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
    access: z.enum(["free", "premium"]).default("free"),
    featured: z.boolean().default(false),
    created: isoDate,
    updated: isoDate.optional(),
    settings: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
    blanks: z.record(z.string(), BlankSpec).default({}),
    notes: z.array(z.string()).default([]),
    results: z.array(SourceResult).default([]),
    /** Which result to use as the card thumbnail (index into results). */
    cover: z.number().int().min(0).default(0),
  })
  .strict();
export type PromptFrontmatter = z.infer<typeof PromptFrontmatter>;

export const CollectionFrontmatter = z
  .object({
    title: z.string().min(3).max(60),
    description: z.string().min(10).max(240),
    /** Cover colour, any #rrggbb. */
    color: z.string().regex(/^#[0-9a-f]{6}$/i),
    /** Cover artwork motif (see components/collections/cover-art.tsx). */
    art: z.enum(["orbits", "stack", "grid", "wave", "spark", "frames"]).default("orbits"),
    access: z.enum(["free", "premium"]).default("free"),
    featured: z.boolean().default(false),
    /** Lower comes first; also sets the collection's № number. */
    order: z.number().int().default(100),
    prompts: z.array(z.string().min(1)).min(1),
  })
  .strict();
export type CollectionFrontmatter = z.infer<typeof CollectionFrontmatter>;

// ---------------------------------------------------------------- built (what the app reads)

export type Media = {
  src: string;
  width: number;
  height: number;
  /** Tiny inline preview for next/image `placeholder="blur"`. */
  blurDataURL?: string;
};

type ResultCommon = { caption?: string; model?: string; placeholder?: boolean };

export type Result =
  | ({ kind: "image"; image: Media; alt: string } & ResultCommon)
  | ({
      kind: "before-after";
      before: Media;
      after: Media;
      alt: string;
      beforeLabel: string;
      afterLabel: string;
    } & ResultCommon)
  | ({
      kind: "video";
      video: {
        src: string;
        width: number;
        height: number;
        type: string;
        duration?: number;
        /** A second encoding (e.g. WebM next to an MP4) for browsers without H.264. */
        fallback?: { src: string; type: string };
      };
      poster?: Media;
      alt: string;
    } & ResultCommon)
  | ({ kind: "ui"; html: string; height: number; thumbnail?: Media; alt?: string } & ResultCommon)
  | ({ kind: "document"; pages: Media[]; pdf?: string; alt: string } & ResultCommon)
  | ({ kind: "text"; markdown: string } & ResultCommon)
  | ({ kind: "code"; code: string; language: string; filename?: string } & ResultCommon);

export type ResultKind = Result["kind"];

export type Blank = {
  name: string;
  label: string;
  default?: string;
  placeholder?: string;
  options?: string[];
  hint?: string;
};

export type Prompt = {
  slug: string;
  title: string;
  summary: string;
  category: CategorySlug;
  models: string[];
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  access: "free" | "premium";
  featured: boolean;
  created: string;
  updated: string;
  settings: { label: string; value: string }[];
  blanks: Blank[];
  template: string;
  notes: string[];
  results: Result[];
  /** Thumbnail for cards, derived from the cover result (null for text/code). */
  cover: Media | null;
  /** First ~220 chars of the template as plain text, for cards and search. */
  excerpt: string;
};

export type Collection = {
  slug: string;
  number: string;
  title: string;
  description: string;
  color: string;
  art: CollectionFrontmatter["art"];
  access: "free" | "premium";
  featured: boolean;
  prompts: string[];
};

export type ContentBundle = {
  generatedAt: string;
  prompts: Prompt[];
  collections: Collection[];
};
