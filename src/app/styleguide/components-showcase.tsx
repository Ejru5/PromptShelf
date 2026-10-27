import { Copy, Heart, Share2 } from "lucide-react";
import { PremiumGate } from "@/components/prompt/detail/premium-gate";
import { Annotation } from "@/components/ui/annotation";
import { BookCover, CoverCard } from "@/components/ui/book-cover";
import { Button, ButtonLink, IconButton } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { FolderTabCard } from "@/components/ui/folder-tab";
import { CategoryTag, Kbd, Pill, Tag } from "@/components/ui/pill";
import { PromptText } from "@/components/ui/prompt-text";
import { SpecTable } from "@/components/ui/spec-table";
import { Tooltip } from "@/components/ui/tooltip";
import { CATEGORIES, getCategoryDef, paletteVars } from "@/config/categories";
import { ToastDemo } from "./toast-demo";

const cat = (slug: string) => getCategoryDef(slug)!;

/** Placeholder "photo print" art — real results arrive with seed content. */
function PrintArt({ from, to, rotate = 3 }: { from: string; to: string; rotate?: number }) {
  return (
    <div
      className="aspect-[4/3] rounded-[14px] bg-paper p-1.5 shadow-cover"
      style={{ rotate: `${rotate}deg` }}
    >
      <div
        className="h-full w-full rounded-[10px]"
        style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
      />
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16" aria-labelledby={id}>
      <h2 id={id} className="mb-6 text-sm font-medium tracking-wide text-ink-3 uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ComponentsShowcase() {
  return (
    <>
      <Section id="sg-buttons" title="Buttons, pills & tags">
        <div className="flex flex-col gap-6 rounded-card bg-paper p-8 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Copy /> Copy prompt
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <span style={paletteVars(cat("images").palette)}>
              <Button variant="tint">Tint</Button>
            </span>
            <ButtonLink href="/shelves" size="lg">
              Browse shelves
            </ButtonLink>
            <Button size="sm" variant="secondary">
              Small
            </Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Tooltip label="Save">
              <IconButton label="Save prompt" variant="secondary">
                <Heart />
              </IconButton>
            </Tooltip>
            <Tooltip label="Share">
              <IconButton label="Share prompt" variant="secondary">
                <Share2 />
              </IconButton>
            </Tooltip>
            <Pill>Our stories</Pill>
            <Tag>Midjourney v7</Tag>
            <Tag>16:9</Tag>
            {CATEGORIES.slice(0, 4).map((c) => (
              <CategoryTag key={c.slug} slug={c.slug} asLink={false} />
            ))}
            <span className="flex items-center gap-1 text-xs text-ink-3">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </div>
          <ToastDemo />
        </div>
      </Section>

      <Section id="sg-folder" title="Folder-tab cards">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative">
            <FolderTabCard
              palette={cat("images").palette}
              eyebrow="Step 1"
              title="Browse"
              media={<PrintArt from="#F7B267" to="#E5561F" />}
            >
              Pick a shelf — images, video, UI and more.
            </FolderTabCard>
            <Annotation
              direction="right"
              className="absolute top-16 -left-28"
              arrowPosition="above"
            >
              getting to know each other
            </Annotation>
          </div>
          <FolderTabCard
            palette={cat("video").palette}
            eyebrow="Step 2"
            title="Preview"
            media={<PrintArt from="#A0C4FF" to="#2A80EB" rotate={-3} />}
            href="/shelves/video"
          >
            See the real result before you copy anything.
          </FolderTabCard>
          <FolderTabCard
            palette={cat("motion").palette}
            eyebrow="Step 3"
            title="Customize"
            media={<PrintArt from="#CDB4FF" to="#7B4DF0" rotate={2} />}
          >
            Fill in your own subject, style and details.
          </FolderTabCard>
          <FolderTabCard
            palette={cat("ui").palette}
            eyebrow="Full media layout"
            title="Pricing table with toggle"
            mediaLayout="full"
            media={<div className="aspect-[16/9] bg-[linear-gradient(135deg,#FDF5DA,#F2B81F)]" />}
            footer="Claude · Free"
          >
            Three-tier pricing table with a monthly/yearly toggle.
          </FolderTabCard>
        </div>
      </Section>

      <Section id="sg-covers" title="Book covers">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.slice(0, 5).map((c, i) => (
            <CoverCard
              key={c.slug}
              href={`/shelves/${c.slug}`}
              title={`${c.short} starter pack`}
              byline="Promptshelf"
              status={i === 2 ? "Premium · soon" : "Free"}
              description={c.tagline}
              cover={
                <BookCover
                  color={i % 2 ? c.palette.accent : c.palette.tint}
                  kicker="Collection"
                  number={c.number}
                  title={`${c.short} starter pack`}
                  art={
                    <div className="absolute inset-x-0 bottom-0 flex h-1/2 items-end justify-center gap-2 pb-[14%]">
                      <span className="size-10 rounded-full bg-white/70" />
                      <span className="size-14 rounded-full border-4 border-white/70" />
                    </div>
                  }
                />
              }
            />
          ))}
        </div>
      </Section>

      <Section id="sg-prompt" title="Prompt text & specs">
        <div
          className="grid gap-8 rounded-card bg-paper p-8 shadow-soft lg:grid-cols-2"
          style={paletteVars(cat("images").palette)}
        >
          <PromptText template="A cinematic portrait of {{subject}} standing on a sand dune at golden hour, wind in the fabric, 35mm film, shallow depth of field, warm haze --ar 3:2 --style raw" />
          <SpecTable
            items={[
              { label: "Model", value: "Midjourney v7" },
              { label: "Aspect ratio", value: "3:2" },
              { label: "Shelf", value: "Images" },
              { label: "Blanks", value: "1" },
              { label: "Updated", value: "Oct 2026" },
              { label: "Access", value: "Free" },
            ]}
          />
        </div>
      </Section>

      <Section id="sg-premium" title="Premium gate (paid-ready, unused while everything is free)">
        <div className="max-w-xl" style={paletteVars(cat("code").palette)}>
          <PremiumGate
            teaser="Refactor this React class component into a function component with hooks …"
            blankCount={1}
          />
        </div>
      </Section>

      <Section id="sg-feedback" title="Loading & empty states">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-card bg-paper p-6 shadow-soft">
            <Skeleton className="aspect-[4/3]" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <EmptyState
            title="Your shelf is empty"
            action={<ButtonLink href="/shelves">Browse prompts</ButtonLink>}
          >
            Save prompts you like and they&apos;ll wait for you here.
          </EmptyState>
        </div>
      </Section>
    </>
  );
}
