import { describe, expect, it } from "vitest";
import { highlightCode as highlight } from "@/lib/highlight";
import { renderMarkdown } from "@/lib/markdown";

describe("highlight", () => {
  it("highlights known languages and aliases", async () => {
    for (const lang of ["tsx", "ts", "typescript", "sql", "bash", "sh", "html"]) {
      const html = await highlight("const x = 1", lang);
      expect(html, lang).toMatch(/^<pre class="shiki/);
      expect(html).toContain("style=");
    }
  });

  it("falls back to plain text for unknown languages", async () => {
    const html = await highlight("hello <world>", "klingon");
    expect(html).toContain("&#x3C;world>");
  });
});

describe("renderMarkdown", () => {
  it("renders headings, bold, lists and hr", () => {
    const html = renderMarkdown("# Title\n\n**bold** text\n\n- a\n- b\n\n---");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<li>a</li>");
    expect(html).toContain("<hr>");
  });
});
