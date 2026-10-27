import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PromptDetail } from "@/components/prompt/detail/prompt-detail";
import { canAccess, getViewer, redactPrompt } from "@/lib/access";
import { JsonLd } from "@/components/site/json-ld";
import { getCategoryDef } from "@/config/categories";
import { SITE } from "@/config/site";
import {
  getAllPrompts,
  getCollectionsForPrompt,
  getPrompt,
  getPromptsByCategory,
  getRelatedPrompts,
  getShelfNeighbours,
} from "@/lib/content";

export async function generateStaticParams() {
  return (await getAllPrompts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const prompt = await getPrompt((await params).slug);
  if (!prompt) return {};
  return {
    title: prompt.title,
    description: prompt.summary,
    alternates: { canonical: `/p/${prompt.slug}` },
    openGraph: { title: prompt.title, description: prompt.summary, type: "article" },
    twitter: { card: "summary_large_image", title: prompt.title, description: prompt.summary },
  };
}

export default async function PromptPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const full = await getPrompt(slug);
  if (!full) notFound();
  // Premium text never leaves the server unless the viewer has access.
  const locked = !canAccess(full, await getViewer());
  const prompt = locked ? redactPrompt(full) : full;

  const [related, { prev, next }, collections, shelf] = await Promise.all([
    getRelatedPrompts(prompt, 5),
    getShelfNeighbours(prompt),
    getCollectionsForPrompt(prompt.slug),
    getPromptsByCategory(prompt.category),
  ]);

  const cat = getCategoryDef(prompt.category)!;
  const url = new URL(`/p/${prompt.slug}`, SITE.url).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#prompt`,
        name: prompt.title,
        description: prompt.summary,
        url,
        genre: cat.name,
        keywords: [...prompt.tags, ...prompt.models].join(", "),
        dateCreated: prompt.created,
        dateModified: prompt.updated,
        isAccessibleForFree: prompt.access === "free",
        image: `${url}/opengraph-image`,
        text: prompt.template,
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Shelves",
            item: new URL("/shelves", SITE.url).toString(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: cat.name,
            item: new URL(`/shelves/${cat.slug}`, SITE.url).toString(),
          },
          { "@type": "ListItem", position: 3, name: prompt.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PromptDetail
        prompt={prompt}
        related={related}
        prev={prev}
        next={next}
        collections={collections}
        shelfMates={shelf.filter((p) => p.slug !== prompt.slug)}
      />
    </>
  );
}
