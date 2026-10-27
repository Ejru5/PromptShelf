/**
 * Prompt templates use `{{name}}` placeholders ("blanks") that visitors can
 * fill in before copying. Names are letters, digits, `_` and `-`; whitespace
 * inside the braces is ignored: `{{ subject }}` === `{{subject}}`.
 */

export type TemplateSegment =
  { type: "text"; value: string } | { type: "blank"; name: string; raw: string };

const BLANK_RE = /\{\{\s*([A-Za-z][\w-]*)\s*\}\}/g;

/** Split a template into plain text and blank segments, in order. */
export function parseTemplate(template: string): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  let last = 0;
  for (const match of template.matchAll(BLANK_RE)) {
    const index = match.index;
    if (index > last) segments.push({ type: "text", value: template.slice(last, index) });
    segments.push({ type: "blank", name: match[1], raw: match[0] });
    last = index + match[0].length;
  }
  if (last < template.length) segments.push({ type: "text", value: template.slice(last) });
  return segments;
}

/** Unique blank names in order of first appearance. */
export function blankNames(template: string): string[] {
  const seen = new Set<string>();
  for (const seg of parseTemplate(template)) if (seg.type === "blank") seen.add(seg.name);
  return [...seen];
}

/**
 * Replace blanks with values. Blanks without a (non-empty) value are kept
 * as `{{name}}` so the copied prompt still shows what's missing.
 */
export function fillTemplate(template: string, values: Record<string, string | undefined>): string {
  return parseTemplate(template)
    .map((seg) => {
      if (seg.type === "text") return seg.value;
      const v = values[seg.name]?.trim();
      return v ? v : `{{${seg.name}}}`;
    })
    .join("");
}

/** Turn `camera_angle` / `camera-angle` into "Camera angle" for default labels. */
export function humanizeBlank(name: string): string {
  const words = name
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
}
