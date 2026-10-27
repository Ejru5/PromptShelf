"use client";

import { useLayoutEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type SwitcherItem = {
  id: string;
  label: string;
  caption?: string;
  thumb?: React.ReactNode;
  node: React.ReactNode;
};

/** Shows one result at a time with a row of thumbnail tabs when there are several. */
export function ResultSwitcher({ items }: { items: SwitcherItem[] }) {
  const [index, setIndex] = useState(0);
  useLayoutEffect(() => () => setIndex(0), []);
  const active = items[index] ?? items[0];

  return (
    <div>
      {items.map((item, i) => (
        <div
          key={item.id}
          hidden={i !== index}
          role={items.length > 1 ? "tabpanel" : undefined}
          id={`result-${item.id}`}
        >
          {item.node}
        </div>
      ))}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {items.length > 1 ? (
          <div role="tablist" aria-label="Results" className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-controls={`result-${item.id}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "group flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-xs transition-colors",
                  i === index
                    ? "border-ink bg-paper text-ink"
                    : "border-line bg-paper/50 text-ink-2 hover:border-line-2",
                )}
              >
                {item.thumb ? (
                  <span className="relative size-7 overflow-hidden rounded-full bg-tint">
                    {item.thumb}
                  </span>
                ) : null}
                {item.label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        {active?.caption ? <p className="text-xs text-ink-3">{active.caption}</p> : null}
      </div>
    </div>
  );
}
