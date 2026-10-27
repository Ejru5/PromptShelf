import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShelfBrowser } from "@/components/shelf/shelf-browser";
import { ShelfGrid } from "@/components/shelf/shelf-grid";
import { ShelfSwitcher } from "@/components/shelf/shelf-switcher";
import { PageIntro } from "@/components/site/page-intro";
import { Annotation } from "@/components/ui/annotation";
import { CATEGORIES, getCategoryDef, paletteVars, type PreviewType } from "@/config/categories";
import { getShelf, toCard } from "@/lib/content";

const NOTE: Record<PreviewType, string> = {
  image: "hover the before/afters",
  video: "hover a tile to play it",
  ui: "every preview is live code",
  document: "flip through real pages",
  text: "sample outputs included",
  code: "real code, ready to paste",
};

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shelves/[slug]">): Promise<Metadata> {
  const cat = getCategoryDef((await params).slug);
  if (!cat) return {};
  return {
    title: `${cat.name} prompts`,
    description: cat.description,
    alternates: { canonical: `/shelves/${cat.slug}` },
  };
}

export default async function ShelfPage({ params }: PageProps<"/shelves/[slug]">) {
  const { slug } = await params;
  const shelf = await getShelf(slug);
  if (!shelf) notFound();
  const { category: cat, prompts } = shelf;
  const cards = prompts.map(toCard);
  const nextCat =
    CATEGORIES[(CATEGORIES.findIndex((c) => c.slug === cat.slug) + 1) % CATEGORIES.length];

  return (
    <main style={paletteVars(cat.palette)} className="flex-1">
      <PageIntro
        eyebrow={
          <>
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Shelf {cat.number} · {prompts.length} prompts
          </>
        }
        title={
          <span className="relative">
            {cat.name}
            <Annotation
              direction="left"
              arrowPosition="before"
              className="absolute -right-4 bottom-2 translate-x-full"
              tilt={-5}
            >
              {NOTE[cat.preview]}
            </Annotation>
          </span>
        }
        aside={cat.description}
      >
        <ShelfSwitcher current={cat.slug} className="mt-10" />
      </PageIntro>

      <section
        aria-label={`${cat.name} prompts`}
        className="mx-auto mt-8 w-full max-w-[1320px] px-4 sm:px-6 lg:px-10"
      >
        <Suspense fallback={<ShelfGrid cards={cards} preview={cat.preview} />}>
          <ShelfBrowser cards={cards} preview={cat.preview} />
        </Suspense>
      </section>

      <section className="mx-auto mt-24 w-full max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <Link
          href={`/shelves/${nextCat.slug}`}
          style={paletteVars(nextCat.palette)}
          className="group flex items-center justify-between gap-6 rounded-card bg-tint px-6 py-8 transition-[filter] hover:brightness-[0.98] sm:px-10"
        >
          <span>
            <span className="text-xs tracking-[0.14em] text-deep uppercase">Next shelf</span>
            <span className="mt-2 flex items-baseline gap-4">
              <span className="font-numeric text-3xl font-bold text-ink sm:text-5xl">
                {nextCat.number}
              </span>
              <span className="text-[clamp(1.75rem,1.2rem+2.5vw,3.5rem)] leading-none font-semibold tracking-[-0.035em] text-title">
                {nextCat.name}
              </span>
            </span>
          </span>
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-paper text-2xl transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </section>
    </main>
  );
}
