"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getCategoryDef } from "@/config/categories";
import type { PromptCard as CardData } from "@/lib/content";
import { luminance } from "@/lib/color";
import { useSaved } from "@/lib/saved";
import { PromptCard } from "../prompt/prompt-card";
import { ButtonLink } from "../ui/button";
import { EmptyState } from "../ui/feedback";

const spineHeight = (slug: string) => {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 150 + (h % 60);
};

/** The visitor's saved prompts: a literal shelf of spines, then the cards. */
export function SavedShelf({ cards }: { cards: CardData[] }) {
  const { entries, clear } = useSaved();
  const [confirming, setConfirming] = useState(false);
  const bySlug = useMemo(() => new Map(cards.map((c) => [c.slug, c])), [cards]);
  const saved = entries.map((e) => bySlug.get(e.slug)).filter((c): c is CardData => Boolean(c));

  if (saved.length === 0) {
    return (
      <EmptyState
        title="Your shelf is empty"
        action={<ButtonLink href="/shelves">Browse prompts</ButtonLink>}
        className="mt-4"
      >
        Tap the bookmark on any prompt and it&apos;ll wait for you here. Saved prompts stay in this
        browser — no account needed.
      </EmptyState>
    );
  }

  return (
    <>
      <div
        className="relative mt-4 scrollbar-none overflow-x-auto pb-6"
        aria-label="Saved prompts shelf"
      >
        <div className="flex min-w-max items-end gap-1.5 px-2">
          {saved.map((c, i) => {
            const cat = getCategoryDef(c.category)!;
            const dark = luminance(cat.palette.accent) < 0.45;
            return (
              <Link
                key={c.slug}
                href={`/p/${c.slug}`}
                title={c.title}
                className="group relative flex w-12 shrink-0 flex-col items-center justify-between rounded-t-[6px] rounded-b-[3px] py-3 shadow-cover transition-transform duration-300 ease-(--ease-spring) hover:-translate-y-3"
                style={{
                  height: spineHeight(c.slug),
                  background: cat.palette.accent,
                  color: dark ? "#fff" : "#141414",
                  rotate: i === saved.length - 1 && saved.length > 2 ? "-6deg" : undefined,
                  transformOrigin: "bottom left",
                }}
              >
                <span className="font-numeric text-[0.625rem] font-bold opacity-80">
                  {cat.number}
                </span>
                <span className="line-clamp-1 max-h-[75%] rotate-180 overflow-hidden text-xs font-semibold [writing-mode:vertical-rl]">
                  {c.title}
                </span>
                <span className="h-1 w-6 rounded-full bg-current opacity-40" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
        <div
          className="mx-0 h-3 rounded-full bg-line-2 shadow-[0_8px_16px_-8px_rgb(20_20_20/0.4)]"
          aria-hidden="true"
        />
      </div>

      <div className="mt-6 mb-8 flex items-center justify-between gap-4">
        <p className="text-sm text-ink-2">
          <span className="font-numeric text-ink">{saved.length}</span> saved prompt
          {saved.length > 1 ? "s" : ""} · on this device
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirming) {
              clear();
              setConfirming(false);
            } else {
              setConfirming(true);
              setTimeout(() => setConfirming(false), 3000);
            }
          }}
          className="rounded-full px-3 py-1.5 text-sm text-ink-2 transition hover:bg-paper hover:text-ink"
        >
          {confirming ? "Tap again to clear" : "Clear shelf"}
        </button>
      </div>

      <div className="grid items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {saved.map((c) => (
          <PromptCard key={c.slug} card={c} />
        ))}
      </div>
    </>
  );
}
