import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/search/search-results";
import { PageIntro } from "@/components/site/page-intro";
import { Annotation } from "@/components/ui/annotation";
import { getAllPrompts, getCollections, toCard } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every prompt on Promptshelf by title, shelf, model or tag.",
  alternates: { canonical: "/search" },
};

/** Same footprint as the interactive search (form, filters, tall results area) so nothing jumps. */
function SearchFallback() {
  return (
    <div aria-hidden="true">
      <div className="h-16 rounded-full bg-paper shadow-soft" />
      <div className="mt-5 h-7" />
      <div className="mt-8 h-9 w-2/3 rounded-full bg-paper/60" />
      <div className="mt-6 mb-6 h-5" />
      <div className="min-h-[70vh]" />
    </div>
  );
}

export default async function SearchPage() {
  const [prompts, collections] = await Promise.all([getAllPrompts(), getCollections()]);
  const index = buildSearchIndex(prompts, collections);
  return (
    <main className="flex-1">
      <PageIntro
        eyebrow="Find a prompt"
        title={
          <span className="relative">
            Search the <span className="text-ink-3">shelves.</span>
            <Annotation
              direction="down-left"
              arrowPosition="after"
              className="absolute -right-4 -bottom-6 translate-x-full"
              tilt={-4}
            >
              typos are fine
            </Annotation>
          </span>
        }
        aside={
          <>
            Press{" "}
            <kbd className="rounded border border-line bg-paper px-1.5 font-mono text-xs">/</kbd> or{" "}
            <kbd className="rounded border border-line bg-paper px-1.5 font-mono text-xs">⌘K</kbd>{" "}
            anywhere for quick search.
          </>
        }
      />
      <section className="mx-auto mt-10 w-full max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <Suspense fallback={<SearchFallback />}>
          <SearchResults index={index} cards={prompts.map(toCard)} />
        </Suspense>
      </section>
    </main>
  );
}
