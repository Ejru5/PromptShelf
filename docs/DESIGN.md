# Promptshelf — design direction

**Idea:** a library you browse like a bookshelf. Every prompt is a "book" with a coloured
cover; categories are shelves; curated packs are collections. The detail page reads like an
editorial book listing.

Live reference: run the app and open `/styleguide`.

## Where each reference shows up

| Reference              | What we took                                               | Where                                  |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------- |
| WOVE (curved menu)     | Arc of numbered items with slashed-zero mono numerals      | Home hero category dial                |
| Step cards             | Folder-tab label panels, pastel per category, margin notes | Prompt cards, "How it works"           |
| Photo Gallery          | Huge headline + small pill, mixed-size grid                | Category headers, visual result grids  |
| Gestalten book listing | Editorial title, spec table, side shelf of related items   | Prompt detail page                     |
| Paper Store            | Colourful book covers with title/author/price line         | Collections, document & report shelves |

## Tokens

Defined in `src/app/globals.css` (`@theme`) and `src/config/categories.ts`.

- **Canvas** `#F1F0ED` warm paper, **paper** `#FFFFFF` cards, **ink** `#141414`.
- **Secondary text** `ink-2 #4C4A46` (7.8:1 on canvas). **Muted** `ink-3 #696660` (5.0:1 on canvas — fine for
  small captions and meta text).
- **Category palette** — each shelf has `accent` (fills/dots), `title` (big headings on tint,
  ≥ 3:1), `tint` (pale panel) and `deep` (small text on tint, ≥ 4.5:1). Components receive them as
  CSS variables via `paletteVars()` and use `bg-tint`, `text-title`, `text-deep`, `bg-accent`.

| #   | Shelf            | Accent    | Tint      | Deep      | Preview  |
| --- | ---------------- | --------- | --------- | --------- | -------- |
| 01  | Images           | `#E5561F` | `#FDEDE5` | `#A93C0E` | image    |
| 02  | Video            | `#2A80EB` | `#E4F0FD` | `#11549F` | video    |
| 03  | Motion graphics  | `#7B4DF0` | `#EFE8FE` | `#5226BD` | video    |
| 04  | UI components    | `#F2B81F` | `#FDF5DA` | `#7A5700` | ui       |
| 05  | Documents & PDFs | `#E5484D` | `#FCE6E6` | `#A82025` | document |
| 06  | Reports & data   | `#1C9660` | `#E2F5EB` | `#106A42` | document |
| 07  | Writing & copy   | `#DD4387` | `#FCE7F0` | `#A3215A` | text     |
| 08  | Code & dev       | `#0F9592` | `#DFF5F4` | `#0A6966` | code     |

UI components' yellow accent is too light for text, so its `title` is `#A67700`.

## Type

| Role         | Font           | Use                                               |
| ------------ | -------------- | ------------------------------------------------- |
| Display / UI | Inter Tight    | Headlines (`text-display-xl`, `text-display`), UI |
| Editorial    | Newsreader     | Prompt titles + descriptions on the detail page   |
| Mono         | JetBrains Mono | Prompt text, dial numbers (slashed zero), specs   |
| Hand         | Caveat         | Margin notes and the "copied!" toast only         |

## Shape & depth

- Cards `rounded-card` (24px), inner panels `rounded-inner` (16px), book covers 6px.
- Shadows: `soft` (resting), `lift` (hover), `cover` (book covers), `pop` (menus, toasts).

## Motion

- Durations: 150ms (exit), 250ms (UI), 400ms (move/morph). Easing `ease-out-soft`, springs for
  the dial.
- Card → detail page: shared-element morph via React `<ViewTransition>`.
- Copy: the card's label panel peels up like a sticky note, then a handwritten "copied!" toast.
- Everything respects `prefers-reduced-motion`.

## Signature pieces

1. **Category dial** — arc of numbered shelves; scroll, drag or arrow keys to turn. On phones it
   becomes a horizontal snap strip.
2. **Folder-tab cards** — pale label panel with a raised tab.
3. **Fill-in blanks** — `{{subject}}` in a prompt becomes an inline editable field.
4. **Copy peel** — the label peels like a sticky note.
5. **Before/after slider** for image edits.
6. **Side shelf** of related prompts on the detail page.
7. **Margin notes** in handwriting, decoration only, hidden on small screens.

## Paid-ready

Every prompt has an `access` field (`free` now; `premium` later). Cards already render an access
line (like Paper Store's "Free / 1 Credit"), so turning on paid prompts is a content + gate change,
not a redesign.
