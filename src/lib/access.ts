/**
 * Access control — ready for a paid plan, inactive today.
 *
 * Everything is free right now, so `getViewer()` always returns an anonymous
 * free viewer. To launch Premium: set a prompt/collection to `access: premium`,
 * implement `getViewer()` from your auth session (see docs/PAID.md), and the
 * gating below already does the rest — premium text is redacted on the server.
 */
import type { Prompt } from "@/content/schema";

export type Plan = "free" | "pro";
export type Viewer = { id: string | null; plan: Plan };

export const ANONYMOUS: Viewer = { id: null, plan: "free" };

/** Who is looking? Replace with a session lookup when accounts exist. */
export async function getViewer(): Promise<Viewer> {
  return ANONYMOUS;
}

export function canAccess(item: { access: "free" | "premium" }, viewer: Viewer): boolean {
  return item.access === "free" || viewer.plan === "pro";
}

/** Public-safe copy of a premium prompt: results stay (they're the proof), the prompt text doesn't. */
export function redactPrompt(prompt: Prompt): Prompt {
  const words = prompt.template.split(/\s+/).slice(0, 12).join(" ");
  return {
    ...prompt,
    template: `${words} …`,
    excerpt: prompt.summary,
    notes: [],
  };
}

/** Text that's safe to show anywhere (cards, search, OG) for this prompt. */
export const publicExcerpt = (p: Pick<Prompt, "access" | "excerpt" | "summary">) =>
  p.access === "premium" ? p.summary : p.excerpt;
