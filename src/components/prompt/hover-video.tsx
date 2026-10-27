"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Source = { src: string; type: string };

/**
 * A muted loop that loads and plays only while its card is hovered or focused
 * (the nearest `[data-hover-root]`). The poster underneath is a regular image,
 * so nothing is downloaded until someone shows interest.
 */
export function HoverVideo({
  src,
  type,
  fallback,
  className,
}: Source & { fallback?: Source; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const wantPlay = useRef(false);

  useEffect(() => {
    const video = ref.current;
    const root = video?.closest("[data-hover-root]");
    if (!video || !root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const play = () => {
      if (reduce.matches) return;
      wantPlay.current = true;
      setArmed(true);
      if (video.currentSrc) void video.play().catch(() => {});
    };
    const stop = () => {
      wantPlay.current = false;
      video.pause();
    };
    root.addEventListener("pointerenter", play);
    root.addEventListener("pointerleave", stop);
    root.addEventListener("focusin", play);
    root.addEventListener("focusout", stop);
    return () => {
      root.removeEventListener("pointerenter", play);
      root.removeEventListener("pointerleave", stop);
      root.removeEventListener("focusin", play);
      root.removeEventListener("focusout", stop);
      video.pause();
    };
  }, []);

  // Sources are added on first interest; load() picks the first playable one.
  useEffect(() => {
    const v = ref.current;
    if (!armed || !v) return;
    v.load();
    if (wantPlay.current) void v.play().catch(() => {});
  }, [armed]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
        playing ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {armed ? (
        <>
          <source src={src} type={type} />
          {fallback ? <source src={fallback.src} type={fallback.type} /> : null}
        </>
      ) : null}
    </video>
  );
}
