"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { CATEGORIES, paletteVars } from "@/config/categories";
import { Logo } from "./logo";

/**
 * Full-screen menu (WOVE-style overlay). Uses a native <dialog> so focus
 * trapping and Escape-to-close come for free.
 */
export function SiteMenu() {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  // The header persists across navigations; make sure a hidden route never
  // leaves the menu open (see Next's "Preserving UI state" guide).
  useLayoutEffect(() => () => setOpen(false), []);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-full transition-colors hover:bg-paper"
      >
        <span className="sr-only">Open menu</span>
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M10 17h10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <dialog
        ref={ref}
        onClose={close}
        aria-label="Site menu"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-2 backdrop:bg-ink/40 backdrop:backdrop-blur-md sm:p-4"
      >
        <div className="flex h-full animate-fade-up flex-col overflow-y-auto rounded-card bg-[#efeeea] paper-grain px-5 py-5 sm:px-10 sm:py-8">
          <div className="flex items-center justify-between">
            <Logo onNavigate={close} />
            <button
              type="button"
              onClick={close}
              className="grid size-10 place-items-center rounded-full transition-colors hover:bg-paper"
            >
              <X className="size-6 stroke-[1.25]" aria-hidden="true" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <div className="my-auto grid gap-12 py-10 lg:grid-cols-[1fr_auto] lg:gap-24">
            <nav aria-label="Shelves">
              <ul className="grid gap-x-12 gap-y-1 sm:grid-cols-2">
                {CATEGORIES.map((c, i) => (
                  <li
                    key={c.slug}
                    style={{ ...paletteVars(c.palette), animationDelay: `${60 + i * 35}ms` }}
                    className="animate-fade-up"
                  >
                    <Link
                      href={`/shelves/${c.slug}`}
                      onNavigate={close}
                      className="group flex items-baseline gap-4 py-2"
                    >
                      <span className="font-numeric text-xl font-bold text-ink sm:text-2xl">
                        {c.number}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-3xl font-semibold tracking-tight text-ink/55 transition-colors duration-200 group-hover:text-title sm:text-4xl">
                          {c.name}
                        </span>
                        <span className="text-sm text-ink-3">{c.tagline}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Explore" className="flex flex-col gap-3 text-lg lg:pt-3">
              {[
                ["/shelves", "All shelves"],
                ["/collections", "Collections"],
                ["/search", "Search"],
                ["/saved", "My shelf"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onNavigate={close}
                  className="text-ink-2 transition-colors hover:text-ink"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-3">
            <p className="flex items-center gap-3">
              Made by <span className="h-px w-10 bg-ink-3" aria-hidden="true" />
              <span className="font-medium text-ink">Promptshelf</span>
            </p>
            <p>All prompts free to copy.</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
