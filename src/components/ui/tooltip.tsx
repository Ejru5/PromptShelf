import { cn } from "@/lib/cn";

/**
 * Visual-only tooltip shown on hover and keyboard focus. The trigger must
 * carry its own accessible name (e.g. IconButton's `label`), so the bubble
 * is hidden from assistive tech to avoid double announcements.
 */
export function Tooltip({
  label,
  side = "top",
  className,
  children,
}: {
  label: string;
  side?: "top" | "bottom";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("group/tt relative inline-flex", className)}>
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-[0.6875rem] font-medium whitespace-nowrap text-paper opacity-0 transition duration-150",
          "group-focus-within/tt:opacity-100 group-hover/tt:opacity-100",
          side === "top"
            ? "bottom-full mb-2 translate-y-1 group-focus-within/tt:translate-y-0 group-hover/tt:translate-y-0"
            : "top-full mt-2 -translate-y-1 group-focus-within/tt:translate-y-0 group-hover/tt:translate-y-0",
        )}
      >
        {label}
      </span>
    </span>
  );
}
