/**
 * Build the content bundle.
 *
 *   content/prompts/<shelf>/<slug>/prompt.md   frontmatter + prompt template
 *   content/prompts/<shelf>/<slug>/*            result files (images, video, html, md, code)
 *   content/collections/<slug>.md              collection frontmatter
 *
 * Validates everything, copies media to public/results/<slug>/, measures images,
 * makes blur placeholders, renders UI thumbnails, and writes
 * src/content/.generated/{content,slugs}.json.
 *
 * Usage: npm run content            (once)
 *        npm run content -- --watch (rebuild on change)
 */
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, watch } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import {
  CollectionFrontmatter,
  PromptFrontmatter,
  type Blank,
  type Collection,
  type ContentBundle,
  type Media,
  type Prompt,
  type Result,
  type SourceResult,
} from "../../src/content/schema";
import { blankNames, humanizeBlank, parseTemplate } from "../../src/lib/prompt-template";

const run = promisify(execFile);

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const PROMPTS_DIR = path.join(CONTENT, "prompts");
const COLLECTIONS_DIR = path.join(CONTENT, "collections");
const PUBLIC_RESULTS = path.join(ROOT, "public", "results");
const GENERATED = path.join(ROOT, "src", "content", ".generated");
const CACHE_FILE = path.join(CONTENT, ".media-cache.json");

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CODE_LANGS: Record<string, string> = {
  ts: "ts",
  tsx: "tsx",
  js: "js",
  jsx: "jsx",
  py: "python",
  sql: "sql",
  sh: "bash",
  css: "css",
  html: "html",
  json: "json",
  go: "go",
  rs: "rust",
  yml: "yaml",
  yaml: "yaml",
  md: "markdown",
};

// ---------------------------------------------------------------- cache

type CacheEntry = {
  hash: string;
  width?: number;
  height?: number;
  blur?: string;
  duration?: number;
};
type Cache = Record<string, CacheEntry>;

let cache: Cache = {};
let cacheDirty = false;

async function loadCache() {
  try {
    cache = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
  } catch {
    cache = {};
  }
}

async function saveCache() {
  if (!cacheDirty) return;
  const sorted = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(CACHE_FILE, JSON.stringify(sorted, null, 2) + "\n");
  cacheDirty = false;
}

async function hashFile(file: string) {
  return createHash("sha1").update(await fs.readFile(file)).digest("hex").slice(0, 16);
}

const cacheKey = (abs: string) => path.relative(ROOT, abs).split(path.sep).join("/");

// ---------------------------------------------------------------- errors

class ContentError extends Error {}

function fail(file: string, message: string): never {
  throw new ContentError(`${path.relative(ROOT, file)}: ${message}`);
}

function formatZod(file: string, error: z.ZodError) {
  return error.issues
    .map((i) => `${path.relative(ROOT, file)}: ${i.path.join(".") || "(root)"} — ${i.message}`)
    .join("\n");
}

// ---------------------------------------------------------------- frontmatter

function splitFrontmatter(file: string, raw: string) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) fail(file, "missing YAML frontmatter (--- ... ---) at the top of the file");
  let data: unknown;
  try {
    data = parseYaml(m[1]) ?? {};
  } catch (e) {
    fail(file, `invalid YAML: ${(e as Error).message}`);
  }
  return { data, body: m[2] };
}

// ---------------------------------------------------------------- media

async function copyIfChanged(src: string, dest: string) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  try {
    const [a, b] = await Promise.all([fs.stat(src), fs.stat(dest)]);
    if (a.size === b.size && a.mtimeMs <= b.mtimeMs) return;
  } catch {
    /* dest missing */
  }
  await fs.copyFile(src, dest);
}

function requireFile(promptFile: string, dir: string, name: string) {
  const abs = path.resolve(dir, name);
  if (!abs.startsWith(path.resolve(dir) + path.sep)) {
    fail(promptFile, `result file "${name}" must live inside the prompt folder`);
  }
  if (!existsSync(abs)) fail(promptFile, `result file "${name}" not found next to prompt.md`);
  return abs;
}

