import Link from "next/link";
import { CollectionCard } from "@/components/collections/collection-card";
import { HowItWorks } from "@/components/home/how-it-works";
import { ShelfDial, ShelfStrip, type DialShelf } from "@/components/home/shelf-dial";
import { BentoGrid } from "@/components/prompt/bento-tile";
import { PromptCard } from "@/components/prompt/prompt-card";
import { JsonLd } from "@/components/site/json-ld";
import { Annotation } from "@/components/ui/annotation";
import { SITE } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import {
  getCollections,
  getFeaturedPrompts,
  getLatestPrompts,
  getPrompt,
  getShelfSummaries,
  getStats,
  toCard,
} from "@/lib/content";

function SectionHead({
  eyebrow,
  title,
  aside,
  href,
  hrefLabel,
}: {
  eyebrow: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <Pill className="mb-4">{eyebrow}</Pill>
        <h2 className="text-display font-semibold">{title}</h2>
      </div>
      <div className="flex flex-col gap-3 md:items-end md:text-right">
        {aside ? <p className="max-w-xs text-sm text-ink-2">{aside}</p> : null}
        {href ? (
          <Link href={href} className="text-sm font-medium text-ink hover:underline">
            {hrefLabel} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [shelves, stats, featured, latest, collections, sketch] = await Promise.all([
    getShelfSummaries(),
    getStats(),
    getFeaturedPrompts(12),
    getLatestPrompts(6),
    getCollections(),
    getPrompt("sketch-to-watercolor"),
  ]);
  const dial: DialShelf[] = shelves.map(({ category: c, count, thumbs }) => ({
    slug: c.slug,
    number: c.number,
    name: c.name,
    short: c.short,
    tagline: c.tagline,
    count,
    palette: c.palette,
    thumbs,
  }));
  const compare = sketch?.results.find((r) => r.kind === "before-after");
  const bento = featured
    .filter((p) => p.cover)
    .slice(0, 6)
    .map(toCard);

  return (
    <main className="flex-1">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.url,
          description: SITE.description,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE.url}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <section className="mx-auto grid w-full max-w-[1320px] items-center gap-10 px-4 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:px-10">
        <div className="relative min-w-0">
          <Pill>
            <span className="size-1.5 rounded-full bg-[#1C9660]" aria-hidden="true" />
            {stats.prompts} prompts · {stats.shelves} shelves · free to copy
          </Pill>
          <h1 className="mt-6 text-display-xl font-semibold">
            Prompts,
            <br />
            with{" "}
            <span className="relative inline-block">
              proof.
              <svg
                viewBox="0 0 300 24"
                className="absolute -bottom-[0.12em] left-0 h-[0.22em] w-full text-[#E5561F]"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M4 16C60 6 140 4 296 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-2">
            A library of AI prompts for images, video, motion, UI, documents and more — each one
            shown with the result it produced. Fill in the blanks, copy, done.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/shelves" size="lg">
              Browse the shelves
            </ButtonLink>
            <ButtonLink href="/#how-it-works" size="lg" variant="secondary">
              How it works
            </ButtonLink>
          </div>
          <dl className="mt-10 flex gap-8 text-sm">
            {[
              [stats.prompts, "prompts"],
              [stats.collections, "collections"],
              [stats.models, "AI models"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd>
                  <span className="block font-numeric text-2xl font-bold">{v}</span>
                  <span className="text-ink-3">{l}</span>
                </dd>
              </div>
            ))}
          </dl>
          <Annotation
            direction="down-right"
            arrowPosition="after"
            className="absolute -bottom-4 left-[52%]"
            tilt={-6}
          >
            see it, then copy it
          </Annotation>
        </div>
        <div className="hidden min-w-0 lg:block">
          <ShelfDial shelves={dial} />
        </div>
        <div className="min-w-0 lg:hidden">
          <ShelfStrip shelves={dial} />
        </div>
      </section>

      <div className="mt-28 [contain-intrinsic-size:auto_1100px] [content-visibility:auto]">
        <HowItWorks
          before={compare?.kind === "before-after" ? compare.before : undefined}
          after={compare?.kind === "before-after" ? compare.after : undefined}
        />
      </div>

      <section className="mx-auto mt-28 w-full max-w-[1320px] px-4 [contain-intrinsic-size:auto_900px] [content-visibility:auto] sm:px-6 lg:px-10">
        <SectionHead
          eyebrow="Featured"
          title={
            <>
              Fresh off <span className="text-ink-3">the shelf.</span>
            </>
          }
          aside="Hand-picked prompts with results worth showing off."
          href="/shelves"
          hrefLabel="See all shelves"
        />
        <BentoGrid cards={bento} />
      </section>

      <section className="mx-auto mt-28 w-full max-w-[1320px] px-4 [contain-intrinsic-size:auto_900px] [content-visibility:auto] sm:px-6 lg:px-10">
        <SectionHead
          eyebrow="Collections"
          title={
            <>
              Welcome to <span className="text-ink-3">the packs.</span>
            </>
          }
          aside="Curated prompt packs for launches, freelancing, data and more."
          href="/collections"
          hrefLabel="All collections"
        />
        <div className="-mx-4 scrollbar-none flex snap-x gap-6 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {collections.map((c) => (
            <CollectionCard
              key={c.slug}
              collection={c}
              className="w-[44%] shrink-0 snap-start sm:w-auto"
            />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 w-full max-w-[1320px] px-4 [contain-intrinsic-size:auto_900px] [content-visibility:auto] sm:px-6 lg:px-10">
        <SectionHead
          eyebrow="Just added"
          title={
            <>
              New on <span className="text-ink-3">the shelves.</span>
            </>
          }
        />
        <div className="grid items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((p) => (
            <PromptCard key={p.slug} card={toCard(p)} morph={false} />
          ))}
        </div>
      </section>
    </main>
  );
}
