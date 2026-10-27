"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { Media } from "@/content/schema";
import { cn } from "@/lib/cn";
import { ResultImage } from "../prompt/result-image";

/** Page flipper for document/report results, with thumbnails and a PDF download. */
export function DocumentViewer({
  pages,
  pdf,
  alt,
  title,
}: {
  pages: Media[];
  pdf?: string;
  alt: string;
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const go = (to: number) => {
    if (to < 0 || to >= pages.length || to === index) return;
    setDir(to > index ? 1 : -1);
    setIndex(to);
  };

  return (
    <div
      className="rounded-card bg-tint p-5 sm:p-8"
      role="region"
      aria-roledescription="document viewer"
      aria-label={`${title}, page ${index + 1} of ${pages.length}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="relative mx-auto w-full max-w-[460px]">
        {pages.length > 1 && index < pages.length - 1 ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 translate-x-2 translate-y-2 rotate-[1.5deg] rounded-[4px] bg-paper/80 shadow-soft"
          />
        ) : null}
        <div
          key={index}
          className={cn(
            "relative aspect-[210/297] overflow-hidden rounded-[4px] bg-paper shadow-cover",
            dir === 1
              ? "animate-[page-in_420ms_var(--ease-out-soft)_both]"
              : "animate-[page-back_420ms_var(--ease-out-soft)_both]",
          )}
        >
          <ResultImage
            media={pages[index]}
            alt={`${alt} — page ${index + 1}`}
            fill
            sizes="(min-width: 1024px) 460px, 90vw"
            preload={index === 0}
            className="object-top"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous page"
            className="grid size-9 place-items-center rounded-full bg-paper text-ink shadow-soft transition disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="min-w-14 text-center font-numeric text-sm text-deep" aria-live="polite">
            {index + 1} / {pages.length}
          </span>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === pages.length - 1}
            aria-label="Next page"
            className="grid size-9 place-items-center rounded-full bg-paper text-ink shadow-soft transition disabled:opacity-40"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
        {pages.length > 1 ? (
          <div className="flex gap-2" role="group" aria-label="Pages">
            {pages.map((p, i) => (
              <button
                key={p.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Page ${i + 1}`}
                aria-current={i === index ? "page" : undefined}
                className={cn(
                  "relative aspect-[210/297] w-9 overflow-hidden rounded-[2px] bg-paper ring-2 transition",
                  i === index ? "ring-deep" : "opacity-70 ring-transparent hover:opacity-100",
                )}
              >
                <ResultImage media={p} alt="" fill sizes="36px" className="object-top" />
              </button>
            ))}
          </div>
        ) : null}
        {pdf ? (
          <a
            href={pdf}
            download
            className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-xs font-medium text-paper transition hover:bg-ink/85"
          >
            <Download className="size-3.5" aria-hidden="true" /> Sample PDF
          </a>
        ) : null}
      </div>
    </div>
  );
}
