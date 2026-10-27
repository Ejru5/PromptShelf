import Link from "next/link";
import { cn } from "@/lib/cn";

/** Three book spines — the last one leaning — in the first three shelf colours. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 26 24" aria-hidden="true" className={cn("h-6 w-auto", className)}>
      <rect x="1" y="5" width="6" height="18" rx="1.6" fill="#E5561F" />
      <rect x="8.5" y="1" width="6" height="22" rx="1.6" fill="#2A80EB" />
      <rect
        x="16.5"
        y="4"
        width="6"
        height="19"
        rx="1.6"
        fill="#7B4DF0"
        transform="rotate(14 19.5 23)"
      />
      <rect x="2.5" y="8" width="3" height="1.4" rx=".7" fill="#fff" opacity=".7" />
      <rect x="10" y="4" width="3" height="1.4" rx=".7" fill="#fff" opacity=".7" />
    </svg>
  );
}

export function Logo({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onNavigate={onNavigate}
      className={cn("group inline-flex items-center gap-2", className)}
      aria-label="Promptshelf home"
    >
      <LogoMark className="transition-transform duration-300 ease-(--ease-spring) group-hover:-rotate-6" />
      <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">promptshelf</span>
    </Link>
  );
}
