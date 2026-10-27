"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { getCategoryDef, paletteVars } from "@/config/categories";
import { cn } from "@/lib/cn";
import { createSearcher, highlightRuns, type SearchIndex } from "@/lib/search";

import { OPEN_EVENT } from "./open-search";

let indexPromise: Promise<SearchIndex> | undefined;
const loadIndex = () =>
  (indexPromise ??= fetch("/search-index.json").then((r) => {
    if (!r.ok) throw new Error("index");
    return r.json() as Promise<SearchIndex>;
  }));

type Item =
  | {
      kind: "prompt";
      href: string;
      title: string;
      sub: string;
      category: string;
      thumb?: string;
      ranges?: readonly [number, number][];
    }
  | { kind: "shelf"; href: string; title: string; sub: string; category: string }
  | { kind: "collection"; href: string; title: string; sub: string; color: string }
  | { kind: "all"; href: string; title: string; sub: string };

function isTyping(el: EventTarget | null) {
  return (
    el instanceof HTMLElement &&
    (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
  );
}

/** Global ⌘K / Ctrl+K (or "/") search palette. Loaded on first use by SearchLauncher. */
export default function CommandPalette({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const listId = useId();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !isTyping(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => input.current?.select());
      loadIndex().then(setIndex, () => setFailed(true));
    }
    if (!open && d.open) d.close();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const searcher = useMemo(() => (index ? createSearcher(index) : null), [index]);

  const items = useMemo<Item[]>(() => {
    if (!searcher) return [];
    const q = query.trim();
    const prompts = searcher.search(q, { limit: q ? 7 : 5 }).map((h): Item => ({
      kind: "prompt",
      href: `/p/${h.doc.slug}`,
      title: h.doc.title,
      sub: `${h.doc.shelf} · ${h.doc.models[0]}`,
      category: h.doc.category,
      thumb: h.doc.thumb,
      ranges: h.titleMatches,
    }));
    const shelves = searcher
      .shelves(q)
      .slice(0, q ? 3 : 8)
      .map((c): Item => ({
        kind: "shelf",
        href: `/shelves/${c.slug}`,
        title: c.name,
        sub: `Shelf ${c.number}`,
        category: c.slug,
      }));
    const collections = searcher.collections(q, q ? 3 : 2).map((c): Item => ({
      kind: "collection",
      href: `/collections/${c.slug}`,
      title: c.title,
      sub: `Collection · ${c.count} prompts`,
      color: c.color,
    }));
    // Nothing matched: show the empty state rather than a lone "see all" row.
    if (q && prompts.length + shelves.length + collections.length === 0) return [];
    const all: Item[] = q
      ? [
          {
            kind: "all",
            href: `/search?q=${encodeURIComponent(q)}`,
            title: `See all results for “${q}”`,
            sub: "Search page",
          },
        ]
      : [];
    if (!q) return [...shelves, ...prompts, ...collections];
    // A query that names a shelf ("video", "ui") should offer the shelf first.
    const shelfFirst = shelves.some((x) => x.title.toLowerCase().startsWith(q.toLowerCase()));
    return shelfFirst
      ? [...shelves, ...prompts, ...collections, ...all]
      : [...prompts, ...shelves, ...collections, ...all];
  }, [searcher, query]);

  const go = useCallback(
    (item: Item | undefined) => {
      if (!item) return;
      setOpen(false);
      router.push(item.href);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (items.length ? (a + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (items.length ? (a - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(items[Math.min(active, items.length - 1)]);
    }
  };

  const groups: { label: string; kinds: Item["kind"][] }[] = [
    { label: "Prompts", kinds: ["prompt"] },
    { label: "Shelves", kinds: ["shelf"] },
    { label: "Collections", kinds: ["collection"] },
    { label: "", kinds: ["all"] },
  ];
  // Render groups in the same order as the flattened items (so ↑/↓ follows the screen).
  const order = items[0]?.kind === "shelf" ? [groups[1], groups[0], groups[2], groups[3]] : groups;
  const optionId = (i: number) => `${listId}-opt-${i}`;
  const activeIndex = Math.min(active, Math.max(items.length - 1, 0));

  return (
    <dialog
      ref={dialog}
      onClose={() => setOpen(false)}
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      aria-label="Search prompts"
      className="m-0 mx-auto mt-[10vh] max-h-[80dvh] w-[min(640px,calc(100vw-24px))] max-w-none overflow-hidden rounded-card bg-paper p-0 shadow-pop backdrop:bg-ink/35 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search className="size-5 text-ink-3" aria-hidden="true" />
        <input
          ref={input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={items.length ? optionId(activeIndex) : undefined}
          aria-autocomplete="list"
          placeholder="Search prompts, shelves, models…"
          className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-ink-3"
        />
        <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[0.6875rem] text-ink-3">
          esc
        </kbd>
      </div>

      <div
        id={listId}
        role="listbox"
        aria-label="Results"
        className="max-h-[min(60dvh,460px)] overflow-y-auto p-2"
      >
        {failed ? (
          <p className="p-6 text-center text-sm text-ink-3">
            Search couldn&apos;t load. Try the search page instead.
          </p>
        ) : !index ? (
          <p className="p-6 text-center text-sm text-ink-3">Loading…</p>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-hand text-2xl text-ink-3">nothing on this shelf…</p>
            <p className="mt-1 text-sm text-ink-3">
              Try a model name, a shelf, or a word like “poster”.
            </p>
          </div>
        ) : (
          order.map((g) => {
            const rows = items
              .map((item, i) => ({ item, i }))
              .filter(({ item }) => g.kinds.includes(item.kind));
            if (!rows.length) return null;
            return (
              <div key={g.label || "all"} role="group" aria-label={g.label || undefined}>
                {g.label ? (
                  <p className="px-3 pt-3 pb-1.5 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-3 uppercase">
                    {g.label}
                  </p>
                ) : null}
                {rows.map(({ item, i }) => {
                  const cat = "category" in item ? getCategoryDef(item.category) : undefined;
                  return (
                    <div
                      key={item.href}
                      id={optionId(i)}
                      role="option"
                      aria-selected={i === activeIndex}
                      onMouseMove={() => i !== active && setActive(i)}
                      onClick={() => go(item)}
                      style={cat ? paletteVars(cat.palette) : undefined}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm",
                        i === activeIndex ? "bg-ink text-paper" : "text-ink",
                      )}
                    >
                      <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-tint text-xs font-bold text-deep">
                        {item.kind === "prompt" && item.thumb ? (
                          <Image
                            src={item.thumb}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : item.kind === "collection" ? (
                          <span className="h-full w-full" style={{ background: item.color }} />
                        ) : item.kind === "all" ? (
                          <ArrowRight className="size-4 text-ink" aria-hidden="true" />
                        ) : (
                          <span className="font-numeric">{cat?.number}</span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {item.kind === "prompt"
                            ? highlightRuns(item.title, item.ranges).map((r, k) =>
                                r.hit ? (
                                  <mark
                                    key={k}
                                    className={cn(
                                      "rounded-sm bg-transparent underline decoration-2 underline-offset-2",
                                      i === activeIndex
                                        ? "text-paper decoration-paper/60"
                                        : "text-ink decoration-accent",
                                    )}
                                  >
                                    {r.text}
                                  </mark>
                                ) : (
                                  <span key={k}>{r.text}</span>
                                ),
                              )
                            : item.title}
                        </span>
                        <span
                          className={cn(
                            "block truncate text-xs",
                            i === activeIndex ? "text-paper/65" : "text-ink-3",
                          )}
                        >
                          {item.sub}
                        </span>
                      </span>
                      {i === activeIndex ? <span className="text-xs text-paper/65">↵</span> : null}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-line bg-canvas/60 px-4 py-2.5 text-[0.6875rem] text-ink-3">
        <span>
          <kbd className="font-mono">↑↓</kbd> navigate
        </span>
        <span>
          <kbd className="font-mono">↵</kbd> open
        </span>
        <span className="ml-auto">
          <kbd className="font-mono">/</kbd> or <kbd className="font-mono">⌘K</kbd> anywhere
        </span>
      </div>
    </dialog>
  );
}
