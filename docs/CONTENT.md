# Adding prompts

Every prompt is a folder. Everything about it — the text, settings and its results — lives
in that folder, and `npm run content` turns all folders into the data the site reads.

```
content/
  prompts/
    images/                         ← the shelf (folder name = category)
      golden-hour-desert-portrait/  ← the URL: /p/golden-hour-desert-portrait
        prompt.md                   ← frontmatter + the prompt text
        golden.jpg                  ← result files
        blue-hour.jpg
  collections/
    starter-pack.md                 ← /collections/starter-pack
```

## The quick way

```bash
npm run new-prompt            # asks for shelf, title, models, result type
npm run dev                   # site + live content rebuilds on every save
```

Or skip the questions:

```bash
npm run new-prompt -- --shelf ui --title "Pricing table" --models "Claude, v0" --type ui --yes
```

## `prompt.md`

```markdown
---
title: Golden-hour desert portrait # required, 3–90 chars
summary: A cinematic, wind-swept portrait… # required, one sentence (shown in italics)
category: images # required, must match the shelf folder
models: [Midjourney v7, Flux 1.1 Pro] # required, first one is shown on cards
created: 2026-10-21 # required, YYYY-MM-DD (newest first everywhere)

tags: [portrait, cinematic] # searchable
difficulty: beginner # beginner | intermediate | advanced
access: free # free | premium  (see PAID.md)
featured: true # can appear in the home page "Featured" grid
updated: 2026-10-25 # optional; defaults to created

settings: # rows in the details table
  Aspect ratio: "3:2"
  Style: raw

blanks: # optional config for each {{blank}}
  subject:
    label: Subject # field label (default: "Subject" from the name)
    default: a woman in a flowing red dress # pre-filled value
    placeholder: Who's on the dune?
    hint: Shown under the field
  light:
    options: [golden hour, blue hour] # makes a dropdown (default must be one of them)

notes: # "Tips" list
  - Keep the subject small in the frame.

results: # the proof — files live in this folder
  - type: image
    file: golden.jpg
    alt: Describe the image for screen readers
    model: Midjourney v7
    caption: golden hour # label on the result tab
cover: 0 # which result is the card thumbnail
---

Cinematic wide shot of {{subject}} standing on a dune at {{light}} …
```

Everything below the second `---` is the prompt. Any `{{name}}` becomes a blank people can fill
in (letters, digits, `_` and `-`). Unfilled blanks are copied as `{{name}}` so nothing is lost.

## Result types

| Type           | Fields                                                | Shown as                          |
| -------------- | ----------------------------------------------------- | --------------------------------- |
| `image`        | `file`, `alt`                                         | Image with full-screen zoom       |
| `before-after` | `before`, `after`, `alt`, `beforeLabel`, `afterLabel` | Drag slider                       |
| `video`        | `file` (.mp4/.webm), `alt`, `poster`                  | Silent autoplay loop              |
| `ui`           | `file` (.html), `height`, `alt`                       | Live sandboxed preview + code tab |
| `document`     | `pages` (images), `pdf`, `alt`                        | Page flipper + PDF download       |
| `text`         | `file` (.md or .txt)                                  | Typeset sample output             |
| `code`         | `file`, `language`, `filename`                        | Highlighted code with copy button |

All types also take optional `model`, `caption` and `placeholder: true`.

Good to know:

- **Video**: put `clip.webm` next to `clip.mp4` and both are offered (some browsers lack H.264).
  A poster is extracted automatically (`clip.poster.jpg`) if you have ffmpeg; commit it.
- **UI**: the HTML runs in a sandbox with no access to the site — keep CSS/JS inline. A
  thumbnail (`component.thumb.webp`) is rendered automatically with Playwright; commit it.
- **Images** are measured and given blur placeholders automatically. JPG/PNG/WebP all work.
- **Placeholder results**: the seeded results are illustrations with `placeholder: true`. In
  `npm run dev` they show a yellow "placeholder" note. `npm run content:placeholders` lists
  every prompt that still needs a real result.

## Collections

```bash
npm run new-collection -- --title "Brand kit" --prompts "swiss-style-event-poster,geometric-logo-reveal"
```

```markdown
---
title: Brand kit
description: Everything for a new identity — logo sting, poster and launch copy.
color: "#2A80EB" # cover colour
art: spark # orbits | stack | grid | wave | spark | frames
order: 3 # lower comes first (also sets the № on the cover)
featured: false
access: free
prompts: # prompt folder names, in order
  - geometric-logo-reveal
  - swiss-style-event-poster
---
```

## Commands

| Command                        | What it does                                                    |
| ------------------------------ | --------------------------------------------------------------- |
| `npm run dev`                  | Dev server + rebuilds content whenever `content/` changes       |
| `npm run content`              | Validate + build content once (runs automatically before build) |
| `npm run content:placeholders` | List prompts that still use placeholder results                 |
| `npm run new-prompt`           | Scaffold a prompt folder                                        |
| `npm run new-collection`       | Scaffold a collection                                           |
| `npm run seed:media`           | Re-generate the illustrated placeholder media (needs ffmpeg)    |

## When the build complains

Errors always name the file and the field, for example:

```
✗ Content has 2 problems:
  • content/prompts/images/my-prompt/prompt.md: category "video" doesn't match its folder "content/prompts/images"
  • content/prompts/writing/email/prompt.md: blanks.tone is configured but {{tone}} isn't in the prompt
```

Fix them and save — `npm run dev` rebuilds automatically.
