import { parseTemplate } from "@/lib/prompt-template";
import { cn } from "@/lib/cn";

/**
 * Read-only prompt text: monospace, wraps long lines, and highlights
 * `{{blanks}}` as category-tinted chips. The interactive version (editable
 * blanks) builds on the same parser.
 */
export function PromptText({
  template,
  values,
  className,
}: {
  template: string;
  /** Optional filled values; filled blanks render as the value, still highlighted. */
  values?: Record<string, string | undefined>;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[0.8125rem] leading-[1.75] break-words whitespace-pre-wrap text-ink",
        className,
      )}
    >
      {parseTemplate(template).map((seg, i) => {
        if (seg.type === "text") return <span key={i}>{seg.value}</span>;
        const value = values?.[seg.name]?.trim();
        return (
          <mark
            key={i}
            data-blank={seg.name}
            className={cn(
              "rounded-md box-decoration-clone px-1 py-0.5",
              value ? "bg-tint text-deep" : "bg-tint/80 text-deep ring-1 ring-deep/15 ring-inset",
            )}
          >
            {value || seg.name.replace(/[_-]+/g, " ")}
          </mark>
        );
      })}
    </p>
  );
}
