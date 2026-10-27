"use client";

import { useSaved } from "@/lib/saved";

/** Little count bubble next to "My shelf" in the header. */
export function SavedCount() {
  const { entries } = useSaved();
  if (!entries.length) return null;
  return (
    <span
      className="ml-1 inline-grid min-w-5 place-items-center rounded-full bg-ink px-1.5 font-numeric text-[0.625rem] leading-5 text-paper"
      aria-label={`${entries.length} saved`}
    >
      {entries.length}
    </span>
  );
}
