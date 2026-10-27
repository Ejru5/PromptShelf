import { getAllPrompts, getCollections } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";

/** Static search index for the ⌘K palette (prerendered at build time). */
export async function GET() {
  return Response.json(buildSearchIndex(await getAllPrompts(), await getCollections()));
}
