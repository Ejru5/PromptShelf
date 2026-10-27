/**
 * Helpers for generating seed (placeholder) result media.
 * These scripts are optional dev tools — the app never runs them.
 */
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { chromium, type Browser } from "@playwright/test";
import sharp from "sharp";

export const run = promisify(execFile);
export const ROOT = process.cwd();
export const promptDir = (category: string, slug: string) =>
  path.join(ROOT, "content", "prompts", category, slug);

let browser: Browser | undefined;
export async function getBrowser() {
  browser ??= await chromium.launch();
  return browser;
}
export async function closeBrowser() {
  await browser?.close();
  browser = undefined;
}

/** Deterministic PRNG so re-running seeds gives identical media. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const GRAIN_FILTER = `
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="n"/>
  <feColorMatrix type="saturate" values="0"/>
  <feComponentTransfer><feFuncA type="table" tableValues="0 0.09"/></feComponentTransfer>
</filter>`;

export function svgPage(width: number, height: number, inner: string, extraHead = "") {
  return `<!doctype html><html><head><meta charset="utf-8">${extraHead}
<style>html,body{margin:0;padding:0;background:#000}svg{display:block}</style></head>
<body><svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${inner}</svg></body></html>`;
}

export const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=Newsreader:opsz,wght@6..72,400;6..72,600&family=JetBrains+Mono:wght@400;600&display=block" rel="stylesheet">`;

/** Render an HTML page to a JPEG (or WebP/PNG by extension). */
export async function renderHtmlToImage(
  html: string,
  out: string,
  width: number,
  height: number,
  opts: { scale?: number; quality?: number } = {},
) {
  const b = await getBrowser();
  const page = await b.newPage({
    viewport: { width, height },
    deviceScaleFactor: opts.scale ?? 1,
  });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const png = await page.screenshot({ type: "png" });
  await page.close();
  await fs.mkdir(path.dirname(out), { recursive: true });
  const img = sharp(png);
  if (out.endsWith(".webp")) await img.webp({ quality: opts.quality ?? 84 }).toFile(out);
  else if (out.endsWith(".png")) await img.png().toFile(out);
  else await img.jpeg({ quality: opts.quality ?? 86, mozjpeg: true }).toFile(out);
  console.log(`  ✓ ${path.relative(ROOT, out)}`);
}

/**
 * Render an animated canvas page to MP4. The page must define
 * `window.draw(t)` where t is seconds; frames are pulled as JPEG data URLs.
 */
export async function renderCanvasVideo(
  html: string,
  out: string,
  {
    width,
    height,
    seconds,
    fps = 24,
    posterAt = 1 / 3,
  }: { width: number; height: number; seconds: number; fps?: number; posterAt?: number },
) {
  const b = await getBrowser();
  const page = await b.newPage({ viewport: { width, height } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "seed-frames-"));
  const frames = Math.round(seconds * fps);
  for (let i = 0; i < frames; i++) {
    const data = await page.evaluate(
      ([t]) => {
        (window as unknown as { draw: (t: number) => void }).draw(t);
        return (document.querySelector("canvas") as HTMLCanvasElement).toDataURL(
          "image/jpeg",
          0.92,
        );
      },
      [i / fps],
    );
    await fs.writeFile(
      path.join(tmp, `f${String(i).padStart(4, "0")}.jpg`),
      Buffer.from(data.split(",")[1], "base64"),
    );
  }
  await page.close();
  await fs.mkdir(path.dirname(out), { recursive: true });
  await run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-framerate",
    String(fps),
    "-i",
    path.join(tmp, "f%04d.jpg"),
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "26",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    out,
  ]);
  // WebM/VP9 twin for browsers without H.264 (the content build picks it up automatically).
  await run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-i",
    out,
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "0",
    "-crf",
    "38",
    "-row-mt",
    "1",
    "-an",
    out.replace(/\.mp4$/, ".webm"),
  ]);
  // Poster from a representative frame (default ~1/3 in, not frame 0).
  const posterFrame = path.join(
    tmp,
    `f${String(Math.floor(frames * posterAt)).padStart(4, "0")}.jpg`,
  );
  await sharp(posterFrame)
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(out.replace(/\.mp4$/, ".poster.jpg"));
  await fs.rm(tmp, { recursive: true, force: true });
  console.log(`  ✓ ${path.relative(ROOT, out)} (${frames} frames)`);
}

/** Render `.page` elements of an HTML document to page images + a PDF. */
export async function renderDocument(
  html: string,
  dir: string,
  { pdf = true, scale = 1.5 }: { pdf?: boolean; scale?: number } = {},
) {
  const b = await getBrowser();
  const page = await b.newPage({
    viewport: { width: 900, height: 1200 },
    deviceScaleFactor: scale,
  });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  const pages = page.locator(".page");
  const count = await pages.count();
  const names: string[] = [];
  await fs.mkdir(dir, { recursive: true });
  for (let i = 0; i < count; i++) {
    const png = await pages.nth(i).screenshot({ type: "png" });
    const name = `page-${i + 1}.jpg`;
    await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(dir, name));
    names.push(name);
  }
  if (pdf) {
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: path.join(dir, "document.pdf"),
      width: "210mm",
      height: "297mm",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
  }
  await page.close();
  console.log(
    `  ✓ ${path.relative(ROOT, dir)} (${count} page${count > 1 ? "s" : ""}${pdf ? " + pdf" : ""})`,
  );
  return names;
}
