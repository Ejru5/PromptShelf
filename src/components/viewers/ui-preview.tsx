"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Monitor, Moon, RotateCw, Smartphone, Sun, Tablet } from "lucide-react";
import type { Media } from "@/content/schema";
import { cn } from "@/lib/cn";
import { ResultImage } from "../prompt/result-image";

const VIEWPORTS = {
  desktop: { width: 1200, label: "Desktop", Icon: Monitor },
  tablet: { width: 768, label: "Tablet", Icon: Tablet },
  mobile: { width: 390, label: "Mobile", Icon: Smartphone },
} as const;
type Viewport = keyof typeof VIEWPORTS;
/** Same breakpoint as Tailwind's `sm` — keep the CSS default and the JS default in sync. */
const WIDE_QUERY = "(min-width: 640px)";
const frameHeight = (v: Viewport, height: number) =>
  v === "desktop" ? height : Math.max(height, 640);

/**
 * Live preview of a generated UI component.
 *
 * Security: the HTML runs in an iframe with `sandbox="allow-scripts allow-forms"`
 * and *without* `allow-same-origin`, so it gets an opaque origin — it can run
 * its own JS but can't read this site's cookies, storage or DOM.
 */
export function UiPreview({
  html,
  height,
  title,
  code,
  thumbnail,
  filename = "component.html",
}: {
  html: string;
  /** Static render shown instantly (wide screens) until the live frame loads. */
  thumbnail?: Media;
  height: number;
  title: string;
  /** Server-highlighted source for the Code tab. */
  code: React.ReactNode;
  filename?: string;
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  // `picked` is the visitor's explicit choice; until then the default follows the screen:
  // CSS sizes the box per breakpoint (no layout shift) and JS reads the same media query.
  const [picked, setViewport] = useState<Viewport | null>(null);
  const [wide, setWide] = useState(true);
  const [dark, setDark] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [containerW, setContainerW] = useState(0);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const mq = window.matchMedia(WIDE_QUERY);
    const onMq = () => setWide(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    const ro = new ResizeObserver(([e]) => setContainerW(e.contentRect.width));
    ro.observe(el);
    return () => {
      mq.removeEventListener("change", onMq);
      ro.disconnect();
    };
  }, []);

  // A plain file download (not a blob tab) keeps the component out of our origin.
  const download = () => {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const viewport: Viewport = picked ?? (wide ? "desktop" : "mobile");
  const frameW = VIEWPORTS[viewport].width;
  // contentRect excludes the stage's padding, so this is the space the frame can use.
  const scale = containerW ? Math.min(1, containerW / frameW) : 1;
  const frameH = frameHeight(viewport, height);
  const boxStyle: React.CSSProperties = picked
    ? { maxWidth: frameW, aspectRatio: `${frameW} / ${frameH}` }
    : ({
        "--w-d": `${VIEWPORTS.desktop.width}px`,
        "--a-d": `${VIEWPORTS.desktop.width} / ${frameHeight("desktop", height)}`,
        "--w-m": `${VIEWPORTS.mobile.width}px`,
        "--a-m": `${VIEWPORTS.mobile.width} / ${frameHeight("mobile", height)}`,
      } as React.CSSProperties);

  return (
    <div className="overflow-hidden rounded-card bg-paper shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div role="tablist" aria-label="View" className="flex rounded-full bg-canvas p-0.5">
          {(["preview", "code"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                tab === t ? "bg-paper text-ink shadow-soft" : "text-ink-3 hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {tab === "preview" ? (
            <>
              <div role="group" aria-label="Viewport" className="flex rounded-full bg-canvas p-0.5">
                {(Object.keys(VIEWPORTS) as Viewport[]).map((v) => {
                  const { Icon, label } = VIEWPORTS[v];
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={viewport === v}
                      aria-label={label}
                      title={label}
                      onClick={() => setViewport(v)}
                      className={cn(
                        "grid size-7 place-items-center rounded-full transition-colors",
                        viewport === v
                          ? "bg-paper text-ink shadow-soft"
                          : "text-ink-3 hover:text-ink",
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setDark((d) => !d)}
                aria-pressed={dark}
                aria-label="Dark surround"
                title="Dark surround"
                className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-canvas hover:text-ink"
              >
                {dark ? (
                  <Sun className="size-3.5" aria-hidden="true" />
                ) : (
                  <Moon className="size-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                aria-label="Reload preview"
                title="Reload preview"
                className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-canvas hover:text-ink"
              >
                <RotateCw className="size-3.5" aria-hidden="true" />
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={download}
            aria-label="Download HTML"
            title="Download HTML"
            className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-canvas hover:text-ink"
          >
            <Download className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={stage}
        className={cn(
          "relative overflow-hidden p-4 transition-colors duration-300",
          tab === "code" && "hidden",
          dark
            ? "bg-[#101114]"
            : "bg-canvas bg-[radial-gradient(circle_at_1px_1px,#d9d6cf_1px,transparent_0)] [background-size:16px_16px]",
        )}
      >
        {/* The box reserves exactly the scaled frame's size with CSS, so nothing shifts while
            JS measures; JS only sets the visual scale of the frame inside it. */}
        <div
          className={cn(
            "relative mx-auto w-full",
            !picked &&
              "[aspect-ratio:var(--a-m)] max-w-(--w-m) sm:[aspect-ratio:var(--a-d)] sm:max-w-(--w-d)",
          )}
          style={boxStyle}
        >
          <div
            className={cn(
              "absolute top-0 left-0 origin-top-left overflow-hidden bg-white shadow-pop transition-[border-radius] duration-300",
              viewport === "mobile"
                ? "rounded-[28px] ring-8 ring-ink"
                : viewport === "tablet"
                  ? "rounded-[18px] ring-6 ring-ink"
                  : "rounded-[10px]",
            )}
            style={{ width: frameW, height: frameH, transform: `scale(${scale})` }}
          >
            {thumbnail && !picked && viewport === "desktop" && !loaded ? (
              <ResultImage
                media={thumbnail}
                alt=""
                fill
                preload
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="hidden object-top sm:block"
              />
            ) : null}
            {/* Mount only after measuring, so the frame starts in the right viewport (no reflow mid-load). */}
            {containerW > 0 ? (
              <iframe
                key={reloadKey}
                title={`${title} — live preview`}
                srcDoc={html}
                sandbox="allow-scripts allow-forms"
                referrerPolicy="no-referrer"
                loading="lazy"
                onLoad={() => setLoaded(true)}
                className="relative block h-full w-full border-0"
              />
            ) : null}
          </div>
        </div>
        <span className="pointer-events-none absolute right-3 bottom-2 font-numeric text-[0.625rem] text-ink-3">
          {frameW}px{scale < 1 ? ` · ${Math.round(scale * 100)}%` : ""}
        </span>
      </div>

      {tab === "code" ? <div className="max-h-[640px] overflow-auto">{code}</div> : null}
    </div>
  );
}
