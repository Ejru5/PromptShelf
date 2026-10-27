"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import type { CategoryPalette } from "@/config/categories";
import { paletteVars } from "@/config/categories";
import type { Thumb } from "@/lib/content";
import { cn } from "@/lib/cn";
import { ThumbFan } from "../prompt/thumb";
import { Annotation } from "../ui/annotation";

export type DialShelf = {
  slug: string;
  number: string;
  name: string;
  short: string;
  tagline: string;
  count: number;
  palette: CategoryPalette;
  thumbs: Thumb[];
};

/** Degrees between neighbouring shelves on the arc. */
const STEP = 15;
const AUTO_MS = 4200;
const mod = (a: number, n: number) => ((a % n) + n) % n;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * WOVE-style category dial: shelves sit on a large arc and rotate into place.
 * Turn it by dragging, clicking a shelf, the arrow keys or the buttons; it
 * auto-advances until someone interacts (never with reduced motion).
 */
export function ShelfDial({ shelves }: { shelves: DialShelf[] }) {
  const n = shelves.length;
  // Keep the previous position too, so items that wrap around the ring can skip their transition.
  const [{ pos, prev }, setPosState] = useState({ pos: 0, prev: 0 });
  const setPos = (fn: (p: number) => number) =>
    setPosState((s) => ({ pos: fn(s.pos), prev: s.pos }));
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [auto, setAuto] = useState(true);
  const [radius, setRadius] = useState(520);
  const reduced = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const start = useRef<{ y: number; moved: boolean } | null>(null);
  const active = mod(pos, n);
  const current = shelves[active];

  // Radius follows the panel height so the arc always fills it nicely.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setRadius(Math.round(entry.contentRect.height * 0.88)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || reduced) return;
    const id = window.setInterval(() => setPos((p) => p + 1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [auto, reduced]);

  // Stop auto-rotation when the route is hidden (Activity) and resume fresh.
  useLayoutEffect(() => () => setAuto(true), []);

  const offsetAt = (i: number, at: number) => {
    const d = mod(i - at, n);
    return d > n / 2 ? d - n : d;
  };
  const offsets = shelves.map((_, i) => offsetAt(i, pos));
  // Items that wrap from one end of the arc to the other shouldn't sweep across it.
  const jumped = offsets.map((d, i) => d !== offsetAt(i, prev) - (pos - prev));

  const go = (delta: number, focus = false) => {
    setAuto(false);
    setPos((p) => p + delta);
    if (focus) {
      requestAnimationFrame(() => buttons.current[mod(pos + delta, n)]?.focus());
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      go(1, true);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1, true);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { y: e.clientY, moved: false };
    setAuto(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dy = e.clientY - start.current.y;
    if (!start.current.moved && Math.abs(dy) < 6) return;
    if (!start.current.moved) {
      start.current.moved = true;
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setDrag((dy / radius) * (180 / Math.PI));
  };
  const endDrag = () => {
    if (!start.current) return;
    if (start.current.moved) {
      const steps = Math.round(-drag / STEP);
      setPos((p) => p + steps);
      setDrag(0);
      setDragging(false);
    }
    start.current = null;
  };

  return (
    <div
      ref={panel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onMouseEnter={() => setAuto(false)}
      className={cn(
        "relative h-[600px] touch-pan-x overflow-hidden rounded-card bg-[#ebe9e4] paper-grain select-none",
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
      style={{ "--r": `${radius}px` } as React.CSSProperties}
    >
      {/* the arc: centre sits left of the panel so only its right edge shows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 rounded-full border border-ink/15"
        style={{
          width: radius * 2,
          height: radius * 2,
          left: `calc(46% - ${radius * 2}px)`,
          transform: "translateY(-50%)",
        }}
      />

      {/* active shelf preview, inside the circle */}
      <div
        key={current.slug}
        style={paletteVars(current.palette)}
        className="absolute top-1/2 left-6 flex w-[34%] -translate-y-1/2 animate-pop-in flex-col items-center gap-5"
      >
        <ThumbFan thumbs={current.thumbs} className="aspect-square w-full" sizes="160px" />
        <Link
          href={`/shelves/${current.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink shadow-soft transition-shadow hover:shadow-lift"
        >
          Open {current.short} · {current.count}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {/* shelves on the arc */}
      <div
        role="radiogroup"
        aria-label="Shelves"
        onKeyDown={onKeyDown}
        className="pointer-events-none absolute inset-0"
      >
        {shelves.map((s, i) => {
          const d = offsets[i];
          const angle = d * STEP + drag;
          const dist = Math.abs(angle / STEP);
          const isActive = i === active;
          return (
            <div
              key={s.slug}
              style={{
                ...paletteVars(s.palette),
                left: "46%",
                top: "50%",
                transformOrigin: "0 0",
                transform: `translateX(${-radius}px) rotate(${angle}deg) translateX(${radius}px)`,
                opacity: dist >= 3 ? 0 : Math.max(0, 1 - dist * 0.2),
                transition:
                  dragging || jumped[i] || reduced
                    ? "none"
                    : "transform 700ms cubic-bezier(.22,1,.36,1), opacity 450ms ease",
              }}
              className="absolute"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-0 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors",
                  isActive ? "bg-accent ring-4 ring-accent/20" : "bg-ink/60",
                )}
              />
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={`${s.number} ${s.name}, ${s.count} prompts`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => {
                  if (start.current?.moved) return;
                  if (!isActive) go(d);
                }}
                className="pointer-events-auto absolute top-0 left-6 flex -translate-y-1/2 items-center gap-5 rounded-xl text-left whitespace-nowrap focus-visible:outline-offset-8"
              >
                <span
                  className={cn(
                    "font-numeric text-[2.75rem] leading-none font-bold transition-colors",
                    isActive ? "text-ink" : "text-ink/70",
                  )}
                >
                  {s.number}
                </span>
                <span className="flex flex-col">
                  <span
                    className={cn(
                      "text-[2.125rem] leading-none font-semibold tracking-[-0.035em] transition-colors duration-300",
                      isActive ? "text-title" : "text-ink/55",
                    )}
                  >
                    {s.name}
                  </span>
                  <span
                    className={cn(
                      "mt-1.5 text-sm transition-colors",
                      isActive ? "text-ink-2" : "text-ink/60",
                    )}
                  >
                    {s.tagline}
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="absolute right-5 bottom-5 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={(e) => (e.stopPropagation(), go(-1))}
          className="grid size-9 place-items-center rounded-full bg-paper/80 text-ink-2 shadow-soft transition hover:bg-paper hover:text-ink"
          aria-label="Previous shelf"
        >
          <ChevronUp className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={(e) => (e.stopPropagation(), go(1))}
          className="grid size-9 place-items-center rounded-full bg-paper/80 text-ink-2 shadow-soft transition hover:bg-paper hover:text-ink"
          aria-label="Next shelf"
        >
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>
      </div>

      <Annotation
        direction="left"
        arrowPosition="before"
        className="absolute top-8 right-10"
        tilt={4}
      >
        drag to turn the dial
      </Annotation>
      <p className="absolute bottom-6 left-6 font-numeric text-xs text-ink-3" aria-live="polite">
        {current.number} / {String(n).padStart(2, "0")}
      </p>
    </div>
  );
}

/** Phone/tablet version: a horizontal snap strip of the same shelves. */
export function ShelfStrip({ shelves }: { shelves: DialShelf[] }) {
  return (
    <ul className="-mx-4 scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
      {shelves.map((s) => (
        <li
          key={s.slug}
          className="w-[72%] shrink-0 snap-start sm:w-[42%]"
          style={paletteVars(s.palette)}
        >
          <Link
            href={`/shelves/${s.slug}`}
            className="flex h-full flex-col rounded-card bg-tint p-4 transition-[filter] active:brightness-95"
          >
            <ThumbFan thumbs={s.thumbs} className="aspect-[5/4] w-full" sizes="140px" />
            <span className="mt-4 flex items-baseline gap-3">
              <span className="font-numeric text-2xl font-bold text-ink">{s.number}</span>
              <span className="text-xl font-bold tracking-tight text-title">{s.name}</span>
            </span>
            <span className="mt-1 text-sm text-deep">
              {s.tagline} · {s.count}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
