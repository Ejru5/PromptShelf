import Link from "next/link";
import { luminance } from "@/lib/color";
import { cn } from "@/lib/cn";

/**
 * A book cover (Paper Store reference): coloured board, spine shading and a
 * hinge crease on the left, small kicker + title on top, artwork below.
 */
export function BookCover({
  color,
  kicker,
  number,
  title,
  art,
  bare = false,
  className,
}: {
  color: string;
  /** Only board, spine and art — for thumbnail-size covers. */
  bare?: boolean;
  kicker?: React.ReactNode;
  number?: string;
  title?: React.ReactNode;
  art?: React.ReactNode;
  className?: string;
}) {
  const dark = luminance(color) < 0.45;
  return (
    <div
      className={cn(
        "relative isolate aspect-[3/4] overflow-hidden rounded-l-[3px] rounded-r-cover shadow-cover",
        dark ? "text-white" : "text-ink",
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {/* artwork sits under the type */}
      {art ? <div className="absolute inset-0 -z-10">{art}</div> : null}

      <div
        className={cn(
          "flex items-start justify-between gap-2 px-[11%] pt-[9%] text-[0.5625rem] font-semibold tracking-[0.14em] uppercase opacity-80",
          bare && "hidden",
        )}
      >
        <span>{kicker ?? "Promptshelf"}</span>
        {number ? <span className="font-numeric tracking-normal">{number}</span> : null}
      </div>
      {title && !bare ? (
        <p className="mt-2 px-[11%] text-[clamp(0.9rem,0.7rem+0.6vw,1.15rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-balance-safe">
          {title}
        </p>
      ) : null}

      {/* spine shading + hinge crease + gloss */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/25 via-black/5 to-white/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[7%] w-px bg-black/15"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10"
      />
    </div>
  );
}

/** Cover + meta, like a product tile in the Paper Store reference. */
export function CoverCard({
  href,
  title,
  byline,
  status,
  description,
  cover,
  className,
}: {
  href: string;
  title: string;
  byline?: React.ReactNode;
  /** Access line — "Free" today, "Premium" / "1 credit" once paid prompts exist. */
  status?: React.ReactNode;
  description?: React.ReactNode;
  cover: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <h3 className="text-[0.9375rem] leading-snug font-semibold tracking-[-0.01em]">
        <Link
          href={href}
          className="after:absolute after:inset-0 after:z-10 focus-visible:outline-none focus-visible:after:rounded-inner focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ink"
        >
          {title}
        </Link>
      </h3>
      {byline ? <p className="text-sm text-ink-2">{byline}</p> : null}
      {status ? <p className="mb-3 text-xs text-ink-3">{status}</p> : <div className="mb-3" />}
      <div className="transition-transform duration-500 ease-(--ease-spring) group-hover:-translate-y-1.5 group-hover:-rotate-1">
        {cover}
      </div>
      {description ? <p className="mt-4 text-sm text-ink-3">{description}</p> : null}
    </article>
  );
}
