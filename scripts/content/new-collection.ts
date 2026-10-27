/**
 * Scaffold a new collection.
 *
 *   npm run new-collection -- --title "Brand kit" --prompts "swiss-style-event-poster,geometric-logo-reveal"
 */
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { scaffoldCollection, slugify } from "./scaffold";

async function main() {
  const { values } = parseArgs({
    options: { title: { type: "string" }, prompts: { type: "string" }, color: { type: "string" } },
  });

  if (!values.title) {
    console.error('✗ Usage: npm run new-collection -- --title "Brand kit" --prompts "slug-one,slug-two"');
    process.exit(1);
    }
    const slug = slugify(values.title);
  const file = path.join(process.cwd(), "content", "collections", `${slug}.md`);
  if (existsSync(file)) {
    console.error(`✗ ${path.relative(process.cwd(), file)} already exists.`);
    process.exit(1);
  }
  const prompts = (values.prompts ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, scaffoldCollection({ title: values.title, prompts, color: values.color }));
  console.log(`✓ Created ${path.relative(process.cwd(), file)} — edit it, then run "npm run content".`);
}

void main();
