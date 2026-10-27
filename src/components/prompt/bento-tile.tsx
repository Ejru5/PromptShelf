import Link from "next/link";
import { Play } from "lucide-react";
import { getCategoryDef, paletteVars } from "@/config/categories";
import type { PromptCard as CardData } from "@/lib/content";
import { cn } from "@/lib/cn";
import { CardMeta, promptHref } from "./prompt-card";
import { SaveButton } from "../saved/save-button";
import { HoverVideo } from "./hover-video";
import { Morph } from "./morph";
import { ResultImage } from "./result-image";

/** Full-bleed gallery tile (Photo Gallery reference) with the caption on a scrim. */
export function BentoTile({
  card,
  morph = true,
  sizes,
  preload,
  className,
}: {
  card: CardData;
  morph?: boolean;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  const cat = getCategoryDef(card.category)!;
  return (
    <Morph slug={card.slug} enabled={morph}>
      <article
        data-hover-root
        style={paletteVars(cat.palette)}
        className={cn(
          "group relative isolate min-h-0 overflow-hidden rounded-[18px] bg-tint shadow-soft transition-shadow duration-300 hover:shadow-lift",
          className,
        )}
      >
        {card.cover && cat.preview === "document" ? (
          // Pages don't crop well — show the page as paper lying on the tint.
          <div className="absolute inset-0 grid place-items-center pb-10">
            <div className="relative aspect-[210/297] h-[82%] rotate-[-3deg] overflow-hidden rounded-[3px] shadow-cover transition-transform duration-500 ease-(--ease-spring) group-hover:-translate-y-1.5 group-hover:rotate-0">
              <ResultImage
                media={card.cover}
                alt=""
                fill
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="object-top"
              />
            </div>
          </div>
        ) : card.cover ? (
          <ResultImage
            media={card.cover}
            alt=""
            fill
            sizes={sizes}
            preload={preload}
            className={cn(
              "transition-transform duration-700 ease-(--ease-out-soft) group-hover:scale-[1.04]",
              cat.preview === "ui" && "object-top",
            )}
          />
        ) : null}
        {card.before ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-[clip-path] duration-700 ease-(--ease-out-soft) [clip-path:inset(0_50%_0_0)] group-hover:[clip-path:inset(0_80%_0_0)]"
          >
            <ResultImage media={card.before} alt="" fill sizes={sizes} />
            <span className="absolute inset-y-0 right-0 w-0.5 bg-paper shadow-[0_0_12px_rgb(0_0_0/0.35)]" />
          </div>
        ) : null}
        {card.video ? <HoverVideo {...card.video} /> : null}

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-4 pt-14 pb-3.5 text-white">
          <h3 className="text-[0.9375rem] leading-snug font-semibold tracking-[-0.01em] drop-shadow-sm">
            <Link
              href={promptHref(card.slug)}
              prefetch
              className="after:absolute after:inset-0 after:z-20 focus-visible:outline-none focus-visible:after:rounded-[18px] focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-white"
            >
              {card.title}
            </Link>
          </h3>
          <CardMeta card={card} className="mt-0.5 text-white/75" />
        </div>
        <SaveButton
          slug={card.slug}
          title={card.title}
          variant="card"
          className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 aria-pressed:opacity-100 [@media(hover:none)]:opacity-100"
        />
        {card.video ? (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[0.6875rem] font-medium text-white backdrop-blur">
            <Play className="size-3 fill-current" aria-hidden="true" /> Hover to play
          </span>
        ) : card.before ? (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-white/85 px-2 py-1 text-[0.6875rem] font-medium text-ink backdrop-blur">
            Before / after
          </span>
        ) : null}
      </article>
    </Morph>
  );
}

/** Repeating bento rhythm for a 4-column grid (dense flow fills the gaps). */
const SPANS = [
  "col-span-2 row-span-2",
  "col-span-1 lg:row-span-2",
  "col-span-1",
  "col-span-1",
  "col-span-2",
  "col-span-1 lg:col-span-2",
];

export function BentoGrid({ cards, className }: { cards: CardData[]; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-flow-dense auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[210px] lg:auto-rows-[240px] lg:grid-cols-4",
        className,
      )}
    >
      {cards.map((card, i) => (
        <BentoTile
          key={card.slug}
          card={card}
          preload={i === 0}
          className={SPANS[i % SPANS.length]}
          sizes={
            i % SPANS.length === 0
              ? "(min-width: 1024px) 50vw, 100vw"
              : "(min-width: 1024px) 25vw, 50vw"
          }
        />
      ))}
    </div>
  );
}
