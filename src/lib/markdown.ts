import { Marked } from "marked";

const marked = new Marked({ gfm: true, breaks: false });

/**
 * Render sample-output markdown to HTML. Content comes from the owner's own
 * content folder (trusted, built at deploy time), never from visitors.
 */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false });
}
