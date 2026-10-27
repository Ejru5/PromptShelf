/**
 * Pure helpers that generate starter files for new prompts and collections.
 * Used by scripts/content/new-prompt.ts and new-collection.ts (and tested).
 */
import { CATEGORIES } from "../../src/config/categories";

export const RESULT_TYPES = ["image", "before-after", "video", "ui", "document", "text", "code"] as const;
export type ResultType = (typeof RESULT_TYPES)[number];

/** Which result type suits each shelf by default. */
export const DEFAULT_RESULT: Record<string, ResultType> = {
  images: "image",
  video: "video",
  motion: "video",
  ui: "ui",
  documents: "document",
  reports: "document",
  writing: "text",
  code: "code",
};

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

const today = () => new Date().toISOString().slice(0, 10);
const yamlString = (s: string) => (/[:#'"{}[\],&*?|<>=!%@`]/.test(s) || /^\s|\s$/.test(s) ? JSON.stringify(s) : s);

/** Commented example for each result type — uncomment once the file is in the folder. */
const RESULT_EXAMPLE: Record<ResultType, string> = {
  image: `#  - type: image
#    file: result.jpg            # put the image next to this file
#    alt: Describe what the image shows
#    model: Midjourney v7
#    caption: variation name     # optional, shown on the result tab`,
  "before-after": `#  - type: before-after
#    before: before.jpg
#    after: after.jpg
#    alt: Describe the change
#    beforeLabel: Before
#    afterLabel: After`,
  video: `#  - type: video
#    file: clip.mp4              # add clip.webm too for browsers without H.264
#    alt: Describe the motion
#    model: Veo 3`,
  ui: `#  - type: ui
#    file: component.html        # a self-contained HTML file (CSS + JS inline)
#    height: 520                 # preview height in px
#    alt: Describe the component`,
  document: `#  - type: document
#    pages: [page-1.jpg, page-2.jpg]   # page images, in order
#    pdf: document.pdf                 # optional download
#    alt: Describe the document`,
  text: `#  - type: text
#    file: output.md             # the model's answer, as Markdown
#    model: Claude`,
  code: `#  - type: code
#    file: output.ts             # language comes from the extension
#    filename: example.ts        # optional label in the code header
#    model: Claude`,
};

export function scaffoldPrompt({
  shelf,
  title,
  models,
  resultType = DEFAULT_RESULT[shelf] ?? "image",
  date = today(),
}: {
  shelf: string;
  title: string;
  models: string[];
  resultType?: ResultType;
  date?: string;
}): string {
  if (!CATEGORIES.some((c) => c.slug === shelf)) throw new Error(`Unknown shelf "${shelf}"`);
  return `---
# ── Required ────────────────────────────────────────────────
title: ${yamlString(title)}
summary: One sentence on what this prompt makes and why it's good.
category: ${shelf}
models: [${models.map(yamlString).join(", ")}]
created: ${date}

# ── Optional ────────────────────────────────────────────────
tags: []                 # e.g. [portrait, cinematic]
difficulty: beginner     # beginner | intermediate | advanced
access: free             # free | premium (premium is gated — see docs/PAID.md)
featured: false          # true = eligible for the home page "Featured" grid

# Shown in the details table, e.g. Aspect ratio: "3:2"
settings: {}

# Each {{blank}} in the prompt below can have a label, default, placeholder,
# options (a dropdown) and a hint. Blanks without config still work.
blanks:
  subject:
    label: Subject
    default: a red fox

# Short tips shown under the details table.
notes: []

# Results — the proof. Put the files in this folder, then uncomment:
results: []
${RESULT_EXAMPLE[resultType]}
---
Write your prompt here. Use {{subject}} for anything people should fill in.
`;
}

export function scaffoldCollection({
  title,
  prompts,
  color = "#E5561F",
}: {
  title: string;
  prompts: string[];
  color?: string;
}): string {
  return `---
title: ${yamlString(title)}
description: One or two sentences on who this pack is for.
color: "${color}"        # cover colour
art: orbits              # orbits | stack | grid | wave | spark | frames
access: free
featured: false
order: 100               # lower comes first
prompts:
${(prompts.length ? prompts : ["golden-hour-desert-portrait"]).map((p) => `  - ${p}`).join("\n")}
---
`;
}
