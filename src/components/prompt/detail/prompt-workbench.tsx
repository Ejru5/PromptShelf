"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Copy, ExternalLink, RotateCcw, Share2 } from "lucide-react";
import { SaveButton } from "@/components/saved/save-button";
import { Annotation } from "@/components/ui/annotation";
import { useToast } from "@/components/ui/toast";
import type { Blank } from "@/content/schema";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/cn";
import { fillTemplate, parseTemplate } from "@/lib/prompt-template";
import { trackCopy } from "@/lib/track";

type Values = Record<string, string>;

const storageKey = (slug: string) => `promptshelf:blanks:${slug}`;

function loadValues(slug: string): Values | null {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    return raw ? (JSON.parse(raw) as Values) : null;
  } catch {
    return null;
  }
}
function saveValues(slug: string, values: Values) {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(values));
  } catch {
    /* private mode / storage disabled — values just won't persist */
  }
}

/** Chat apps that accept a prefilled prompt in the URL. */
const OPEN_IN: { model: RegExp; label: string; url: (q: string) => string }[] = [
  {
    model: /^claude/i,
    label: "Claude",
    url: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
  },
  {
    model: /^chatgpt/i,
    label: "ChatGPT",
    url: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
  },
];

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

/**
 * The interactive prompt: blanks become labelled fields and live chips in the
 * text; Copy puts the filled-in prompt on the clipboard (unfilled blanks stay
 * as {{name}} so nothing is silently dropped).
 */
