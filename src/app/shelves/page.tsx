import type { Metadata } from "next";
import { ThumbFan } from "@/components/prompt/thumb";
import { PageIntro } from "@/components/site/page-intro";
import { FolderTabCard } from "@/components/ui/folder-tab";
import { getShelfSummaries } from "@/lib/content";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "All shelves",
  description:
    "Eight shelves of AI prompts — images, video, motion graphics, UI components, documents, reports, writing and code.",
  alternates: { canonical: "/shelves" },
};

export default async function ShelvesPage() {
  const shelves = await getShelfSummaries();
  return (
    <main className="flex-1">
      <PageIntro
        eyebrow={`${shelves.length} shelves`}
        title={
          <>
            Every kind of prompt,
            <br />
            <span className="text-ink-3">one shelf each.</span>
          </>
        }
        aside="Each shelf shows its results the way they're meant to be seen — galleries, live components, real pages."
      />
      <section className="mx-auto mt-14 grid w-full max-w-[1320px] gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
        {shelves.map(({ category: c, count, thumbs }) => (
          <FolderTabCard
            key={c.slug}
            palette={c.palette}
            href={`/shelves/${c.slug}`}
            title={c.name}
            titleAs="h2"
            eyebrow={<span className="font-numeric text-sm font-bold text-ink">{c.number}</span>}
            media={<ThumbFan thumbs={thumbs} className="aspect-[5/4] w-full" sizes="140px" />}
            footer={plural(count, "prompt")}
          >
            {c.tagline}
          </FolderTabCard>
        ))}
      </section>
    </main>
  );
}
