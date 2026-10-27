"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES, paletteVars } from "@/config/categories";
import type { PromptCard as CardData } from "@/lib/content";
import { cn } from "@/lib/cn";
import { createSearcher, type SearchIndex } from "@/lib/search";
import { PromptCard } from "../prompt/prompt-card";
import { EmptyState } from "../ui/feedback";

const SUGGESTIONS = [
  "poster",
  "pricing",
  "video loop",
  "resume",
  "report",
  "claude",
  "midjourney",
  "sql",
];

/** Full search page: query + shelf filter in the URL, results as cards. */
export function SearchResults({ index, cards }: { index: SearchIndex; cards: CardData[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlQ = params.get("q") ?? "";
  const shelf = params.get("shelf") ?? "";
  const [q, setQ] = useState(urlQ);
  const inputRef = useRef<HTMLInputElement>(null);

  const searcher = useMemo(() => createSearcher(index), [index]);
  const bySlug = useMemo(() => new Map(cards.map((c) => [c.slug, c])), [cards]);
  const hits = useMemo(
    () => searcher.search(urlQ, { shelf: shelf || undefined, limit: 60 }),
    [searcher, urlQ, shelf],
  );
  const counts = useMemo(() => {
    const all = searcher.search(urlQ, { limit: 999 });
    const m = new Map<string, number>();
    for (const h of all) m.set(h.doc.category, (m.get(h.doc.category) ?? 0) + 1);
    return { total: all.length, m };
  }, [searcher, urlQ]);

  const push = (next: { q?: string; shelf?: string }) => {
    const sp = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Debounce typing into the URL so history stays clean.
  useEffect(() => {
    if (q === urlQ) return;
    const t = setTimeout(() => push({ q }), 180);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- push reads the latest params
  }, [q]);

  return (
    <>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          push({ q });
        }}
        className="relative"
      >
        <Search
          className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-ink-3"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “poster”, “Veo 3”, “pricing table”…"
          aria-label="Search prompts"
          autoFocus
          className="h-16 w-full rounded-full bg-paper pr-14 pl-14 text-lg shadow-soft outline-none placeholder:text-ink-3 focus:shadow-lift [&::-webkit-search-cancel-button]:appearance-none"
        />
        {q ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              push({ q: "" });
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute top-1/2 right-4 grid size-9 -translate-y-1/2 place-items-center rounded-full text-ink-3 hover:bg-canvas hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </form>

      {!urlQ ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-ink-3">Popular:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQ(s);
                push({ q: s });
              }}
              className="rounded-full border border-line bg-paper/60 px-3 py-1 text-ink-2 hover:border-line-2 hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className="mt-8 scrollbar-none flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Filter by shelf"
      >
        <button
          type="button"
          aria-pressed={!shelf}
          onClick={() => push({ shelf: "" })}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-2 text-sm",
            !shelf ? "bg-ink text-paper" : "bg-paper/60 text-ink-2 hover:bg-paper",
          )}
        >
          All <span className="ml-1 font-numeric text-xs opacity-60">{counts.total}</span>
        </button>
        {CATEGORIES.map((c) => {
          const n = counts.m.get(c.slug) ?? 0;
          const on = shelf === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={on}
              disabled={n === 0 && !on}
              onClick={() => push({ shelf: on ? "" : c.slug })}
              style={paletteVars(c.palette)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-sm whitespace-nowrap transition disabled:opacity-40",
                on ? "bg-tint font-medium text-deep" : "bg-paper/60 text-ink-2 hover:bg-paper",
              )}
            >
              {c.short} <span className="ml-1 font-numeric text-xs opacity-60">{n}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 mb-6 text-sm text-ink-2" aria-live="polite">
        {urlQ ? (
          <>
            <span className="font-numeric text-ink">{hits.length}</span> result
            {hits.length === 1 ? "" : "s"} for “{urlQ}”
          </>
        ) : (
          <>
            All <span className="font-numeric text-ink">{hits.length}</span> prompts
          </>
        )}
      </p>

      <div className="min-h-[70vh]">
        {hits.length ? (
          <div className="grid items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {hits.map((h) => {
              const card = bySlug.get(h.doc.slug);
              return card ? <PromptCard key={card.slug} card={card} /> : null;
            })}
          </div>
        ) : (
          <EmptyState
            title={`Nothing on the shelf for “${urlQ}”`}
            action={
              <Link href="/shelves" className="rounded-full bg-ink px-4 py-2 text-sm text-paper">
                Browse all shelves
              </Link>
            }
          >
            Check the spelling, try a model name (like “Veo 3”), or a broader word like “video”.
          </EmptyState>
        )}
      </div>
    </>
  );
}
