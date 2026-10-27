import { cn } from "@/lib/cn";

type Direction = "left" | "right" | "down-left" | "down-right";

const arrowTransform: Record<Direction, string> = {
  right: "",
  left: "-scale-x-100",
  "down-right": "rotate-[70deg]",
  // CSS applies scale before rotate, so the mirrored arrow rotates the other way.
  "down-left": "-scale-x-100 -rotate-[70deg]",
};

/** A loose, hand-drawn arrow. Colour comes from `currentColor`. */
export function HandArrow({
  direction = "right",
  className,
}: {
  direction?: Direction;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 44 22"
      aria-hidden="true"
      className={cn("h-[1.1em] w-auto overflow-visible", arrowTransform[direction], className)}
    >
      <path
        d="M3 16.5C9.5 8.5 19 4.2 29.5 5.6c3 .4 5.6 1.3 8.2 2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M31.8 3.2l6.4 5.1-7.6 2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Handwritten margin note with a coloured arrow (Step cards reference).
 * Decorative: hidden from screen readers and, by default, on small screens.
 */
export function Annotation({
  children,
  direction = "right",
  arrowPosition = "before",
  tilt = -6,
  showOnMobile = false,
  className,
  arrowClassName,
}: {
  children: React.ReactNode;
  direction?: Direction;
  arrowPosition?: "before" | "after" | "above";
  /** Rotation in degrees. */
  tilt?: number;
  showOnMobile?: boolean;
  className?: string;
  /** Colour/size for the arrow, e.g. "text-accent". */
  arrowClassName?: string;
}) {
  const arrow = <HandArrow direction={direction} className={cn("text-accent", arrowClassName)} />;
  return (
    <span
      aria-hidden="true"
      style={{ rotate: `${tilt}deg` }}
      className={cn(
        "pointer-events-none font-hand text-xl leading-[0.95] font-normal tracking-normal text-ink-3 normal-case select-none",
        showOnMobile ? "inline-flex" : "hidden lg:inline-flex",
        arrowPosition === "above" ? "flex-col items-center gap-0.5" : "items-center gap-1.5",
        className,
      )}
    >
      {arrowPosition !== "after" ? arrow : null}
      <span className="max-w-[11rem] text-center">{children}</span>
      {arrowPosition === "after" ? arrow : null}
    </span>
  );
}