async function imageMedia(abs: string, slug: string): Promise<Media> {
  const key = cacheKey(abs);
  const hash = await hashFile(abs);
  let entry = cache[key];
  if (!entry || entry.hash !== hash || !entry.width || !entry.blur) {
    const img = sharp(abs);
    const meta = await img.metadata();
    const blurBuf = await sharp(abs).resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
    entry = {
      hash,
      width: meta.width,
      height: meta.height,
      blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
    };
    cache[key] = entry;
    cacheDirty = true;
  }
  const name = path.basename(abs);
  await copyIfChanged(abs, path.join(PUBLIC_RESULTS, slug, name));
  return {
    src: `/results/${slug}/${name}`,
    width: entry.width!,
    height: entry.height!,
    blurDataURL: entry.blur,
  };
}

async function hasBinary(bin: string) {
  try {
    await run(bin, ["-version"]);
    return true;
  } catch {
    return false;
  }
}

let ffmpegAvailable: boolean | undefined;
async function ffmpegReady() {
  ffmpegAvailable ??= (await hasBinary("ffprobe")) && (await hasBinary("ffmpeg"));
  return ffmpegAvailable;
}

async function videoMeta(promptFile: string, abs: string) {
  const key = cacheKey(abs);
  const hash = await hashFile(abs);
  const entry = cache[key];
  if (entry?.hash === hash && entry.width) return entry;
  if (!(await ffmpegReady())) {
    fail(promptFile, `can't read video size for ${path.basename(abs)} — install ffmpeg and run "npm run content" locally`);
  }
  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height:format=duration",
    "-of",
    "json",
    abs,
  ]);
  const info = JSON.parse(stdout);
  const next: CacheEntry = {
    hash,
    width: info.streams?.[0]?.width,
    height: info.streams?.[0]?.height,
    duration: info.format?.duration ? Math.round(Number(info.format.duration) * 10) / 10 : undefined,
  };
  cache[key] = next;
  cacheDirty = true;
  return next;
}

/** Use the given poster, or `<video>.poster.jpg`, or extract frame 0 into the prompt folder. */
async function videoPoster(promptFile: string, dir: string, file: string, poster?: string) {
  if (poster) return requireFile(promptFile, dir, poster);
  const auto = path.join(dir, `${file.replace(/\.[^.]+$/, "")}.poster.jpg`);
  if (existsSync(auto)) return auto;
  if (!(await ffmpegReady())) return undefined;
  await run("ffmpeg", ["-y", "-v", "error", "-i", path.join(dir, file), "-frames:v", "1", "-q:v", "3", auto]);
  return auto;
}

// UI thumbnails are rendered with Playwright and written back next to the .html
// (so they're committed and CI doesn't need a browser).
type Browser = { newPage: (o: object) => Promise<unknown>; close: () => Promise<void> };
let browserPromise: Promise<Browser | null> | undefined;
async function getBrowser(): Promise<Browser | null> {
  browserPromise ??= (async () => {
    try {
      const { chromium } = await import("@playwright/test");
      return (await chromium.launch()) as unknown as Browser;
    } catch {
      return null;
    }
  })();
  return browserPromise;
}

