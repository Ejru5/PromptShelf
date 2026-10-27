"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/cn";

/** Small "Copy" button with a brief ✓ state. */
export function CopyButton({
  text,
  label = "Copy",
  className,
  tone = "light",
}: {
  text: string;
  label?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        }
      }}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
        tone === "dark"
          ? "bg-white/10 text-white hover:bg-white/20"
          : "bg-paper text-ink shadow-soft hover:shadow-lift",
        className,
      )}
    >
      {done ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      <span aria-live="polite">{done ? "Copied" : label}</span>
    </button>
  );
}
