import { Copy, MousePointer2 } from "lucide-react";
import { ResultImage } from "@/components/prompt/result-image";
import { Annotation } from "@/components/ui/annotation";
import { FolderTabCard } from "@/components/ui/folder-tab";
import { CATEGORIES, getCategoryDef } from "@/config/categories";
import type { Media } from "@/content/schema";

const pal = (slug: string) => getCategoryDef(slug)!.palette;

function ShelfArt() {
  const heights = [74, 92, 64, 84, 70, 96, 60, 80];
  return (
    <div
      className="flex aspect-[4/3] items-end justify-center gap-1.5 rounded-[14px] bg-paper px-4 pb-3 shadow-cover"
      aria-hidden="true"
    >
      {CATEGORIES.map((c, i) => (
        <span
          key={c.slug}
          className="relative w-[9%] rounded-t-[4px] rounded-b-[2px]"
          style={{
            height: `${heights[i]}%`,
            background: c.palette.accent,
            rotate: i === 6 ? "-9deg" : undefined,
          }}
        >
          <span className="absolute top-2 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-full bg-white/60" />
        </span>
      ))}
    </div>
  );
}

function CompareArt({ before, after }: { before?: Media; after?: Media }) {
  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-paper p-1.5 shadow-cover"
      aria-hidden="true"
    >
      <div className="relative h-full overflow-hidden rounded-[10px] bg-tint">
        {after ? <ResultImage media={after} alt="" fill sizes="240px" /> : null}
        {before ? (
          <div className="absolute inset-0 [clip-path:inset(0_48%_0_0)]">
            <ResultImage media={before} alt="" fill sizes="240px" />
          </div>
        ) : null}
        <span className="absolute inset-y-0 left-[52%] w-0.5 bg-paper" />
        <span className="absolute top-1/2 left-[52%] grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-[0.625rem] text-ink shadow-soft">
          ⇆
        </span>
      </div>
    </div>
  );
}

function BlanksArt() {
  const chip = "rounded-md bg-tint px-1 text-deep ring-1 ring-deep/20";
  return (
    <div
      className="aspect-[4/3] rotate-[2deg] rounded-[14px] bg-paper p-4 font-mono text-[0.6875rem] leading-[1.9] text-ink shadow-cover"
      aria-hidden="true"
    >
      A portrait of <span className={chip}>a red fox</span> on a dune at{" "}
      <span className={chip}>golden hour</span>, 35mm film, <span className={chip}>warm haze</span>
      <span className="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 animate-pulse bg-ink" />
    </div>
  );
}

function CopyArt() {
  return (
    <div className="relative grid aspect-[4/3] place-items-center" aria-hidden="true">
      <span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-medium text-paper shadow-cover">
        <Copy className="size-3.5" /> Copy prompt
      </span>
      <MousePointer2 className="absolute top-[58%] left-[56%] size-6 fill-paper text-ink" />
      <span className="absolute top-[6%] right-[4%] rotate-[6deg] rounded-[3px] bg-[#FDE68A] px-3 pt-1 pb-1.5 font-hand text-xl text-ink shadow-[0_10px_24px_-10px_rgb(20_20_20/0.45)]">
        copied!
      </span>
    </div>
  );
}

export function HowItWorks({ before, after }: { before?: Media; after?: Media }) {
  const steps = [
    {
      n: 1,
      title: "Browse",
      body: "Pick a shelf — images, video, UI, documents and more.",
      slug: "images",
      media: <ShelfArt />,
    },
    {
      n: 2,
      title: "Preview",
      body: "See the real result before you copy a single word.",
      slug: "video",
      media: <CompareArt before={before} after={after} />,
    },
    {
      n: 3,
      title: "Customize",
      body: "Fill in the highlighted blanks with your own details.",
      slug: "motion",
      media: <BlanksArt />,
    },
    {
      n: 4,
      title: "Copy",
      body: "One click, then paste it into any AI tool you like.",
      slug: "writing",
      media: <CopyArt />,
    },
  ];
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="mx-auto w-full max-w-[1320px] scroll-mt-24 px-4 sm:px-6 lg:px-10"
    >
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-paper px-3 py-1 text-xs font-medium text-ink-2 shadow-soft">
            How it works
          </p>
          <h2 id="how-title" className="text-display font-semibold">
            Four steps. <span className="text-ink-3">No guesswork.</span>
          </h2>
        </div>
        <p className="max-w-xs text-sm text-ink-2 md:text-right">
          Every prompt on the shelf comes with the result it produced, so you know what you&apos;re
          getting.
        </p>
      </div>
      <div className="relative mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
        {steps.map((s) => (
          <FolderTabCard
            key={s.n}
            palette={pal(s.slug)}
            eyebrow={`Step ${s.n}`}
            title={s.title}
            titleAs="h3"
            media={s.media}
          >
            {s.body}
          </FolderTabCard>
        ))}
        <Annotation
          direction="right"
          arrowPosition="above"
          className="absolute top-16 -left-40"
          arrowClassName="text-[#E5561F]"
        >
          getting to know each shelf
        </Annotation>
        <Annotation
          direction="left"
          arrowPosition="above"
          className="absolute top-14 -right-40"
          tilt={6}
          arrowClassName="text-[#2A80EB]"
        >
          real outputs, not promises
        </Annotation>
        <Annotation
          direction="right"
          arrowPosition="above"
          className="absolute bottom-40 -left-40"
          arrowClassName="text-[#7B4DF0]"
        >
          until it fits your project
        </Annotation>
        <Annotation
          direction="left"
          arrowPosition="above"
          className="absolute -right-40 bottom-44"
          tilt={6}
          arrowClassName="text-[#DD4387]"
        >
          paste it anywhere you like
        </Annotation>
      </div>
    </section>
  );
}
