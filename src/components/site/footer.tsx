import Link from "next/link";
import { cacheLife } from "next/cache";
import { CATEGORIES } from "@/config/categories";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-auto px-2 pt-24 pb-2 sm:px-4 sm:pb-4">
      <div className="mx-auto w-full max-w-[1320px] rounded-card bg-paper px-5 py-10 shadow-soft sm:px-10 sm:py-14">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm text-[clamp(2rem,1.4rem+2vw,3.25rem)] leading-none font-semibold tracking-[-0.035em] text-balance-safe">
              Find it. See it. <span className="text-ink-3">Make it yours.</span>
            </p>
          </div>
          <nav aria-label="Shelves (footer)">
            <h2 className="mb-4 text-xs font-medium tracking-wide text-ink-3 uppercase">Shelves</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shelves/${c.slug}`}
                    className="text-ink-2 transition-colors hover:text-ink"
                  >
                    <span className="mr-2 font-numeric text-xs text-ink-3">{c.number}</span>
                    {c.short}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Explore (footer)">
            <h2 className="mb-4 text-xs font-medium tracking-wide text-ink-3 uppercase">Explore</h2>
            <ul className="grid gap-2 text-sm">
              {[
                ["/collections", "Collections"],
                ["/search", "Search"],
                ["/saved", "My shelf"],
                ["/#how-it-works", "How it works"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-ink-2 transition-colors hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-3">
          <p className="flex items-center gap-3">
            Made by <span className="h-px w-10 bg-ink-3" aria-hidden="true" />
            <span className="font-medium text-ink">Promptshelf</span>
          </p>
          <p>
            © <CopyrightYear /> Promptshelf. All prompts free to copy.
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Cached so reading the clock doesn't make every page dynamic. */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
