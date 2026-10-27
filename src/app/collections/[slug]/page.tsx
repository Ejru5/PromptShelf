import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionCover } from "@/components/collections/collection-card";
import { PromptCard } from "@/components/prompt/prompt-card";
import { Pill } from "@/components/ui/pill";
import { SpecTable } from "@/components/ui/spec-table";
import { getCategoryDef } from "@/config/categories";
import { getCollection, getCollections, toCard } from "@/lib/content";

export async function generateStaticParams() {
  return (await getCollections()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const data = await getCollection((await params).slug);
  if (!data) return {};
  return {
    title: data.collection.title,
    description: data.collection.description,
    alternates: { canonical: `/collections/${data.collection.slug}` },
  };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const data = await getCollection((await params).slug);
  if (!data) notFound();
  const { collection, prompts } = data;
  const shelves = [...new Set(prompts.map((p) => getCategoryDef(p.category)!.short))];

  return (
    <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 pt-10 sm:px-6 sm:pt-16 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-10 text-sm text-ink-3">
        <Link href="/collections" className="hover:text-ink">
          ← All collections
        </Link>
      </nav>
      <div className="grid items-center gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
        <div className="relative mx-auto w-full max-w-[340px]">
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-canvas-2"
          />
          <CollectionCover collection={collection} className="relative" />
        </div>
        <div>
          <Pill>Collection № {collection.number}</Pill>
          <h1 className="mt-5 font-serif text-heading font-semibold">{collection.title}</h1>
          <p className="mt-3 text-xs tracking-[0.12em] text-ink-3 uppercase">
            curated by <span className="font-semibold text-ink">Promptshelf</span>
          </p>
          <p className="mt-6 max-w-xl font-serif text-[1.1875rem] leading-relaxed text-ink-2 italic">
            {collection.description}
          </p>
          <SpecTable
            className="mt-8 max-w-xl"
            items={[
              { label: "Prompts", value: String(prompts.length) },
              { label: "Shelves", value: shelves.join(", ") },
              { label: "Access", value: collection.access === "premium" ? "Premium" : "Free" },
              { label: "Models", value: String(new Set(prompts.flatMap((p) => p.models)).size) },
            ]}
          />
        </div>
      </div>

      <section aria-labelledby="in-this-collection" className="mt-24">
        <h2
          id="in-this-collection"
          className="mb-8 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-none font-semibold tracking-[-0.035em]"
        >
          In this collection
        </h2>
        <ol className="grid items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((p, i) => (
            <li key={p.slug} className="relative">
              <span className="absolute -top-3 -right-2 z-30 grid size-8 place-items-center rounded-full bg-ink font-numeric text-xs font-bold text-paper">
                {String(i + 1).padStart(2, "0")}
              </span>
              <PromptCard card={toCard(p)} />
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
