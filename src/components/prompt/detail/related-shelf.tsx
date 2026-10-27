"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import type { Thumb } from "@/lib/content";
import { cn } from "@/lib/cn";
import { ThumbTile } from "../thumb";

export type RelatedItem = {
  slug: string;
  title: string;
  shelf: string;
  thumb: Thumb | null;
  tint: string;
};

/**
 * Gestalten-style side shelf: a narrow column of related "books" with a
 * vertical "Expand shelf" tab that widens it to show titles.
 */
export function RelatedShelf({ items }: { items: RelatedItem[] }) {
  const [open, setOpen] = useState(false);
  // Collapse again when this route is hidden by Activity.
  useLayoutEffect(() => () => setOpen(false), []);
  if (items.length === 0) return null;

  return (
    <aside
      aria-label="Related prompts"
      className={cn(
        "relative hidden border-l border-line pl-5 transition-[width] duration-500 ease-(--ease-out-soft) lg:block",
        open ? "w-[340px]" : "w-[150px]",
      )}
    >
      <div className="sticky top-20 pr-8">
        <p className="mb-4 text-[0.625rem] font-semibold tracking-[0.14em] text-ink-3 uppercase">
          Related
        </p>
        <ul className="flex flex-col gap-5">
          {items.map((item) => (
            <li key={item.slug}>
              <Link href={`/p/${item.slug}`} className="group flex items-start gap-3">
                <span
                  className="grid aspect-[4/5] w-[96px] shrink-0 place-items-center rounded-[10px] p-2 transition-transform duration-300 ease-(--ease-spring) group-hover:-translate-y-1"
                  style={{ backgroundColor: item.tint }}
                >
                  {item.thumb ? (
                    <ThumbTile thumb={item.thumb} sizes="96px" className="h-full w-full" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "min-w-0 pt-1 transition-opacity duration-300",
                    open ? "opacity-100" : "pointer-events-none w-0 opacity-0",
                  )}
                >
                  <span className="block text-[0.625rem] tracking-[0.12em] text-ink-3 uppercase">
                    {item.shelf}
                  </span>
                  <span className="mt-1 block text-sm leading-snug font-medium text-ink group-hover:underline">
                    {item.title}
                  </span>
                </span>
                <span className={cn("sr-only", open && "hidden")}>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="absolute top-24 right-0 flex h-36 w-6 items-center justify-center text-[0.625rem] font-semibold tracking-[0.18em] whitespace-nowrap text-ink-2 uppercase transition-colors hover:text-ink"
      >
        <span className="rotate-90">{open ? "Collapse shelf" : "Expand shelf"}</span>
      </button>
    </aside>
  );
}
