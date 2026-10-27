export const OPEN_EVENT = "promptshelf:open-search";

/** Open the ⌘K palette from anywhere (loads it on first use). */
export const openSearch = () => window.dispatchEvent(new Event(OPEN_EVENT));