async function uiThumbnail(promptFile: string, htmlAbs: string, height: number) {
  const thumb = htmlAbs.replace(/\.html$/i, ".thumb.webp");
  // Separate key: imageMedia() caches the thumbnail file's own metadata under cacheKey(thumb).
  const key = `${cacheKey(thumb)}#render`;
  const hash = `${await hashFile(htmlAbs)}:${height}`;
  if (existsSync(thumb) && cache[key]?.hash === hash) return thumb;

  const browser = await getBrowser();
  if (!browser) {
    if (existsSync(thumb)) {
      console.warn(`⚠ ${path.relative(ROOT, htmlAbs)} changed but no browser to re-render its thumbnail`);
      return thumb;
    }
    return undefined;
  }
  // Minimal structural typing so this file doesn't depend on Playwright types at runtime.
  const page = (await browser.newPage({
    viewport: { width: 1200, height },
    deviceScaleFactor: 1,
  })) as {
    setContent: (h: string, o: object) => Promise<void>;
    waitForTimeout: (ms: number) => Promise<void>;
    screenshot: (o: object) => Promise<Buffer>;
    close: () => Promise<void>;
  };
  await page.setContent(await fs.readFile(htmlAbs, "utf8"), { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  const png = await page.screenshot({ type: "png" });
  await page.close();
  await sharp(png).resize(960).webp({ quality: 82 }).toFile(thumb);
  cache[key] = { hash };
  cacheDirty = true;
  void promptFile;
  return thumb;
}

// ---------------------------------------------------------------- results

async function resolveResult(
  promptFile: string,
  dir: string,
  slug: string,
  r: SourceResult,
): Promise<Result> {
  const base = { caption: r.caption, model: r.model, placeholder: r.placeholder };
  switch (r.type) {
    case "image":
      return {
        kind: "image",
        image: await imageMedia(requireFile(promptFile, dir, r.file), slug),
        alt: r.alt,
        ...base,
      };
    case "before-after":
      return {
        kind: "before-after",
        before: await imageMedia(requireFile(promptFile, dir, r.before), slug),
        after: await imageMedia(requireFile(promptFile, dir, r.after), slug),
        alt: r.alt,
        beforeLabel: r.beforeLabel,
        afterLabel: r.afterLabel,
        ...base,
      };
    case "video": {
      const abs = requireFile(promptFile, dir, r.file);
      const meta = await videoMeta(promptFile, abs);
      await copyIfChanged(abs, path.join(PUBLIC_RESULTS, slug, r.file));
      const posterAbs = await videoPoster(promptFile, dir, r.file, r.poster);
      // Optional sibling encoding: clip.mp4 + clip.webm → both offered as <source>s.
      const altName = r.file.endsWith(".mp4") ? r.file.replace(/\.mp4$/i, ".webm") : undefined;
      let fallback: { src: string; type: string } | undefined;
      if (altName && existsSync(path.join(dir, altName))) {
        await copyIfChanged(path.join(dir, altName), path.join(PUBLIC_RESULTS, slug, altName));
        fallback = { src: `/results/${slug}/${altName}`, type: "video/webm" };
      }
      return {
        kind: "video",
        video: {
          src: `/results/${slug}/${r.file}`,
          width: meta.width!,
          height: meta.height!,
          type: r.file.endsWith(".webm") ? "video/webm" : "video/mp4",
          duration: meta.duration,
          fallback,
        },
        poster: posterAbs ? await imageMedia(posterAbs, slug) : undefined,
        alt: r.alt,
        ...base,
      };
    }
    case "ui": {
      const abs = requireFile(promptFile, dir, r.file);
      const html = await fs.readFile(abs, "utf8");
      if (!/<\/?(html|body|div|main|section)/i.test(html)) fail(promptFile, `${r.file} doesn't look like HTML`);
      const thumb = await uiThumbnail(promptFile, abs, r.height);
      return {
        kind: "ui",
        html,
        height: r.height,
        thumbnail: thumb ? await imageMedia(thumb, slug) : undefined,
        alt: r.alt,
        ...base,
      };
    }
    case "document": {
      const pages = [];
      for (const p of r.pages) pages.push(await imageMedia(requireFile(promptFile, dir, p), slug));
      let pdf: string | undefined;
      if (r.pdf) {
        await copyIfChanged(requireFile(promptFile, dir, r.pdf), path.join(PUBLIC_RESULTS, slug, r.pdf));
        pdf = `/results/${slug}/${r.pdf}`;
      }
      return { kind: "document", pages, pdf, alt: r.alt, ...base };
    }
    case "text":
      return {
        kind: "text",
        markdown: (await fs.readFile(requireFile(promptFile, dir, r.file), "utf8")).trim(),
        ...base,
      };
    case "code": {
      const abs = requireFile(promptFile, dir, r.file);
      const ext = path.extname(r.file).slice(1).toLowerCase();
      return {
        kind: "code",
        code: (await fs.readFile(abs, "utf8")).replace(/\s+$/, ""),
        language: r.language ?? CODE_LANGS[ext] ?? "text",
        filename: r.filename,
        ...base,
      };
    }
  }
}

function coverOf(result: Result | undefined): Media | null {
  if (!result) return null;
  switch (result.kind) {
    case "image":
      return result.image;
    case "before-after":
      return result.after;
    case "video":
      return result.poster ?? null;
    case "ui":
      return result.thumbnail ?? null;
    case "document":
      return result.pages[0];
    default:
      return null;
  }
}

function excerptOf(template: string) {
  const plain = parseTemplate(template)
    .map((s) => (s.type === "text" ? s.value : `[${humanizeBlank(s.name).toLowerCase()}]`))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 220 ? `${plain.slice(0, 217).replace(/\s+\S*$/, "")}…` : plain;
}

// ---------------------------------------------------------------- prompts

async function buildPrompt(promptFile: string): Promise<Prompt> {
  const dir = path.dirname(promptFile);
  const slug = path.basename(dir);
  const shelf = path.basename(path.dirname(dir));
  if (!SLUG_RE.test(slug)) fail(promptFile, `folder name "${slug}" must be kebab-case (a-z, 0-9, -)`);

  const { data, body } = splitFrontmatter(promptFile, await fs.readFile(promptFile, "utf8"));
  const parsed = PromptFrontmatter.safeParse(data);
  if (!parsed.success) throw new ContentError(formatZod(promptFile, parsed.error));
  const fm = parsed.data;

  if (fm.category !== shelf) {
    fail(promptFile, `category "${fm.category}" doesn't match its folder "content/prompts/${shelf}"`);
  }

  const template = body.trim();
  if (!template) fail(promptFile, "the prompt text (below the frontmatter) is empty");

  const names = blankNames(template);
  for (const key of Object.keys(fm.blanks)) {
    if (!names.includes(key)) fail(promptFile, `blanks.${key} is configured but {{${key}}} isn't in the prompt`);
  }
  const blanks: Blank[] = names.map((name) => {
    const spec = fm.blanks[name] ?? {};
    if (spec.options && spec.default && !spec.options.includes(spec.default)) {
      fail(promptFile, `blanks.${name}.default must be one of its options`);
    }
    return { name, label: spec.label ?? humanizeBlank(name), ...spec };
  });

  const results: Result[] = [];
  for (const r of fm.results) results.push(await resolveResult(promptFile, dir, slug, r));
  if (fm.results.length && fm.cover >= fm.results.length) {
    fail(promptFile, `cover: ${fm.cover} is out of range (there are ${fm.results.length} results)`);
  }

  return {
    slug,
    title: fm.title,
    summary: fm.summary,
    category: fm.category,
    models: fm.models,
    tags: fm.tags,
    difficulty: fm.difficulty,
    access: fm.access,
    featured: fm.featured,
    created: fm.created,
    updated: fm.updated ?? fm.created,
    settings: Object.entries(fm.settings).map(([label, value]) => ({ label, value: String(value) })),
    blanks,
    template,
    notes: fm.notes,
    results,
    cover: coverOf(results[fm.cover]),
    excerpt: excerptOf(template),
  };
}

async function listPromptFiles() {
  const out: string[] = [];
  if (!existsSync(PROMPTS_DIR)) return out;
  for (const shelf of (await fs.readdir(PROMPTS_DIR, { withFileTypes: true })).filter((d) => d.isDirectory())) {
    const shelfDir = path.join(PROMPTS_DIR, shelf.name);
    for (const item of await fs.readdir(shelfDir, { withFileTypes: true })) {
      if (!item.isDirectory()) continue;
      const file = path.join(shelfDir, item.name, "prompt.md");
      if (existsSync(file)) out.push(file);
      else console.warn(`⚠ ${path.relative(ROOT, path.join(shelfDir, item.name))} has no prompt.md — skipped`);
    }
  }
  return out.sort();
}

// ---------------------------------------------------------------- collections

async function buildCollections(slugs: Set<string>): Promise<Collection[]> {
  if (!existsSync(COLLECTIONS_DIR)) return [];
  const files = (await fs.readdir(COLLECTIONS_DIR)).filter((f) => f.endsWith(".md")).sort();
  const items: (Omit<Collection, "number"> & { order: number })[] = [];
  for (const f of files) {
    const file = path.join(COLLECTIONS_DIR, f);
    const slug = f.replace(/\.md$/, "");
    if (!SLUG_RE.test(slug)) fail(file, `file name "${slug}" must be kebab-case`);
    const { data } = splitFrontmatter(file, await fs.readFile(file, "utf8"));
    const parsed = CollectionFrontmatter.safeParse(data);
    if (!parsed.success) throw new ContentError(formatZod(file, parsed.error));
    for (const p of parsed.data.prompts) {
      if (!slugs.has(p)) fail(file, `prompt "${p}" doesn't exist`);
    }
    if (new Set(parsed.data.prompts).size !== parsed.data.prompts.length) {
      fail(file, "a prompt is listed twice");
    }
    items.push({ slug, ...parsed.data });
  }
  return items
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map(({ order, ...c }, i) => {
      void order; // only used for sorting
      return { ...c, number: String(i + 1).padStart(2, "0") };
    });
}

// ---------------------------------------------------------------- main

export async function buildContent({ quiet = false } = {}) {
  const started = Date.now();
  await loadCache();
  const errors: string[] = [];
  const prompts: Prompt[] = [];

  for (const file of await listPromptFiles()) {
    try {
      prompts.push(await buildPrompt(file));
    } catch (e) {
      if (e instanceof ContentError) errors.push(e.message);
      else throw e;
    }
  }

  const seen = new Map<string, number>();
  for (const p of prompts) seen.set(p.slug, (seen.get(p.slug) ?? 0) + 1);
  for (const [slug, n] of seen) if (n > 1) errors.push(`prompt slug "${slug}" is used by ${n} folders`);

  let collections: Collection[] = [];
  try {
    collections = await buildCollections(new Set(prompts.map((p) => p.slug)));
  } catch (e) {
    if (e instanceof ContentError) errors.push(e.message);
    else throw e;
  }

  const browser = browserPromise ? await browserPromise : null;
  await browser?.close();
  browserPromise = undefined;
  await saveCache();

  if (errors.length) {
    console.error(`\n✗ Content has ${errors.length} problem${errors.length > 1 ? "s" : ""}:\n`);
    for (const e of errors) console.error(`  • ${e.replace(/\n/g, "\n  • ")}`);
    console.error("");
    return false;
  }

  // Newest first is the canonical order everywhere.
  prompts.sort((a, b) => b.created.localeCompare(a.created) || a.title.localeCompare(b.title));

  const bundle: ContentBundle = { generatedAt: new Date().toISOString(), prompts, collections };
  await fs.mkdir(GENERATED, { recursive: true });
  await fs.writeFile(path.join(GENERATED, "content.json"), JSON.stringify(bundle));
  await fs.writeFile(
    path.join(GENERATED, "slugs.json"),
    JSON.stringify({ prompts: prompts.map((p) => p.slug), collections: collections.map((c) => c.slug) }),
  );

  // Remove media for prompts that no longer exist.
  if (existsSync(PUBLIC_RESULTS)) {
    const live = new Set(prompts.map((p) => p.slug));
    for (const d of await fs.readdir(PUBLIC_RESULTS)) {
      if (!live.has(d)) await fs.rm(path.join(PUBLIC_RESULTS, d), { recursive: true, force: true });
    }
  }

  if (!quiet) {
    console.log(
      `✓ Content: ${prompts.length} prompts, ${collections.length} collections (${Date.now() - started}ms)`,
    );
    const placeholders = prompts.filter((p) => p.results.some((r) => r.placeholder));
    if (placeholders.length && process.argv.includes("--placeholders")) {
      console.log(`\nPrompts still using placeholder results (${placeholders.length}):`);
      for (const p of placeholders) console.log(`  • content/prompts/${p.category}/${p.slug}`);
    } else if (placeholders.length) {
      console.log(`ℹ ${placeholders.length} prompts use placeholder results — "npm run content:placeholders" lists them`);
    }
  }
  return true;
}

async function main() {
  const ok = await buildContent();
  if (!process.argv.includes("--watch")) {
    process.exit(ok ? 0 : 1);
  }
  console.log("👀 Watching content/ for changes…");
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  watch(CONTENT, { recursive: true }, (_event, name) => {
    if (!name || name.includes(".media-cache") || /\.(thumb\.webp|poster\.jpg)$/.test(name)) return;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (running) return;
      running = true;
      await buildContent();
      running = false;
    }, 150);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
