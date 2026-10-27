/**
 * Tiny analytics hook. Emits a DOM event (`promptshelf:track`) that any analytics
 * script can listen to, and forwards to Plausible/PostHog if they're on the page.
 * Nothing is sent anywhere unless you add one of those scripts.
 */
type Win = Window & {
  plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
  posthog?: { capture: (event: string, props?: Record<string, string>) => void };
};

export function track(event: string, props: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("promptshelf:track", { detail: { event, props } }));
  const w = window as Win;
  w.plausible?.(event, { props });
  w.posthog?.capture(event, props);
}

export const trackCopy = (slug: string, kind: string) => track("prompt_copy", { slug, kind });
