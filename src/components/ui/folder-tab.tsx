import Link from "next/link";
import { paletteVars, type CategoryPalette } from "@/config/categories";
import { cn } from "@/lib/cn";

/**
 * The folder-tab label panel from the "Step" cards reference: a pale panel
 * whose left half rises into a tab with a soft S-curve slope.
 *
 * The slope is a fixed-size SVG (so its curves never stretch); the tab and
 * body are plain boxes that flex with the card width.
 */
export function FolderTab({
  className,
  tabWidth = "42%",
  children,
  ...props
}: { tabWidth?: string } & React.ComponentProps<"div">) {
  return (
    <div className={cn("relative", className)} {...props}>
      <div aria-hidden="true" className="-mb-px flex h-6 items-end">
        <div className="h-full rounded-tl-inner bg-tint" style={{ width: tabWidth }} />
        <svg viewBox="0 0 40 24" className="h-6 w-10 shrink-0 text-tint" preserveAspectRatio="none">
          <path d="M0 0H3C9 0 12 3 15 8L20 16.5C23 21.5 27 24 33 24H40V24H0Z" fill="currentColor" />
        </svg>
      </div>
      <div className="rounded-inner rounded-tl-none bg-tint">{children}</div>
    </div>
  );
}

type FolderTabCardProps = {
  palette: CategoryPalette;
  title: React.ReactNode;
  titleAs?: "h2" | "h3" | "p";
  /** Makes the whole card a single link (stretched from the title). */
  href?: string;
  eyebrow?: React.ReactNode;
  media?: React.ReactNode;
  /**
   * `tucked`: media sits top-right and overlaps the tab, like the reference.
   * `full`: media spans the card width above the panel.
   */
  mediaLayout?: "tucked" | "full";
  /** Extra content placed in the top-left area beside tucked media. */
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  panelClassName?: string;
} & Omit<React.ComponentProps<"article">, "title">;

export function FolderTabCard({
  palette,
  title,
  titleAs: TitleTag = "h3",
  href,
  eyebrow,
  media,
  mediaLayout = "tucked",
  aside,
  footer,
  children,
  className,
  panelClassName,
  style,
  ...props
}: FolderTabCardProps) {
  const titleNode = href ? (
    <Link
      href={href}
      prefetch
      className="after:absolute after:inset-0 after:z-20 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ink"
    >
      {title}
    </Link>
  ) : (
    title
  );

  return (
    <article
      className={cn(
        "group/card relative flex flex-col rounded-card bg-paper p-3 shadow-soft transition-shadow duration-300",
        href && "hover:shadow-lift",
        className,
      )}
      style={{ ...paletteVars(palette), ...style }}
      {...props}
    >
      {mediaLayout === "tucked" ? (
        // flex-1 + items-end: if the card stretches (grid rows), media stays resting on the panel.
        <div className="relative flex min-h-10 flex-1 items-end">
          <div className="flex flex-1 flex-col gap-2 self-stretch px-2 pt-1">
            {eyebrow ? <p className="text-xs text-ink-3">{eyebrow}</p> : null}
            {aside}
          </div>
          {media ? (
            <div className="relative z-10 -mb-6 w-[52%] shrink-0 transition-transform duration-500 ease-(--ease-spring) group-hover/card:-translate-y-1 group-hover/card:rotate-[-1.5deg]">
              {media}
            </div>
          ) : null}
        </div>
      ) : (
        <>
          {eyebrow ? <p className="px-2 pt-1 pb-2 text-xs text-ink-3">{eyebrow}</p> : null}
          {media ? (
            <div className="relative mb-2 overflow-hidden rounded-inner">{media}</div>
          ) : null}
        </>
      )}

      <FolderTab className={cn("mt-auto", panelClassName)} data-peel>
        <div className="px-4 pt-2 pb-4">
          <TitleTag className="text-[1.375rem] leading-tight font-bold tracking-[-0.02em] text-balance-safe text-title">
            {titleNode}
          </TitleTag>
          {children ? (
            <>
              <hr className="my-3 border-deep/15" />
              <div className="text-sm text-ink-2">{children}</div>
            </>
          ) : null}
          {footer ? <div className="mt-3 text-xs text-deep">{footer}</div> : null}
        </div>
      </FolderTab>
    </article>
  );
}
