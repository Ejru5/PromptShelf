import type { Metadata } from "next";
import { CollectionCard } from "@/components/collections/collection-card";
import { PageIntro } from "@/components/site/page-intro";
import { Annotation } from "@/components/ui/annotation";
import { getCollections } from "@/lib/content";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Hand-picked prompt packs for launches, freelancing, data, cinematic worlds and motion.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <main className="flex-1">
      <PageIntro
        eyebrow="Curated packs"
        title={
          <>
            Welcome to the <span className="text-ink-3">collections.</span>
          </>
        }
        aside="Hand-picked packs of prompts that work well together — for a launch, a client project or a whole new look."
      />
      <section className="relative mx-auto mt-14 w-full max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <Annotation
          direction="down-right"
          arrowPosition="before"
          className="absolute -top-10 left-[42%]"
        >
          start with the starter pack
        </Annotation>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {collections.map((c) => (
            <CollectionCard key={c.slug} collection={c} />
          ))}
        </div>
      </section>
    </main>
  );
}
