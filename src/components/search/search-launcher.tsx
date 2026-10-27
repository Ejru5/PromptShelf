"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { OPEN_EVENT } from "./open-search";

// The palette (and Fuse.js) only download when someone first asks for search.
const CommandPalette = dynamic(() => import("./command-palette"), { ssr: false });

function isTyping(el: EventTarget | null) {
  return (
    el instanceof HTMLElement &&
    (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
  );
}

/** Tiny always-on listener for ⌘K / Ctrl+K / "/" that mounts the real palette on demand. */
export function SearchLauncher() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return; // the palette has its own listeners from now on
    const load = () => setLoaded(true);
    const onKey = (e: KeyboardEvent) => {
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (combo || (e.key === "/" && !isTyping(e.target))) {
        e.preventDefault();
        load();
      }
    };
    window.addEventListener(OPEN_EVENT, load);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, load);
      window.removeEventListener("keydown", onKey);
    };
  }, [loaded]);

  return loaded ? <CommandPalette defaultOpen /> : null;
}
