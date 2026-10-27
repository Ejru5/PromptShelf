import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BookCover } from "@/components/ui/book-cover";
import { CategoryTag, Tag } from "@/components/ui/pill";
import { SpecTable, type SpecItem } from "@/components/ui/spec-table";
import { getCategoryDef, paletteVars } from "@/config/categories";
import type { Collection, Prompt } from "@/content/schema";
import { thumbOf } from "@/lib/content";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { PromptCard } from "../prompt-card";
import { toCard } from "@/lib/content";
import { PremiumGate } from "./premium-gate";
import { PromptWorkbench } from "./prompt-workbench";
import { RelatedShelf, type RelatedItem } from "./related-shelf";
import { ResultStage } from "./result-stage";

const DIFFICULTY = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

export function PromptDetail({
  prompt,
  locked = false,
  related,
  prev,
  next,
  collections,
  shelfMates,
}: {
  prompt: Prompt;
  /** Premium prompt without access: `prompt` is already redacted. */
  locked?: boolean;
  related: Prompt[];
  prev: Prompt | null;
  next: Prompt | null;
  collections: Collection[];
  shelfMates: Prompt[];
}) {
  const cat = getCategoryDef(prompt.category)!;
  const specs: SpecItem[] = [
    { label: "Shelf", value: cat.name },
    { label: "Works with", value: prompt.models.join(", ") },
    ...prompt.settings.map((s) => ({ label: s.label, value: s.value })),
    { label: "Blanks", value: prompt.blanks.length ? String(prompt.blanks.length) : "None" },
    { label: "Level", value: DIFFICULTY[prompt.difficulty] },
    { label: "Updated", value: formatDate(prompt.updated) },
    { label: "Access", value: prompt.access === "premium" ? "Premium" : "Free" },
  ];
  // Live UI previews need the width; everything else sits beside the info column.
  const wide = cat.preview === "ui";
  const relatedItems: RelatedItem[] = related.map((p) => {
    const c = getCategoryDef(p.category)!;
    return {
      slug: p.slug,
      title: p.title,
      shelf: c.short,
      thumb: thumbOf(p),
      tint: c.palette.tint,
    };
  });

  return (
    <main
      style={paletteVars(cat.palette)}
      className="mx-auto w-full max-w-[1320px] px-4 pt-6 sm:px-6 lg:px-10"
    >
      <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-4 text-sm">
        <ol className="flex min-w-0 items-center gap-2 text-ink-3">
          <li>
            <Link href="/shelves" className="hover:text-ink">
              Shelves
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/shelves/${cat.slug}`} className="hover:text-ink">
              <span className="mr-1.5 text-xs tabular-nums">{cat.number}</span>
              {cat.name}
            </Link>
          </li>
          <li aria-hidden="true" className="hidden sm:block">
            /
          </li>
          <li className="hidden truncate text-ink sm:block" aria-current="page">
            {prompt.title}
          </li>
        </ol>
        <div className="flex shrink-0 items-center gap-1">
          {prev ? (
            <Link
              href={`/p/${prev.slug}`}
              className="grid size-9 place-items-center rounded-full bg-paper shadow-soft transition-shadow hover:shadow-lift"
              aria-label={`Previous: ${prev.title}`}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
          {next ? (
            <Link
              href={`/p/${next.slug}`}
              className="grid size-9 place-items-center rounded-full bg-paper shadow-soft transition-shadow hover:shadow-lift"
              aria-label={`Next: ${next.title}`}
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </nav>

      <div className="mt-6 flex gap-10">
        <div
          className={cn(
            "grid min-w-0 flex-1 gap-10 lg:gap-12",
            !wide && "lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]",
          )}
        >
          <section
            aria-label="Results"
            className={cn("min-w-0 self-start", !wide && "lg:sticky lg:top-20")}
          >
            <ResultStage prompt={prompt} />
          </section>

          <section
            aria-labelledby="prompt-title"
            className={cn(
              "min-w-0",
              wide && "lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12",
            )}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryTag slug={prompt.category} />
                <Tag>{DIFFICULTY[prompt.difficulty]}</Tag>
              </div>
              <h1
                id="prompt-title"
                className="mt-4 font-serif text-heading font-semibold text-balance-safe"
              >
                {prompt.title}
              </h1>
              <p className="mt-3 text-xs tracking-[0.12em] text-ink-3 uppercase">
                for <span className="font-semibold text-ink">{prompt.models.join(", ")}</span>
              </p>
              <p className="mt-5 font-serif text-[1.1875rem] leading-relaxed text-ink-2 italic">
                {prompt.summary}
              </p>

              <div className="mt-10">
                {locked ? (
                  <PremiumGate teaser={prompt.template} blankCount={prompt.blanks.length} />
                ) : (
                  <PromptWorkbench
                    slug={prompt.slug}
                    title={prompt.title}
                    template={prompt.template}
                    blanks={prompt.blanks}
                    models={prompt.models}
                  />
                )}
              </div>
            </div>
            <div className="min-w-0">
              <SpecTable items={specs} className={wide ? "mt-8 lg:mt-0" : "mt-8"} />

              {prompt.notes.length ? (
                <div className="mt-8">
                  <h2 className="mb-3 flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">
                    Tips
                    <span
                      aria-hidden="true"
                      className="font-hand text-lg tracking-normal text-deep normal-case"
                    >
                      from the shelf ↘
                    </span>
                  </h2>
                  <ul className="grid gap-2">
                    {prompt.notes.map((n) => (
                      <li
                        key={n}
                        className="flex gap-3 rounded-inner bg-tint/60 px-4 py-3 text-sm text-ink-2"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                        />
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {prompt.tags.length ? (
                <div className="mt-8 flex flex-wrap gap-2">
                  {prompt.tags.map((t) => (
                    <Tag key={t}>#{t}</Tag>
                  ))}
                </div>
              ) : null}

              {collections.length ? (
                <div className="mt-10 border-t border-line pt-6">
                  <h2 className="mb-4 text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">
                    Found in
                  </h2>
                  <ul className="flex flex-wrap gap-4">
                    {collections.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/collections/${c.slug}`}
                          className="group flex items-center gap-3"
                        >
                          <BookCover color={c.color} bare className="w-10 shadow-soft" />
                          <span className="text-sm font-medium group-hover:underline">
                            {c.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <RelatedShelf items={relatedItems} />
      </div>

      {shelfMates.length ? (
        <section aria-labelledby="more-from" className="mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2
              id="more-from"
              className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-none font-semibold tracking-[-0.035em]"
            >
              More from <span className="text-title">{cat.name}</span>
            </h2>
            <Link
              href={`/shelves/${cat.slug}`}
              className="shrink-0 text-sm text-ink-2 hover:text-ink"
            >
              View shelf →
            </Link>
          </div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {shelfMates.slice(0, 3).map((p) => (
              <PromptCard key={p.slug} card={toCard(p)} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
