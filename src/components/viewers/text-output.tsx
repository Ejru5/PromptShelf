import { CopyButton } from "@/components/ui/copy-button";
import { renderMarkdown } from "@/lib/markdown";

/** A sample text result, typeset like a page of writing. */
export function TextOutput({ markdown }: { markdown: string }) {
  return (
    <div className="relative overflow-hidden rounded-card bg-paper shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">
          Sample output
        </span>
        <CopyButton text={markdown} label="Copy output" />
      </div>
      <div className="max-h-[680px] overflow-y-auto px-6 py-7 sm:px-9">
        <article
          className="prose-output"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
        />
      </div>
    </div>
  );
}
