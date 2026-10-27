import { NextResponse, type NextRequest } from "next/server";
import { CATEGORY_SLUGS } from "@/config/categories";
import slugs from "@/content/.generated/slugs.json";

/**
 * Return a real 404 status for unknown slugs.
 *
 * With Cache Components the static shell streams before `params` resolve,
 * so `notFound()` inside the page can only render the 404 UI with a 200
 * status. Checking known slugs here, before rendering, keeps the status honest.
 */
const KNOWN: Record<string, ReadonlySet<string>> = {
  shelves: new Set(CATEGORY_SLUGS),
  p: new Set(slugs.prompts),
  collections: new Set(slugs.collections),
};

export function proxy(request: NextRequest) {
  // In dev the content watcher adds prompts while the server runs; the page's own
  // notFound() handles unknown slugs there, so skip the (possibly stale) list.
  if (process.env.NODE_ENV === "development") return NextResponse.next();
  const [, section, slug] = request.nextUrl.pathname.split("/");
  const known = KNOWN[section];
  if (known && slug && !known.has(decodeURIComponent(slug))) {
    // Rewriting to a path with no route renders not-found.tsx with a 404 status.
    return NextResponse.rewrite(new URL("/_unknown", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/shelves/:slug", "/p/:slug", "/collections/:slug"],
};
