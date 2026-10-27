import type { Thumb } from "@/lib/content";
import { cn } from "@/lib/cn";
import { ResultImage } from "./result-image";

/** One tile in a fan/stack preview: an image, a note (writing) or a code window. */
export function ThumbTile({
  thumb,
  sizes,
  className,
}: {
  thumb: Thumb;
  sizes: string;
  className?: string;
}) {
  if (thumb.kind === "image") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[14px] bg-paper p-1 shadow-cover",
          className,
        )}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[10px]">
          <ResultImage media={thumb.media} alt="" fill sizes={sizes} className="object-top" />
        </div>
      </div>
    );
  }
  if (thumb.kind === "code") {
    return (
      <div
        className={cn("overflow-hidden rounded-[12px] bg-[#16181d] p-3 shadow-cover", className)}
      >
        <pre className="font-mono text-[0.5rem] leading-[1.6] whitespace-pre text-[#c8d3f5]">
          {thumb.text}
        </pre>
      </div>
    );
  }
  return (
    <div
      className={cn("relative overflow-hidden rounded-[8px] bg-paper p-3 shadow-cover", className)}
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent_0_15px,var(--tint)_15px_16px)]" />
      <p className="relative font-serif text-[0.625rem] leading-[16px] text-ink-2">{thumb.text}</p>
    </div>
  );
}

/** Three thumbnails fanned out like cards in a hand. */
export function ThumbFan({
  thumbs,
  className,
  sizes = "200px",
}: {
  thumbs: Thumb[];
  className?: string;
  sizes?: string;
}) {
  const rot = [
    "-rotate-[9deg] -translate-x-[38%] translate-y-[6%]",
    "rotate-0 z-10",
    "rotate-[9deg] translate-x-[38%] translate-y-[6%]",
  ];
  const ordered = thumbs.length === 3 ? [thumbs[1], thumbs[0], thumbs[2]] : thumbs;
  return (
    <div className={cn("relative grid place-items-center", className)} aria-hidden="true">
      {ordered.map((t, i) => (
        <ThumbTile
          key={i}
          thumb={t}
          sizes={sizes}
          className={cn(
            "col-start-1 row-start-1 aspect-[4/5] w-[46%] transition-transform duration-500 ease-(--ease-spring)",
            ordered.length === 3 ? rot[i] : i === 0 ? "-rotate-6" : "translate-x-[30%] rotate-6",
          )}
        />
      ))}
    </div>
  );
}
