"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import type { Media } from "@/content/schema";
import { ResultImage } from "../prompt/result-image";

/** A result image with a full-screen lightbox (native <dialog>: Esc and focus trap built in). */
export function ImageViewer({
  media,
  alt,
  preload,
}: {
  media: Media;
  alt: string;
  preload?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <div className="group relative overflow-hidden rounded-card bg-tint shadow-soft">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in"
        aria-label={`Enlarge image: ${alt}`}
      >
        <ResultImage
          media={media}
          alt={alt}
          sizes="(min-width: 1024px) 50vw, 100vw"
          preload={preload}
          className="h-auto w-full"
        />
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-paper/85 text-ink opacity-0 shadow-soft backdrop-blur transition-opacity group-hover:opacity-100"
      >
        <Maximize2 className="size-4" />
      </span>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        aria-label={alt}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/85 backdrop:backdrop-blur-sm"
      >
        <div className="relative">
          {open ? (
            <ResultImage
              media={media}
              alt={alt}
              sizes="100vw"
              className="h-auto max-h-[90dvh] w-auto max-w-[94vw] rounded-inner object-contain"
            />
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-paper text-ink shadow-pop"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </dialog>
    </div>
  );
}
