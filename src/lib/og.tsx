import { readFileSync } from "node:fs";
import path from "node:path";
import { cacheLife } from "next/cache";
import sharp from "sharp";
import type { Media } from "@/content/schema";

export const OG_SIZE = { width: 1200, height: 630 };

// Read synchronously at module load: async file IO would make the OG routes
// render per request under Cache Components.
const font = (file: string) =>
  readFileSync(path.join(process.cwd(), "node_modules/@fontsource", file));
const FONTS = [
  {
    name: "Inter Tight",
    data: font("inter-tight/files/inter-tight-latin-600-normal.woff"),
    weight: 600 as const,
  },
  {
    name: "Inter Tight",
    data: font("inter-tight/files/inter-tight-latin-700-normal.woff"),
    weight: 700 as const,
  },
  {
    name: "JetBrains Mono",
    data: font("jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff"),
    weight: 400 as const,
  },
].map((f) => ({ ...f, style: "normal" as const }));

export function ogFonts() {
  return FONTS;
}

/** Glyphs our OG fonts don't have (Satori would try to download a fallback). */
export function ogSafe(text: string) {
  return text.replace(/⌘/g, "Cmd ").replace(/[→↗↘]/g, "");
}

/** A built result image as a PNG data URL sized for OG cards (cached — it's pure for a given file). */
export async function mediaDataUrl(media: Media, width = 620): Promise<string | null> {
  "use cache";
  cacheLife("max");
  try {
    const file = path.join(process.cwd(), "public", media.src);
    const png = await sharp(file).resize({ width, withoutEnlargement: true }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}
