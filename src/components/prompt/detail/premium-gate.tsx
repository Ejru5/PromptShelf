import { Lock } from "lucide-react";
import { Annotation } from "@/components/ui/annotation";
import { plural } from "@/lib/format";

/** Shown instead of the workbench when a premium prompt is viewed without access. */
export function PremiumGate({ teaser, blankCount }: { teaser: string; blankCount: number }) {
  return (
    <div className="relative" id="prompt">
      <Annotation
        direction="down-left"
        arrowPosition="after"
        className="absolute -top-9 right-6"
        tilt={-3}
      >
        the results are free to look at
      </Annotation>
      <div className="relative overflow-hidden rounded-card bg-paper p-5 shadow-soft sm:p-6">
        <h2 className="mb-4 text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">
          Prompt
        </h2>
        <p
          className="font-mono text-[0.8125rem] leading-[1.8] text-ink select-none"
          aria-hidden="true"
        >
          {teaser}
        </p>
        <div aria-hidden="true" className="mt-1 space-y-2 blur-[3px] select-none">
          <div className="h-3 w-[92%] rounded bg-canvas-2" />
          <div className="h-3 w-[86%] rounded bg-canvas-2" />
          <div className="h-3 w-[64%] rounded bg-canvas-2" />
        </div>
        <div className="mt-6 flex flex-col gap-4 rounded-inner bg-tint p-5 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-paper text-deep shadow-soft">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-deep">This is a Premium prompt</p>
            <p className="text-sm text-ink-2">
              The full prompt{blankCount ? ` and its ${plural(blankCount, "blank")}` : ""} unlock
              with Promptshelf Pro.
            </p>
          </div>
          <span className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-medium text-paper opacity-70">
            Premium is coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
