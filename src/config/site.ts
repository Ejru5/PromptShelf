export const SITE = {
  name: "Promptshelf",
  tagline: "A library of AI prompts — with the results to prove it.",
  description:
    "Browse prompts for images, video, motion graphics, UI components, documents, reports and more. See the real result first, fill in your own details, and copy in one click.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: "Promptshelf",
} as const;

export const NAV = [
  { href: "/shelves", label: "Shelves" },
  { href: "/collections", label: "Collections" },
  { href: "/search", label: "Search" },
  { href: "/saved", label: "My shelf" },
] as const;
