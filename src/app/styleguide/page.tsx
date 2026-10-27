import type { Metadata } from "next";
import { CATEGORIES, paletteVars } from "@/config/categories";
import { ComponentsShowcase } from "./components-showcase";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const NEUTRALS = [
  ["canvas", "bg-canvas", "#F1F0ED"],
  ["canvas-2", "bg-canvas-2", "#E9E7E2"],
  ["paper", "bg-paper", "#FFFFFF"],
  ["line", "bg-line", "#E3E1DC"],
  ["ink-3", "bg-ink-3", "#696660"],
  ["ink-2", "bg-ink-2", "#4C4A46"],
  ["ink", "bg-ink", "#141414"],
] as const;

const SHADOWS = ["shadow-soft", "shadow-lift", "shadow-cover", "shadow-pop"] as const;

export default function StyleguidePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8">
      <p className="mb-4 inline-flex rounded-full bg-paper px-3 py-1 text-xs font-medium text-ink-2 shadow-soft">
        Design tokens
      </p>
      <h1 className="text-display font-semibold">Styleguide</h1>
      <p className="mt-4 max-w-xl text-ink-2">
        The visual language for Promptshelf: warm paper, near-black ink, and one colour family per
        shelf.
      </p>

      <section className="mt-16" aria-labelledby="sg-type">
        <h2 id="sg-type" className="mb-6 text-sm font-medium tracking-wide text-ink-3 uppercase">
          Type
        </h2>
        <div className="grid gap-6 rounded-card bg-paper p-8 shadow-soft">
          <p className="text-display-xl font-semibold">Prompt Gallery</p>
          <p className="font-serif text-heading font-semibold">
            Cinematic desert portrait at golden hour
          </p>
          <p className="max-w-prose font-serif text-lg text-ink-2 italic">
            Diminutive prompts, grand results. Fill in your own subject and copy in one click.
          </p>
          <p className="font-mono text-sm leading-relaxed text-ink-2">
            A {"{{subject}}"} standing on a dune at golden hour, 35mm, shallow depth of field --ar
            3:2
          </p>
          <p className="font-numeric text-5xl font-bold">01 05 06 08</p>
          <p className="font-hand text-2xl text-ink-3">fill in your own subject ↘</p>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="sg-neutrals">
        <h2
          id="sg-neutrals"
          className="mb-6 text-sm font-medium tracking-wide text-ink-3 uppercase"
        >
          Neutrals
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {NEUTRALS.map(([name, cls, hex]) => (
            <div key={name} className="overflow-hidden rounded-inner bg-paper shadow-soft">
              <div className={`h-20 ${cls} border-b border-line`} />
              <div className="p-3 text-xs">
                <p className="font-medium">{name}</p>
                <p className="font-mono text-ink-3">{hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16" aria-labelledby="sg-cats">
        <h2 id="sg-cats" className="mb-6 text-sm font-medium tracking-wide text-ink-3 uppercase">
          Shelves
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <div
              key={c.slug}
              style={paletteVars(c.palette)}
              className="rounded-card bg-paper p-3 shadow-soft"
              data-testid="sg-category"
            >
              <div className="flex items-center gap-2 px-2 pt-1 pb-3 text-xs text-ink-3">
                <span className="font-numeric font-bold text-ink">{c.number}</span>
                <span className="size-2 rounded-full bg-accent" />
                <span>{c.preview}</span>
              </div>
              <div className="rounded-inner bg-tint p-4">
                <p className="text-2xl font-semibold tracking-tight text-title">{c.name}</p>
                <hr className="my-3 border-deep/15" />
                <p className="text-sm text-deep">{c.tagline}</p>
              </div>
              <div className="mt-3 flex gap-1.5 px-1 font-mono text-[10px] text-ink-3">
                <span>{c.palette.accent}</span>
                <span>{c.palette.tint}</span>
                <span>{c.palette.deep}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16" aria-labelledby="sg-depth">
        <h2 id="sg-depth" className="mb-6 text-sm font-medium tracking-wide text-ink-3 uppercase">
          Depth & shape
        </h2>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {SHADOWS.map((s) => (
            <div key={s} className={`grid h-32 place-items-center rounded-card bg-paper ${s}`}>
              <span className="font-mono text-xs text-ink-3">{s}</span>
            </div>
          ))}
        </div>
      </section>

      <ComponentsShowcase />
    </main>
  );
}
