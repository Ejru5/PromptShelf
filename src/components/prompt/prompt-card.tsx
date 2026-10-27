import Link from "next/link";
import { Play } from "lucide-react";
import { FolderTabCard } from "@/components/ui/folder-tab";
import { getCategoryDef, paletteVars } from "@/config/categories";
import type { Media } from "@/content/schema";
import type { PromptCard as CardData } from "@/lib/content";
import { cn } from "@/lib/cn";
import { SaveButton } from "../saved/save-button";
import { HoverVideo } from "./hover-video";
import { Morph } from "./morph";
import { ResultImage } from "./result-image";

export const promptHref = (slug: string) => `/p/${slug}`;

function modelsLabel(models: string[]) {
  return models.length > 1 ? `${models[0]} +${models.length - 1}` : models[0];
}

/** "Midjourney v7 +2 · Free · 2 blanks" — the Paper Store-style status line. */
export function CardMeta({ card, className }: { card: CardData; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-1.5 text-xs text-ink-3", className)}>
      <span>{modelsLabel(card.models)}</span>
      <span aria-hidden="true">·</span>
      <span className={card.access === "premium" ? "font-medium text-ink" : undefined}>
        {card.access === "premium" ? "Premium" : "Free"}
      </span>
      {card.blankCount > 0 ? (
        <>
          <span aria-hidden="true">·</span>
          <span>
            {card.blankCount} blank{card.blankCount > 1 ? "s" : ""}
          </span>
        </>
      ) : null}
    </p>
  );
}

function StretchedTitle({ card, className }: { card: CardData; className?: string }) {
  return (
    <h3 className={cn("text-[0.9375rem] leading-snug font-semibold tracking-[-0.01em]", className)}>
      <Link
        href={promptHref(card.slug)}
        prefetch
        className="after:absolute after:inset-0 after:z-20 after:rounded-[inherit] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ink"
      >
        {card.title}
      </Link>
    </h3>
  );
}

// ---------------------------------------------------------------- image / video

/** Photo Gallery-style tile: rounded media on top, caption below. */
export function MediaCard({
  card,
  morph = true,
  aspect = "aspect-[4/3]",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  preload,
  className,
}: {
  card: CardData;
  morph?: boolean;
  aspect?: string;
  sizes?: string;
  preload?: boolean;
  className?: string;
}) {
  const cat = getCategoryDef(card.category)!;
  return (
    <article
      data-hover-root
      className={cn("group relative flex flex-col rounded-[20px]", className)}
      style={paletteVars(cat.palette)}
    >
      <Morph slug={card.slug} enabled={morph}>
        <div
          className={cn(
            "relative isolate overflow-hidden rounded-[20px] bg-tint shadow-soft transition-shadow duration-300 group-hover:shadow-lift",
            aspect,
          )}
        >
          {card.cover ? (
            card.before ? (
              <BeforeAfterThumb
                before={card.before}
                after={card.cover}
                sizes={sizes}
                alt={card.title}
              />
            ) : (
              <ResultImage
                media={card.cover}
                alt=""
                fill
                sizes={sizes}
                preload={preload}
                className="transition-transform duration-700 ease-(--ease-out-soft) group-hover:scale-[1.03]"
              />
            )
          ) : null}
          {card.video ? <HoverVideo {...card.video} /> : null}
          {card.video ? (
            <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-[0.6875rem] font-medium text-paper backdrop-blur">
              <Play className="size-3 fill-current" aria-hidden="true" />
              <span>Hover to play</span>
            </span>
          ) : null}
          {card.before ? (
            <span className="absolute top-3 left-3 z-10 rounded-full bg-paper/85 px-2 py-1 text-[0.6875rem] font-medium text-ink backdrop-blur">
              Before / after
            </span>
          ) : null}
        </div>
      </Morph>
      <div className="px-1 pt-3">
        <StretchedTitle card={card} />
        <CardMeta card={card} className="mt-1" />
      </div>
    </article>
  );
}

function BeforeAfterThumb({
  before,
  after,
  sizes,
  alt,
}: {
  before: Media;
  after: Media;
  sizes: string;
  alt: string;
}) {
  return (
    <>
      <ResultImage media={after} alt={alt} fill sizes={sizes} />
      <div
        className="absolute inset-0 transition-[clip-path] duration-700 ease-(--ease-out-soft) [clip-path:inset(0_50%_0_0)] group-hover:[clip-path:inset(0_78%_0_0)]"
        aria-hidden="true"
      >
        <ResultImage media={before} alt="" fill sizes={sizes} />
      </div>
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-0.5 bg-paper shadow-[0_0_12px_rgb(0_0_0/0.35)] transition-[left] duration-700 ease-(--ease-out-soft) group-hover:left-[22%]"
      />
    </>
  );
}

// ---------------------------------------------------------------- ui

export function UiCard({
  card,
  morph = true,
  className,
}: {
  card: CardData;
  morph?: boolean;
  className?: string;
}) {
  const cat = getCategoryDef(card.category)!;
  return (
    <FolderTabCard
      palette={cat.palette}
      title={card.title}
      href={promptHref(card.slug)}
      mediaLayout="full"
      className={className}
      eyebrow={<span className="font-numeric">Live preview</span>}
      media={
        <Morph slug={card.slug} enabled={morph}>
          <div className="overflow-hidden rounded-inner border border-line bg-canvas">
            <div
              className="flex items-center gap-1.5 border-b border-line bg-paper px-3 py-2"
              aria-hidden="true"
            >
              <span className="size-2 rounded-full bg-[#ff5f57]" />
              <span className="size-2 rounded-full bg-[#febc2e]" />
              <span className="size-2 rounded-full bg-[#28c840]" />
            </div>
            <div className="relative aspect-[16/10] overflow-hidden">
              {card.cover ? (
                <ResultImage
                  media={card.cover}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-top transition-transform duration-700 ease-(--ease-out-soft) group-hover/card:scale-[1.03]"
                />
              ) : null}
            </div>
          </div>
        </Morph>
      }
      footer={<CardMeta card={card} className="text-deep" />}
    >
      {card.summary}
    </FolderTabCard>
  );
}

