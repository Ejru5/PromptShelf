"use client";

import { useRef, useState } from "react";
import type { Media } from "@/content/schema";
import { ResultImage } from "../prompt/result-image";

/**
 * Drag (or use arrow keys on the hidden range input) to compare two images.
 * The range input is the accessible control; pointer dragging just drives it.
 */
export function BeforeAfter({
  before,
  after,
  alt,
  beforeLabel,
  afterLabel,
  preload,
}: {
  before: Media;
  after: Media;
  alt: string;
  beforeLabel: string;
  afterLabel: string;
  preload?: boolean;
}) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fromPointer = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={box}
      className="group relative touch-pan-y overflow-hidden rounded-card bg-tint shadow-soft select-none"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        fromPointer(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <ResultImage
        media={after}
        alt={alt}
        sizes="(min-width: 1024px) 50vw, 100vw"
        preload={preload}
        className="pointer-events-none h-auto w-full"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        aria-hidden="true"
      >
        <ResultImage
          media={before}
          alt=""
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="h-full w-full"
        />
      </div>

      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-paper backdrop-blur">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-paper/85 px-2.5 py-1 text-xs font-medium text-ink backdrop-blur">
        {afterLabel}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(pos)}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Compare ${beforeLabel.toLowerCase()} and ${afterLabel.toLowerCase()}`}
        aria-valuetext={`${Math.round(pos)}% ${beforeLabel.toLowerCase()}`}
        className="peer absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-paper shadow-[0_0_14px_rgb(0_0_0/0.35)] peer-focus-visible:[&>span]:ring-2"
        style={{ left: `${pos}%` }}
        aria-hidden="true"
      >
        <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink shadow-pop ring-ink ring-offset-2 transition-transform group-active:scale-95">
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M9 6l-5 6 5 6M15 6l5 6-5 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}
