"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * "My shelf" — saved prompts, stored in this browser (no account needed).
 * When accounts arrive, swap this store for an API-backed one with the same hook.
 */
export type SavedEntry = { slug: string; savedAt: number };

const KEY = "promptshelf:saved";
const EVENT = "promptshelf:saved-change";
const EMPTY = "[]";

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(entries: SavedEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* storage blocked — saving just won't persist */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage); // other tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

const cache = { raw: "", value: [] as SavedEntry[] };
export function parseSaved(raw: string): SavedEntry[] {
  if (raw === cache.raw) return cache.value;
  let value: SavedEntry[] = [];
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      value = data.filter(
        (e): e is SavedEntry => typeof e?.slug === "string" && typeof e?.savedAt === "number",
      );
    }
  } catch {
    value = [];
  }
  cache.raw = raw;
  cache.value = value;
  return value;
}

export function useSaved() {
  const raw = useSyncExternalStore(subscribe, read, () => EMPTY);
  const entries = parseSaved(raw);

  const isSaved = useCallback((slug: string) => entries.some((e) => e.slug === slug), [entries]);
  const toggle = useCallback((slug: string) => {
    const current = parseSaved(read());
    const next = current.some((e) => e.slug === slug)
      ? current.filter((e) => e.slug !== slug)
      : [{ slug, savedAt: Date.now() }, ...current];
    write(next);
    return next.some((e) => e.slug === slug);
  }, []);
  const clear = useCallback(() => write([]), []);

  return { entries, isSaved, toggle, clear };
}
