# Promptshelf

A library of AI prompts — for images, video, motion graphics, UI components, documents,
reports, writing and code — where every prompt comes with the result it produced. Visitors
preview the result, fill in the blanks, and copy the prompt in one click.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000 (rebuilds content as you edit)
```

Requirements: Node 20+. Optional: `ffmpeg` (video posters/metadata for new videos) and
Playwright's Chromium (UI component thumbnails) — both only matter when adding those result types.

## Adding prompts

Only the owner adds prompts, so content lives in the repo as folders — no admin panel or
database to run. See **[docs/CONTENT.md](docs/CONTENT.md)**.

```bash
npm run new-prompt
```

## Project layout

```
content/              prompts and collections (the source of truth)
docs/                 DESIGN.md (visual language), CONTENT.md (authoring), PAID.md (premium plan)
scripts/content/      content build, scaffolders
scripts/seed/         generators for the illustrated placeholder results
src/app/              routes (Next.js App Router)
src/components/       ui/ building blocks, prompt/ cards + detail, viewers/, home/, search/, saved/
src/config/           shelves (categories + colours) and site settings
src/lib/              data access, search, templates, access control, helpers
tests/unit/           Vitest
e2e/                  Playwright (desktop + mobile)
```

## Scripts

| Command            | What it does                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Dev server + content watcher                   |
| `npm run build`    | Build content, then the production site        |
| `npm start`        | Serve the production build                     |
| `npm run check`    | Typecheck + lint + unit tests                  |
| `npm run test:e2e` | Production build + Playwright end-to-end tests |
| `npm run format`   | Prettier                                       |

## Deploying

Any Node host works (Vercel is the simplest). Set `NEXT_PUBLIC_SITE_URL` to your domain so
canonical URLs, the sitemap and social images point at the right place.

The build runs `npm run content` first; it needs no browser or ffmpeg as long as generated
thumbnails/posters and `content/.media-cache.json` are committed (they are created locally).

## How it's built

- **Next.js 16** (App Router, Cache Components, static prerendering), **React 19**, **Tailwind CSS 4**
- Content: Markdown + YAML frontmatter → validated with **Zod** → JSON bundle
- Search: **Fuse.js** (typo-tolerant, per-word), ⌘K palette + `/search`
- Code highlighting: **Shiki** (server-side) · Markdown: **marked**
- UI results run in a sandboxed `<iframe>` (scripts allowed, no same-origin access)
- Tests: **Vitest** + Testing Library, **Playwright**

Design notes: [docs/DESIGN.md](docs/DESIGN.md). Premium plan: [docs/PAID.md](docs/PAID.md).
