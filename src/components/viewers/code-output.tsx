import { CopyButton } from "@/components/ui/copy-button";
import { highlight } from "@/lib/highlight";

/** Server-highlighted code with a filename bar and line numbers. */
export async function CodeOutput({
  code,
  language,
  filename,
  maxHeight = 680,
  rounded = true,
}: {
  code: string;
  language: string;
  filename?: string;
  maxHeight?: number;
  rounded?: boolean;
}) {
  const html = await highlight(code, language);
  return (
    <div className={`overflow-hidden bg-[#0d1117] ${rounded ? "rounded-card shadow-soft" : ""}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="truncate font-mono text-xs text-white/70">{filename ?? language}</span>
        </div>
        <CopyButton text={code} label="Copy code" tone="dark" />
      </div>
      <div
        className="code-output overflow-auto py-4 text-[0.8125rem]"
        style={{ maxHeight }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
