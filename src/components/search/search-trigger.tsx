"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { openSearch } from "./open-search";

/** Header search pill: opens the ⌘K palette; falls back to /search without JS. */
export function SearchTrigger() {
  return (
    <Link
      href="/search"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        openSearch();
      }}
      className="flex h-9 items-center gap-2 rounded-full bg-paper pr-1.5 pl-3 text-sm text-ink-3 shadow-soft transition-shadow hover:shadow-lift"
      aria-keyshortcuts="Meta+K Control+K"
    >
      <Search className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">Search prompts</span>
      <span className="sr-only sm:hidden">Search</span>
      <kbd className="hidden rounded-full bg-canvas px-2 py-0.5 font-mono text-[0.6875rem] text-ink-2 sm:inline">
        ⌘K
      </kbd>
    </Link>
  );
}
