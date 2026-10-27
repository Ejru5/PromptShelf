"use client";

import { Bookmark } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { useSaved } from "@/lib/saved";
import { track } from "@/lib/track";

/** Save to / remove from My shelf. `variant="card"` is the small floating version. */
export function SaveButton({
  slug,
  title,
  variant = "default",
  className,
}: {
  slug: string;
  title: string;
  variant?: "default" | "card";
  className?: string;
}) {
  const { isSaved, toggle } = useSaved();
  const toast = useToast();
  const saved = isSaved(slug);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove “${title}” from My shelf` : `Save “${title}” to My shelf`}
      title={saved ? "Saved to My shelf" : "Save to My shelf"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const now = toggle(slug);
        track(now ? "prompt_save" : "prompt_unsave", { slug });
        toast(now ? "Saved to My shelf" : "Removed from My shelf");
      }}
      className={cn(
        "grid place-items-center rounded-full transition",
        variant === "card"
          ? "size-9 bg-paper/90 text-ink shadow-soft backdrop-blur hover:scale-105"
          : "size-11 text-ink-2 hover:bg-canvas hover:text-ink",
        saved && "text-accent",
        className,
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} aria-hidden="true" />
    </button>
  );
}
