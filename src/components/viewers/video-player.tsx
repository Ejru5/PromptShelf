"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/**
 * Silent result clip: autoplays (muted, looping) while on screen, pauses when
 * scrolled away or when the route is hidden. Reduced-motion users press play.
 */
export function VideoPlayer({
  src,
  type,
  poster,
  width,
  height,
  label,
  duration,
  fallback,
}: {
  src: string;
  type: string;
  fallback?: { src: string; type: string };
  poster?: string;
  width: number;
  height: number;
  label: string;
  duration?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduce && !userPaused.current) void v.play().catch(() => {});
        if (!entry.isIntersecting) v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.pause();
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      void v.play();
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-card bg-ink shadow-soft">
      <video
        ref={ref}
        poster={poster}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={toggle}
        className="block h-auto w-full cursor-pointer"
      >
        <source src={src} type={type} />
        {fallback ? <source src={fallback.src} type={fallback.type} /> : null}
      </video>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent p-3 pt-10">
        <button
          type="button"
          onClick={toggle}
          className="pointer-events-auto grid size-10 place-items-center rounded-full bg-paper/90 text-ink shadow-pop backdrop-blur transition-transform hover:scale-105"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <Pause className="size-4 fill-current" />
          ) : (
            <Play className="size-4 translate-x-px fill-current" />
          )}
        </button>
        <span className="rounded-full bg-black/45 px-2.5 py-1 font-numeric text-xs text-white backdrop-blur">
          {duration ? `${duration}s loop` : "Loop"} · no sound
        </span>
      </div>
    </div>
  );
}
