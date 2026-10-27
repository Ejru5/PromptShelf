import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-inner bg-canvas-2", className)}
      {...props}
    />
  );
}

/** An empty shelf with one book leaning against the bracket. */
function EmptyShelfArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 80" aria-hidden="true" className={cn("h-20 w-auto", className)}>
      <rect x="10" y="66" width="140" height="5" rx="2.5" fill="#CFCCC5" />
      <rect x="22" y="71" width="4" height="8" rx="1" fill="#CFCCC5" />
      <rect x="134" y="71" width="4" height="8" rx="1" fill="#CFCCC5" />
      <rect x="112" y="24" width="12" height="42" rx="2" fill="#E5561F" />
      <rect x="114.5" y="30" width="7" height="2" rx="1" fill="#fff" opacity=".6" />
      <rect
        x="96"
        y="28"
        width="11"
        height="38"
        rx="2"
        fill="#2A80EB"
        transform="rotate(-16 107 66)"
      />
    </svg>
  );
}

export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-card border border-dashed border-line-2 px-6 py-14 text-center",
        className,
      )}
    >
      <EmptyShelfArt />
      <h2 className="mt-6 text-xl font-semibold tracking-tight">{title}</h2>
      {children ? <div className="mt-2 max-w-sm text-sm text-ink-2">{children}</div> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