export function PromptWorkbench({
  slug,
  title,
  template,
  blanks,
  models,
}: {
  slug: string;
  title: string;
  template: string;
  blanks: Blank[];
  models: string[];
}) {
  const defaults = useMemo(
    () => Object.fromEntries(blanks.map((b) => [b.name, b.default ?? ""])),
    [blanks],
  );
  const [values, setValues] = useState<Values>(defaults);
  const [activeBlank, setActiveBlank] = useState<string | null>(null);
  const [peel, setPeel] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const toast = useToast();
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});
  const restored = useRef(false);
  const id = useId();

  // Restore what this visitor typed last time (per prompt, this browser only).
  useEffect(() => {
    const saved = loadValues(slug);
    restored.current = true;
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage after mount
      setValues((v) => ({
        ...v,
        ...Object.fromEntries(Object.entries(saved).filter(([k]) => k in defaults)),
      }));
    }
  }, [slug, defaults]);

  useEffect(() => {
    if (restored.current) saveValues(slug, values);
  }, [slug, values]);

  const filled = useMemo(() => fillTemplate(template, values), [template, values]);
  const filledCount = blanks.filter((b) => values[b.name]?.trim()).length;
  const changed = blanks.some((b) => (values[b.name] ?? "") !== (b.default ?? ""));
  const openIn = OPEN_IN.filter((o) => models.some((m) => o.model.test(m)));

  const doCopy = useCallback(
    async (text: string, kind: "filled" | "original") => {
      const ok = await copyText(text);
      if (!ok) {
        toast("Couldn't reach the clipboard — select the text and copy it manually.");
        return;
      }
      setPeel((n) => n + 1);
      const missing = blanks.length - filledCount;
      toast(
        kind === "original"
          ? "copied the original ↗"
          : missing > 0
            ? `copied! ${missing} blank${missing > 1 ? "s" : ""} left as {{…}}`
            : "copied! go make something ↗",
        { variant: "note" },
      );
      trackCopy(slug, kind);
    },
    [blanks.length, filledCount, slug, toast],
  );

  // "C" copies the filled prompt (when not typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() !== "c" ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        isTypingTarget(e.target)
      )
        return;
      if (window.getSelection()?.toString()) return; // let people copy a selection normally
      e.preventDefault();
      void doCopy(filled, "filled");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doCopy, filled]);

  const share = async () => {
    const url = window.location.href.split("#")[0];
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled — fall back to copying */
      }
    }
    if (await copyText(url)) toast("Link copied");
  };

  const focusBlank = (name: string) => {
    const el = fieldRefs.current[name];
    el?.focus();
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  return (
    <div className="relative" id="prompt">
      <Annotation
        direction="down-left"
        arrowPosition="after"
        className="absolute -top-9 right-6"
        tilt={-3}
      >
        fill in the highlighted bits
      </Annotation>

      <div
        key={peel}
        data-peel
        className={cn(
          "relative origin-top-left rounded-card bg-paper p-5 shadow-soft sm:p-6",
          peel > 0 && "animate-[peel_700ms_var(--ease-out-soft)]",
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">Prompt</h2>
          <div className="flex items-center gap-3 text-xs">
            {blanks.length ? (
              <span className="text-deep" aria-live="polite">
                {filledCount}/{blanks.length} blanks filled
              </span>
            ) : null}
            {changed ? (
              <button
                type="button"
                onClick={() => setValues(defaults)}
                className="inline-flex items-center gap-1 text-ink-3 hover:text-ink"
              >
                <RotateCcw className="size-3" aria-hidden="true" /> Reset
              </button>
            ) : null}
          </div>
        </div>

        <p
          className="font-mono text-[0.8125rem] leading-[1.8] break-words whitespace-pre-wrap text-ink"
          data-testid="prompt-text"
        >
          {parseTemplate(template).map((seg, i) => {
            if (seg.type === "text") return <span key={i}>{seg.value}</span>;
            const blank = blanks.find((b) => b.name === seg.name);
            const value = values[seg.name]?.trim();
            const label = blank?.label ?? seg.name;
            const shown = value || label.toLowerCase();
            return (
              <button
                key={i}
                type="button"
                data-blank={seg.name}
                onClick={() => focusBlank(seg.name)}
                // Visible text first (WCAG 2.5.3 "label in name"), then what the button does.
                aria-label={`${shown}, edit ${label.toLowerCase()}`}
                className={cn(
                  "rounded-md box-decoration-clone px-1 py-0.5 text-left transition-[background-color,box-shadow]",
                  value
                    ? "bg-tint text-deep"
                    : "bg-tint/70 text-deep italic ring-1 ring-deep/25 ring-inset",
                  activeBlank === seg.name && "ring-2 ring-accent",
                )}
              >
                {shown}
              </button>
            );
          })}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="relative flex">
            <button
              type="button"
              onClick={() => doCopy(filled, "filled")}
              className="inline-flex h-11 items-center gap-2 rounded-l-full bg-ink pr-4 pl-5 text-sm font-medium text-paper transition hover:bg-ink/85 active:scale-[0.98]"
            >
              <Copy className="size-4" aria-hidden="true" /> Copy prompt
              <kbd className="ml-1 hidden rounded bg-white/15 px-1.5 font-mono text-[0.625rem] sm:inline">
                C
              </kbd>
            </button>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="More copy options"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex h-11 items-center rounded-r-full border-l border-white/15 bg-ink px-3 text-paper transition hover:bg-ink/85"
            >
              <ChevronDown className="size-4" aria-hidden="true" />
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute top-full left-0 z-30 mt-2 w-56 animate-pop-in rounded-inner bg-paper p-1.5 shadow-pop"
                onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
              >
                <button
                  type="button"
                  role="menuitem"
                  autoFocus
                  onClick={() => {
                    setMenuOpen(false);
                    void doCopy(fillTemplate(template, {}), "original");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-canvas"
                >
                  Copy original template
                  <span className="block text-xs text-ink-3">Keeps every {"{{blank}}"}</span>
                </button>
              </div>
            ) : null}
          </div>
          {openIn.map((o) => (
            <a
              key={o.label}
              href={o.url(filled)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCopy(slug, `open-${o.label.toLowerCase()}`)}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-paper px-4 text-sm font-medium shadow-soft transition-shadow hover:shadow-lift"
            >
              Open in {o.label}
              <ExternalLink className="size-3.5 text-ink-3" aria-hidden="true" />
            </a>
          ))}
          <SaveButton slug={slug} title={title} className="ml-auto" />
          <button
            type="button"
            onClick={share}
            className="grid size-11 place-items-center rounded-full text-ink-2 transition hover:bg-canvas hover:text-ink"
            aria-label="Share this prompt"
          >
            <Share2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {blanks.length ? (
        <fieldset className="mt-4 rounded-card bg-tint/60 p-4 sm:p-5">
          <legend className="sr-only">Fill in the blanks</legend>
          <p
            aria-hidden="true"
            className="mb-3 text-xs font-semibold tracking-[0.14em] text-deep uppercase"
          >
            Fill in the blanks
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {blanks.map((b) => {
              const fieldId = `${id}-${b.name}`;
              const common = {
                id: fieldId,
                value: values[b.name] ?? "",
                onFocus: () => setActiveBlank(b.name),
                onBlur: () => setActiveBlank(null),
                className:
                  "h-10 w-full rounded-xl border border-deep/15 bg-paper px-3 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-deep/40 focus:ring-4 focus:ring-accent/15",
              };
              return (
                <div
                  key={b.name}
                  className={cn(b.options || (b.default ?? "").length < 40 ? "" : "sm:col-span-2")}
                >
                  <label htmlFor={fieldId} className="mb-1 block text-xs font-medium text-deep">
                    {b.label}
                  </label>
                  {b.options ? (
                    <select
                      {...common}
                      ref={(el) => {
                        fieldRefs.current[b.name] = el;
                      }}
                      onChange={(e) => setValues((v) => ({ ...v, [b.name]: e.target.value }))}
                    >
                      {b.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...common}
                      ref={(el) => {
                        fieldRefs.current[b.name] = el;
                      }}
                      type="text"
                      placeholder={b.placeholder ?? b.default ?? `Your ${b.label.toLowerCase()}`}
                      onChange={(e) => setValues((v) => ({ ...v, [b.name]: e.target.value }))}
                      autoComplete="off"
                    />
                  )}
                  {b.hint ? <p className="mt-1 text-xs text-ink-3">{b.hint}</p> : null}
                </div>
              );
            })}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
