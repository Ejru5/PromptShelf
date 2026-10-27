import Link from "next/link";
import { CATEGORIES } from "@/config/categories";
import { SavedCount } from "../saved/saved-count";
import { SearchTrigger } from "../search/search-trigger";
import { Logo } from "./logo";
import { SiteMenu } from "./site-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
      <div className="mx-auto flex h-16 w-full max-w-[1320px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Logo />

        <p className="mx-auto hidden text-[0.8125rem] text-ink-3 lg:block">
          Prompts with proof · <span className="text-ink">{CATEGORIES.length} shelves</span>
        </p>

        <nav
          aria-label="Main"
          className="ml-auto hidden items-center gap-6 text-sm md:flex lg:ml-0"
        >
          <Link className="text-ink-2 transition-colors hover:text-ink" href="/shelves">
            Shelves
          </Link>
          <Link className="text-ink-2 transition-colors hover:text-ink" href="/collections">
            Collections
          </Link>
          <Link
            className="inline-flex items-center text-ink-2 transition-colors hover:text-ink"
            href="/saved"
          >
            My shelf
            <SavedCount />
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <SearchTrigger />
          <SiteMenu />
        </div>
      </div>
    </header>
  );
}
