import type { Metadata } from "next";
import { SavedShelf } from "@/components/saved/saved-shelf";
import { PageIntro } from "@/components/site/page-intro";
import { Annotation } from "@/components/ui/annotation";
import { getAllPrompts, toCard } from "@/lib/content";

export const metadata: Metadata = {
  title: "My shelf",
  robots: { index: false, follow: true },
};

export default async function SavedPage() {
  const cards = (await getAllPrompts()).map(toCard);
  return (
    <main className="flex-1">
      <PageIntro
        eyebrow="Saved on this device"
        title={
          <span className="relative">
            My <span className="text-ink-3">shelf.</span>
            <Annotation
              direction="down-left"
              arrowPosition="after"
              className="absolute -right-6 bottom-0 translate-x-full"
              tilt={-4}
            >
              your favourites live here
            </Annotation>
          </span>
        }
        aside="Prompts you've bookmarked. Accounts (and syncing across devices) are coming later."
      />
      <section className="mx-auto mt-10 w-full max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <SavedShelf cards={cards} />
      </section>
    </main>
  );
}
