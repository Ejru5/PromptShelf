import Link from "next/link";
import { CATEGORIES, paletteVars } from "@/config/categories";
import { cn } from "@/lib/cn";

/** Horizontal strip of all shelves with WOVE-style numbers; the current one is highlighted. */
export function ShelfSwitcher({ current, className }: { current?: string; className?: string }) {
  return (
    <nav
      aria-label="All shelves"
      className={cn("-mx-4 scrollbar-none overflow-x-auto px-4 sm:mx-0 sm:px-0", className)}
    >
      <ul className="flex gap-2">
        {CATEGORIES.map((c) => {
          const on = c.slug === current;
          return (
            <li key={c.slug} style={paletteVars(c.palette)}>
              <Link
                href={`/shelves/${c.slug}`}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm whitespace-nowrap transition-colors",
                  on
                    ? "bg-tint font-medium text-deep"
                    : "bg-paper/60 text-ink-2 hover:bg-paper hover:text-ink",
                )}
              >
                <span className="font-numeric text-xs font-bold">{c.number}</span>
                {c.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
