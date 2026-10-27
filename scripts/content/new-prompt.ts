/**
 * Scaffold a new prompt folder.
 *
 *   npm run new-prompt
 *   npm run new-prompt -- --shelf images --title "Neon portrait" --models "Midjourney v7, Flux 1.1 Pro"
 *
 * Flags: --shelf, --title, --models (comma-separated), --type (result type), --yes (no questions)
 */
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { parseArgs } from "node:util";
import { CATEGORIES } from "../../src/config/categories";
import { DEFAULT_RESULT, RESULT_TYPES, scaffoldPrompt, slugify, type ResultType } from "./scaffold";

async function main() {
  const { values } = parseArgs({
    options: {
      shelf: { type: "string" },
      title: { type: "string" },
      models: { type: "string" },
      type: { type: "string" },
      yes: { type: "boolean", default: false },
    },
  });

  const rl = values.yes ? null : readline.createInterface({ input, output });
  const ask = async (q: string, fallback?: string) => {
    if (!rl) return fallback ?? "";
    const a = (await rl.question(fallback ? `${q} (${fallback}): ` : `${q}: `)).trim();
    return a || fallback || "";
  };

  let shelf = values.shelf;
  if (!shelf) {
    console.log("\nShelves:");
    CATEGORIES.forEach((c) => console.log(`  ${c.number}  ${c.slug.padEnd(10)} ${c.name}`));
    const pick = await ask("\nShelf (slug or number)", "images");
    shelf = CATEGORIES.find((c) => c.slug === pick || c.number === pick.padStart(2, "0"))?.slug;
  }
  if (!shelf || !CATEGORIES.some((c) => c.slug === shelf)) {
    console.error(`✗ Unknown shelf "${shelf}". Use one of: ${CATEGORIES.map((c) => c.slug).join(", ")}`);
    process.exit(1);
  }

  const title = values.title ?? (await ask("Title"));
  if (!title) {
    console.error("✗ A title is required.");
    process.exit(1);
  }
  const models = (values.models ?? (await ask("Models (comma-separated)", "Claude")))
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  const type = (values.type ?? (await ask(`Result type (${RESULT_TYPES.join(" | ")})`, DEFAULT_RESULT[shelf]))) as ResultType;
  if (!RESULT_TYPES.includes(type)) {
    console.error(`✗ Unknown result type "${type}".`);
    process.exit(1);
  }
  rl?.close();

  const slug = slugify(title);
  const dir = path.join(process.cwd(), "content", "prompts", shelf, slug);
  if (existsSync(dir)) {
    console.error(`✗ ${path.relative(process.cwd(), dir)} already exists.`);
    process.exit(1);
  }
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, "prompt.md");
  await fs.writeFile(file, scaffoldPrompt({ shelf, title, models, resultType: type }));

  const rel = path.relative(process.cwd(), file);
  console.log(`
✓ Created ${rel}

Next:
  1. Write the prompt text and summary in ${rel}
  2. Drop your result file(s) into ${path.relative(process.cwd(), dir)}/ and uncomment the results example
  3. Run "npm run content" (or keep "npm run dev" running) — it validates everything
  4. Open http://localhost:3000/p/${slug}
`);
}

void main();
