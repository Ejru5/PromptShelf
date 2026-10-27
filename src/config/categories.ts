/**
 * Category definitions — the single source of truth for each shelf's
 * name, number, preview style and colour palette.
 *
 * Colours live here (not only in CSS) because they're also needed
 * outside the stylesheet: OG images, generated media and the styleguide.
 */

export type PreviewType = "image" | "video" | "ui" | "document" | "text" | "code";

export type CategoryPalette = {
  /** Strong brand colour for the category (icons, dots, fills). */
  accent: string;
  /** Large-title colour on `tint` (≥3:1). Same as accent unless accent is too light. */
  title: string;
  /** Pale wash used for label panels and backgrounds. */
  tint: string;
  /** Dark shade that passes AA contrast on `tint` — use for small text. */
  deep: string;
};

export type CategoryDef = {
  slug: string;
  number: string;
  name: string;
  /** Short label for tight spaces (pills, dial). */
  short: string;
  tagline: string;
  description: string;
  preview: PreviewType;
  palette: CategoryPalette;
};

export const CATEGORIES = [
  {
    slug: "images",
    number: "01",
    name: "Images",
    short: "Images",
    tagline: "Stills, edits & before/after",
    description:
      "Prompts for image models — photography, illustration, product shots and edits, shown with the results they produce.",
    preview: "image",
    palette: { accent: "#E5561F", title: "#E5561F", tint: "#FDEDE5", deep: "#A93C0E" },
  },
  {
    slug: "video",
    number: "02",
    name: "Video",
    short: "Video",
    tagline: "Scenes, shots & camera moves",
    description:
      "Prompts for text-to-video and image-to-video models, with camera direction, pacing and lighting spelled out.",
    preview: "video",
    palette: { accent: "#2A80EB", title: "#2A80EB", tint: "#E4F0FD", deep: "#11549F" },
  },
  {
    slug: "motion",
    number: "03",
    name: "Motion graphics",
    short: "Motion",
    tagline: "Loops, logos & kinetic type",
    description:
      "Prompts for animated loops, logo reveals and kinetic typography — previews play right in the card.",
    preview: "video",
    palette: { accent: "#7B4DF0", title: "#7B4DF0", tint: "#EFE8FE", deep: "#5226BD" },
  },
  {
    slug: "ui",
    number: "04",
    name: "UI components",
    short: "UI",
    tagline: "Live, working components",
    description:
      "Prompts that generate interface components. Every result is a live, working preview you can resize and inspect.",
    preview: "ui",
    palette: { accent: "#F2B81F", title: "#A67700", tint: "#FDF5DA", deep: "#7A5700" },
  },
  {
    slug: "documents",
    number: "05",
    name: "Documents & PDFs",
    short: "Docs",
    tagline: "Proposals, resumes & one-pagers",
    description:
      "Prompts for structured documents — proposals, resumes, briefs and one-pagers — previewed page by page.",
    preview: "document",
    palette: { accent: "#E5484D", title: "#E5484D", tint: "#FCE6E6", deep: "#A82025" },
  },
  {
    slug: "reports",
    number: "06",
    name: "Reports & data",
    short: "Reports",
    tagline: "Analysis, dashboards & summaries",
    description:
      "Prompts that turn raw data into reports, summaries and dashboards — with sample pages to flip through.",
    preview: "document",
    palette: { accent: "#1C9660", title: "#1C9660", tint: "#E2F5EB", deep: "#106A42" },
  },
  {
    slug: "writing",
    number: "07",
    name: "Writing & copy",
    short: "Writing",
    tagline: "Copy, scripts & long-form",
    description:
      "Prompts for landing-page copy, scripts, emails and long-form writing, shown with a sample output.",
    preview: "text",
    palette: { accent: "#DD4387", title: "#DD4387", tint: "#FCE7F0", deep: "#A3215A" },
  },
  {
    slug: "code",
    number: "08",
    name: "Code & dev",
    short: "Code",
    tagline: "Refactors, tests & tooling",
    description:
      "Prompts for coding assistants — refactors, tests, reviews and scripts — with the code they return.",
    preview: "code",
    palette: { accent: "#0F9592", title: "#0F9592", tint: "#DFF5F4", deep: "#0A6966" },
  },
] as const satisfies readonly CategoryDef[];

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as CategorySlug[];

const bySlug = new Map<string, CategoryDef>(CATEGORIES.map((c) => [c.slug, c]));

export function getCategoryDef(slug: string): CategoryDef | undefined {
  return bySlug.get(slug);
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return bySlug.has(slug);
}

/**
 * CSS custom properties for a category palette. Components spread this
 * into `style` and use `bg-(--tint)`, `text-(--deep)` etc.
 */
export function paletteVars(palette: CategoryPalette): React.CSSProperties {
  return {
    "--accent": palette.accent,
    "--title": palette.title,
    "--tint": palette.tint,
    "--deep": palette.deep,
  } as React.CSSProperties;
}
