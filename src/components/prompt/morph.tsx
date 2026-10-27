import { ViewTransition } from "react";

export const morphName = (slug: string) => `prompt-media-${slug}`;

/**
 * Shared-element morph between a card's media and the detail page's first
 * result. Names must be unique on a page, so grids that may repeat a prompt
 * (like the home page's "New on the shelves") pass `enabled={false}`.
 */
export function Morph({
  slug,
  enabled = true,
  children,
}: {
  slug: string;
  enabled?: boolean;
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <ViewTransition name={morphName(slug)} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
