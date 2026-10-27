import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { parse as parseYaml } from "yaml";
import { describe, expect, it } from "vitest";
import { scaffoldCollection, scaffoldPrompt, slugify } from "../../scripts/content/scaffold";
import { CollectionFrontmatter, PromptFrontmatter } from "@/content/schema";

const run = promisify(execFile);
const TSX = path.join(process.cwd(), "node_modules/.bin/tsx");
const TSCONFIG = path.join(process.cwd(), "tsconfig.json");
const script = (name: string) => path.join(process.cwd(), "scripts/content", name);
const frontmatter = (md: string) => parseYaml(md.split("---")[1]);

describe("slugify", () => {
  it("makes clean kebab-case slugs", () => {
    expect(slugify("Golden-hour Desert Portrait!")).toBe("golden-hour-desert-portrait");
    expect(slugify("  Café & crème  ")).toBe("cafe-and-creme");
    expect(slugify("⌘K command palette")).toBe("k-command-palette");
  });
});

describe("scaffolds", () => {
  it("prompt frontmatter is valid for every shelf", () => {
    for (const shelf of [
      "images",
      "video",
      "motion",
      "ui",
      "documents",
      "reports",
      "writing",
      "code",
    ]) {
      const md = scaffoldPrompt({
        shelf,
        title: "Test: a title with a colon",
        models: ["Claude", "Midjourney v7"],
      });
      const parsed = PromptFrontmatter.safeParse(frontmatter(md));
      expect(parsed.success, shelf).toBe(true);
      expect(md).toContain("{{subject}}");
    }
  });

  it("rejects unknown shelves", () => {
    expect(() => scaffoldPrompt({ shelf: "nope", title: "x", models: ["a"] })).toThrow(
      /Unknown shelf/,
    );
  });

  it("collection frontmatter is valid", () => {
    const parsed = CollectionFrontmatter.safeParse(
      frontmatter(scaffoldCollection({ title: "Brand kit", prompts: ["a", "b"] })),
    );
    expect(parsed.success).toBe(true);
  });

  it("CLI creates a prompt that the content build accepts", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "promptshelf-new-"));
    try {
      const { stdout } = await run(
        TSX,
        [
          "--tsconfig",
          TSCONFIG,
          script("new-prompt.ts"),
          "--shelf",
          "writing",
          "--title",
          "Product launch tweet",
          "--models",
          "Claude, ChatGPT",
          "--yes",
        ],
        { cwd: dir },
      );
      expect(stdout).toContain("content/prompts/writing/product-launch-tweet/prompt.md");
      const build = await run(TSX, ["--tsconfig", TSCONFIG, script("build.ts")], { cwd: dir });
      expect(build.stdout).toContain("1 prompts");
      const bundle = JSON.parse(
        await fs.readFile(path.join(dir, "src/content/.generated/content.json"), "utf8"),
      );
      expect(bundle.prompts[0]).toMatchObject({
        slug: "product-launch-tweet",
        models: ["Claude", "ChatGPT"],
        category: "writing",
      });

      // Running it again refuses to overwrite.
      await expect(
        run(
          TSX,
          [
            "--tsconfig",
            TSCONFIG,
            script("new-prompt.ts"),
            "--shelf",
            "writing",
            "--title",
            "Product launch tweet",
            "--yes",
          ],
          { cwd: dir },
        ),
      ).rejects.toMatchObject({ code: 1 });
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  }, 40_000);
});
