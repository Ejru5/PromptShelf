/**
 * The content build must reject bad content with clear, file-specific errors.
 * Runs the real build script against a throwaway project folder.
 */
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const run = promisify(execFile);
const SCRIPT = path.join(process.cwd(), "scripts/content/build.ts");
const TSX = path.join(process.cwd(), "node_modules/.bin/tsx");
const TSCONFIG = path.join(process.cwd(), "tsconfig.json");
let dir: string;

const fm = (fields: string, body = "Draw a {{thing}}.") => `---\n${fields}\n---\n${body}\n`;
const BASE = `summary: A perfectly reasonable summary.\nmodels: [Claude]\ncreated: 2026-10-01`;

async function write(rel: string, content: string) {
  const file = path.join(dir, rel);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

async function build() {
  try {
    const { stdout, stderr } = await run(TSX, ["--tsconfig", TSCONFIG, SCRIPT], { cwd: dir });
    return { code: 0, out: stdout + stderr };
  } catch (e) {
    const err = e as { code: number; stdout: string; stderr: string };
    return { code: err.code, out: err.stdout + err.stderr };
  }
}

beforeAll(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "promptshelf-content-"));
});
afterAll(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("content build", () => {
  it("builds valid content and writes the bundle", async () => {
    await write(
      "content/prompts/writing/good-one/prompt.md",
      fm(`title: Good one\ncategory: writing\n${BASE}\nblanks:\n  thing:\n    default: cat`),
    );
    const res = await build();
    expect(res.out).toContain("1 prompts");
    expect(res.code).toBe(0);
    const bundle = JSON.parse(
      await fs.readFile(path.join(dir, "src/content/.generated/content.json"), "utf8"),
    );
    expect(bundle.prompts[0]).toMatchObject({
      slug: "good-one",
      access: "free",
      blanks: [{ name: "thing", label: "Thing", default: "cat" }],
    });
  }, 30_000);

  it("reports every problem with its file and fails", async () => {
    await write(
      "content/prompts/images/wrong-shelf/prompt.md",
      fm(`title: Wrong shelf\ncategory: video\n${BASE}`),
    );
    await write(
      "content/prompts/writing/missing-file/prompt.md",
      fm(`title: Missing\ncategory: writing\n${BASE}\nresults:\n  - type: text\n    file: nope.md`),
    );
    await write(
      "content/prompts/writing/unused-blank/prompt.md",
      fm(`title: Unused blank\ncategory: writing\n${BASE}\nblanks:\n  colour:\n    default: red`),
    );
    await write(
      "content/prompts/writing/bad-field/prompt.md",
      fm(`title: Bad field\ncategory: writing\n${BASE}\ndifficulty: impossible`),
    );
    await write(
      "content/prompts/writing/Bad_Name/prompt.md",
      fm(`title: Bad name\ncategory: writing\n${BASE}`),
    );
    await write(
      "content/collections/broken.md",
      fm(
        `title: Broken\ndescription: Points at nothing at all.\ncolor: "#123456"\nprompts: [ghost]`,
        "",
      ),
    );

    const res = await build();
    expect(res.code).toBe(1);
    expect(res.out).toMatch(/wrong-shelf\/prompt\.md: category "video" doesn't match its folder/);
    expect(res.out).toMatch(/missing-file\/prompt\.md: result file "nope\.md" not found/);
    expect(res.out).toMatch(
      /unused-blank\/prompt\.md: blanks\.colour is configured but \{\{colour\}\} isn't in the prompt/,
    );
    expect(res.out).toMatch(/bad-field\/prompt\.md: difficulty/);
    expect(res.out).toMatch(/Bad_Name\/prompt\.md: folder name "Bad_Name" must be kebab-case/);
    expect(res.out).toMatch(/broken\.md: prompt "ghost" doesn't exist/);
  }, 30_000);
});
