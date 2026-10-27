import { cn } from "@/lib/cn";

export type SpecItem = { label: string; value: React.ReactNode };

/**
 * Two-column definition table (Gestalten reference: "Editors / Release Date /
 * Format | Features / Language / ISBN"). Collapses to one column on phones.
 */
export function SpecTable({ items, className }: { items: SpecItem[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <dl className={cn("grid gap-x-10 sm:grid-cols-2", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-sm"
        >
          <dt className="font-semibold text-ink">{item.label}</dt>
          <dd className="text-right text-ink-2">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
