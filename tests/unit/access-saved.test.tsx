import { act, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { PremiumGate } from "@/components/prompt/detail/premium-gate";
import { ANONYMOUS, canAccess, getViewer, publicExcerpt, redactPrompt } from "@/lib/access";
import { getPrompt, toCard } from "@/lib/content";
import { parseSaved, useSaved } from "@/lib/saved";
import { buildSearchIndex } from "@/lib/search";

describe("access (paid-ready)", async () => {
  const base = (await getPrompt("refactor-class-to-hooks"))!;
  const premium = { ...base, access: "premium" as const };

  it("everyone is an anonymous free viewer today", async () => {
    expect(await getViewer()).toEqual(ANONYMOUS);
  });

  it("free items are open to all; premium needs the pro plan", () => {
    expect(canAccess(base, ANONYMOUS)).toBe(true);
    expect(canAccess(premium, ANONYMOUS)).toBe(false);
    expect(canAccess(premium, { id: "u1", plan: "pro" })).toBe(true);
  });

  it("redaction strips the template, excerpt and tips but keeps the results", () => {
    const r = redactPrompt(premium);
    expect(r.template.length).toBeLessThan(base.template.length);
    expect(r.template.endsWith("…")).toBe(true);
    expect(r.excerpt).toBe(base.summary);
    expect(r.notes).toEqual([]);
    expect(r.results).toEqual(base.results);
  });

  it("premium prompts never leak text into cards or the search index", () => {
    expect(publicExcerpt(premium)).toBe(premium.summary);
    const card = toCard(premium);
    expect(card.excerpt).toBe(premium.summary);
    expect(card.snippet).toBeUndefined();
    const index = buildSearchIndex([premium], []);
    expect(JSON.stringify(index)).not.toContain("AbortController");
  });

  it("the gate renders the teaser and lock, not the prompt", () => {
    const r = redactPrompt(premium);
    render(<PremiumGate teaser={r.template} blankCount={r.blanks.length} />);
    expect(screen.getByText("This is a Premium prompt")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("AbortController");
  });
});

describe("My shelf store", () => {
  beforeEach(() => localStorage.clear());

  it("parses defensively", () => {
    expect(parseSaved("not json")).toEqual([]);
    expect(parseSaved('[{"slug":"a","savedAt":1},{"slug":2},null]')).toEqual([
      { slug: "a", savedAt: 1 },
    ]);
  });

  it("toggles, orders newest first, and clears", () => {
    const { result } = renderHook(() => useSaved());
    act(() => {
      result.current.toggle("first");
    });
    act(() => {
      result.current.toggle("second");
    });
    expect(result.current.entries.map((e) => e.slug)).toEqual(["second", "first"]);
    expect(result.current.isSaved("first")).toBe(true);
    act(() => {
      result.current.toggle("first");
    });
    expect(result.current.isSaved("first")).toBe(false);
    act(() => result.current.clear());
    expect(result.current.entries).toEqual([]);
  });

  it("syncs between hook instances (and tabs via the storage event)", () => {
    const a = renderHook(() => useSaved());
    const b = renderHook(() => useSaved());
    act(() => {
      a.result.current.toggle("shared");
    });
    expect(b.result.current.isSaved("shared")).toBe(true);
    act(() => {
      localStorage.setItem(
        "promptshelf:saved",
        JSON.stringify([{ slug: "from-other-tab", savedAt: 5 }]),
      );
      window.dispatchEvent(new StorageEvent("storage", { key: "promptshelf:saved" }));
    });
    expect(b.result.current.entries.map((e) => e.slug)).toEqual(["from-other-tab"]);
  });
});