// ---------------------------------------------------------------- documents & reports

/** Paper Store-style: meta on top, the page as an object on a tinted desk, summary below. */
export function DocCard({
  card,
  morph = true,
  className,
}: {
  card: CardData;
  morph?: boolean;
  className?: string;
}) {
  const cat = getCategoryDef(card.category)!;
  return (
    <article
      className={cn("group relative flex flex-col", className)}
      style={paletteVars(cat.palette)}
    >
      <StretchedTitle card={card} />
      <CardMeta card={card} className="mt-0.5 mb-3" />
      <Morph slug={card.slug} enabled={morph}>
        <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[20px] bg-tint px-[14%] pt-[10%]">
          {card.pageCount && card.pageCount > 1 ? (
            <span
              aria-hidden="true"
              className="absolute top-[12%] left-1/2 aspect-[210/297] w-[62%] -translate-x-[42%] rotate-[5deg] rounded-[3px] bg-paper shadow-cover transition-transform duration-500 ease-(--ease-spring) group-hover:rotate-[9deg]"
            />
          ) : null}
          {card.cover ? (
            <div className="relative aspect-[210/297] w-[72%] self-start overflow-hidden rounded-[3px] shadow-cover transition-transform duration-500 ease-(--ease-spring) group-hover:-translate-y-2 group-hover:-rotate-2">
              <ResultImage
                media={card.cover}
                alt=""
                fill
                sizes="(min-width: 1024px) 22vw, 60vw"
                className="object-top"
              />
            </div>
          ) : null}
          {card.pageCount ? (
            <span className="absolute right-3 bottom-3 rounded-full bg-paper/90 px-2 py-0.5 font-numeric text-[0.6875rem] text-deep">
              {card.pageCount} page{card.pageCount > 1 ? "s" : ""} · PDF
            </span>
          ) : null}
        </div>
      </Morph>
      <p className="mt-3 line-clamp-2 text-sm text-ink-3">{card.summary}</p>
    </article>
  );
}

// ---------------------------------------------------------------- writing

export function TextCard({ card, className }: { card: CardData; className?: string }) {
  const cat = getCategoryDef(card.category)!;
  return (
    <FolderTabCard
      palette={cat.palette}
      title={card.title}
      href={promptHref(card.slug)}
      className={className}
      eyebrow="Sample output"
      media={
        <div
          className="relative aspect-[4/3] rotate-[3deg] overflow-hidden rounded-[6px] bg-paper p-3 shadow-cover"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent_0_17px,var(--tint)_17px_18px)] opacity-90" />
          <p className="relative line-clamp-6 font-serif text-[0.6875rem] leading-[18px] text-ink-2">
            {card.snippet}
          </p>
        </div>
      }
      footer={<CardMeta card={card} className="text-deep" />}
    >
      {card.summary}
    </FolderTabCard>
  );
}

// ---------------------------------------------------------------- code

export function CodeCard({ card, className }: { card: CardData; className?: string }) {
  const cat = getCategoryDef(card.category)!;
  return (
    <FolderTabCard
      palette={cat.palette}
      title={card.title}
      href={promptHref(card.slug)}
      className={className}
      eyebrow="Returns code"
      media={
        <div
          className="aspect-[4/3] -rotate-[2deg] overflow-hidden rounded-[10px] bg-[#16181d] p-3 shadow-cover"
          aria-hidden="true"
        >
          <div className="mb-2 flex gap-1">
            <span className="size-1.5 rounded-full bg-[#ff5f57]" />
            <span className="size-1.5 rounded-full bg-[#febc2e]" />
            <span className="size-1.5 rounded-full bg-[#28c840]" />
          </div>
          <pre className="font-mono text-[0.5625rem] leading-[1.55] whitespace-pre text-[#c8d3f5]">
            {card.snippet}
          </pre>
        </div>
      }
      footer={<CardMeta card={card} className="text-deep" />}
    >
      {card.summary}
    </FolderTabCard>
  );
}

/** Picks the card style that suits the prompt's shelf, with a save button on top. */
export function PromptCard({
  card,
  morph = true,
  className,
}: {
  card: CardData;
  /** Shared-element transition to the detail page (turn off where a prompt may repeat). */
  morph?: boolean;
  className?: string;
}) {
  const preview = getCategoryDef(card.category)?.preview;
  const inner =
    preview === "ui" ? (
      <UiCard card={card} morph={morph} />
    ) : preview === "document" ? (
      <DocCard card={card} morph={morph} />
    ) : preview === "text" ? (
      <TextCard card={card} />
    ) : preview === "code" ? (
      <CodeCard card={card} />
    ) : (
      <MediaCard card={card} morph={morph} />
    );
  return (
    <div className={cn("group/save relative", className)}>
      {inner}
      <SaveButton
        slug={card.slug}
        title={card.title}
        variant="card"
        className={cn(
          "absolute right-3 z-30 opacity-0 group-hover/save:opacity-100 focus-visible:opacity-100 aria-pressed:opacity-100 [@media(hover:none)]:opacity-100",
          preview === "document" ? "top-14" : "top-3",
        )}
      />
    </div>
  );
}
