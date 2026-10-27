import { BookCover, CoverCard } from "@/components/ui/book-cover";
import type { Collection } from "@/content/schema";
import { CoverArt } from "./cover-art";

export function CollectionCover({
  collection,
  className,
}: {
  collection: Collection;
  className?: string;
}) {
  return (
    <BookCover
      color={collection.color}
      kicker="Collection"
      number={`№ ${collection.number}`}
      title={collection.title}
      art={<CoverArt art={collection.art} color={collection.color} />}
      className={className}
    />
  );
}

export function CollectionCard({
  collection,
  className,
}: {
  collection: Collection;
  className?: string;
}) {
  return (
    <CoverCard
      href={`/collections/${collection.slug}`}
      title={collection.title}
      byline={`${collection.prompts.length} prompts`}
      status={collection.access === "premium" ? "Premium" : "Free"}
      description={collection.description}
      cover={<CollectionCover collection={collection} />}
      className={className}
    />
  );
}
