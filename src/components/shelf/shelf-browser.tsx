"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { X } from "lucide-react";
import type { PreviewType } from "@/config/categories";
import type { PromptCard as CardData } from "@/lib/content";
import { cn } from "@/lib/cn";
import { ShelfGrid } from "./shelf-grid";
import { EmptyState } from "../ui/feedback";

const SORTS = { new: "Newest", old: "Oldest", az: "A–Z" } as const;
type Sort = keyof typeof SORTS;
const LEVELS = ["beginner", "intermediate", "advanced"] as const;

/**
 * Filters (model, level) and sort for a shelf, stored in the URL so views are
 * shareable: /shelves/images?model=Midjourney+v7&sort=az
 */
export function ShelfBrowser({ cards, preview }: { cards: CardData[]; preview: PreviewType }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const models = params.getAll("model");
  const level = params.get("level") ?? "";
  const sort = (params.get("sort") as Sort) in SORTS ? (params.get("sort") as Sort) : "new";

  const allModels = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cards) for (const m of c.models) counts.set(m, (counts.get(m) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [cards]);

  const shown = useMemo(() => {
    const list = cards.filter(
      (c) =>
        (models.length === 0 || models.some((m) => c.models.includes(m))) &&
        (!level || c.difficulty === level),
    );
    if (sort === "old") list.sort((a, b) => a.created.localeCompare(b.created));
    else if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [cards, models, level, sort]);

  function update(mutate: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params);
    mutate(next);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const toggleModel = (m: string) =>
    update((p) => {
      const current = p.getAll("model");
      p.delete("model");
      for (const x of current.includes(m) ? current.filter((x) => x !== m) : [...current, m]) {
        p.append("model", x);
      }
    });

  const filtered = models.length > 0 || Boolean(level);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-center">
        <div
          className="scrollbar-none flex min-w-0 flex-1 items-center gap-2 overflow-x-auto"
          role="group"
          aria-label="Filter by model"
        >
          <span className="shrink-0 text-xs text-ink-3">Model</span>
          {allModels.map(([m, n]) => {
            const on = models.includes(m);
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                onClick={() => toggleModel(m)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                  on
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-ink-2 hover:border-line-2 hover:text-ink",
                )}
              >
                {m}
                <span
                  className={cn(
                    "font-numeric text-[0.625rem]",
                    on ? "text-paper/60" : "text-ink-3",
                  )}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-3">
            Level
            <select
              value={level}
              onChange={(e) =>
                update((p) => (e.target.value ? p.set("level", e.target.value) : p.delete("level")))
              }
              className="h-8 rounded-full border border-line bg-paper px-3 text-xs text-ink"
            >
              <option value="">Any</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l[0].toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-3">
            Sort
            <select
              value={sort}
              onChange={(e) =>
                update((p) =>
                  e.target.value === "new" ? p.delete("sort") : p.set("sort", e.target.value),
                )
              }
              className="h-8 rounded-full border border-line bg-paper px-3 text-xs text-ink"
            >
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between text-sm" aria-live="polite">
        <p className="text-ink-2">
          <span className="font-numeric text-ink">{shown.length}</span> of {cards.length} prompts
        </p>
        {filtered ? (
          <button
            type="button"
            onClick={() => update((p) => (p.delete("model"), p.delete("level")))}
            className="inline-flex items-center gap-1 text-ink-2 hover:text-ink"
          >
            <X className="size-3.5" aria-hidden="true" /> Clear filters
          </button>
        ) : null}
      </div>

      {shown.length ? (
        // Filtered lists lose the bento rhythm's meaning, so keep the same grid but re-flowed.
        <ShelfGrid cards={shown} preview={preview} />
      ) : (
        <EmptyState
          title="Nothing matches those filters"
          action={
            <button
              type="button"
              onClick={() => update((p) => (p.delete("model"), p.delete("level")))}
              className="rounded-full bg-ink px-4 py-2 text-sm text-paper"
            >
              Clear filters
            </button>
          }
        >
          Try another model or level — or browse a different shelf.
        </EmptyState>
      )}
    </>
  );
}
