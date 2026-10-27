import type { PreviewType } from "@/config/categories";
import type { PromptCard as CardData } from "@/lib/content";
import { BentoGrid } from "../prompt/bento-tile";
import { PromptCard } from "../prompt/prompt-card";

/** Lays out a shelf's cards in the style that suits its preview type. */
export function ShelfGrid({ cards, preview }: { cards: CardData[]; preview: PreviewType }) {
  if (preview === "image" || preview === "video") return <BentoGrid cards={cards} />;
  const cols =
    preview === "ui"
      ? "sm:grid-cols-2"
      : preview === "document"
        ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid gap-x-6 gap-y-10 ${cols}`}>
      {cards.map((card) => (
        <PromptCard key={card.slug} card={card} />
      ))}
    </div>
  );
}
