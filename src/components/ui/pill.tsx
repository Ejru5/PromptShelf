import Link from "next/link";
import { getCategoryDef, paletteVars } from "@/config/categories";
import { cn } from "@/lib/cn";

/** Small rounded label — the "Our Stories" pill from the gallery reference. */
export function Pill({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-medium text-ink-2 shadow-soft",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Neutral tag used for keywords and models. */
export function Tag({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-paper/60 px-2.5 py-0.5 text-xs text-ink-2",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Category-coloured tag with a dot. Links to the shelf unless `asLink` is false. */
export function CategoryTag({
  slug,
  asLink = true,
  className,
}: {
  slug: string;
  asLink?: boolean;
  className?: string;
}) {
  const cat = getCategoryDef(slug);
  if (!cat) return null;
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-full bg-tint px-2.5 py-1 text-xs font-medium text-deep",
    asLink && "transition-[filter] hover:brightness-[0.96]",
    className,
  );
  const inner = (
    <>
      <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
      {cat.name}
    </>
  );
  return asLink ? (
    <Link href={`/shelves/${cat.slug}`} className={cls} style={paletteVars(cat.palette)}>
      {inner}
    </Link>
  ) : (
    <span className={cls} style={paletteVars(cat.palette)}>
      {inner}
    </span>
  );
}

export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-line bg-paper px-1.5 font-mono text-[0.6875rem] text-ink-2",
        className,
      )}
      {...props}
    />
  );
}
