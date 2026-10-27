---
title: Swiss-style event poster
summary: International Typographic Style poster — strict grid, oversized headline, one bold circle and a diagonal bar.
category: images
models: [Ideogram 3, GPT Image, Midjourney v7]
tags: [poster, typography, graphic design, print]
difficulty: intermediate
created: 2026-08-28
settings:
  Aspect ratio: "3:4"
  Best for text: Ideogram 3
blanks:
  event:
    label: Event
    default: a design festival in Basel
  headline:
    label: Headline
    default: Form folgt Funktion
  accent:
    label: Accent colour
    default: red
    options: [red, cobalt blue, signal yellow]
notes:
  - Keep the headline to three short words — image models still struggle with long text.
  - Ideogram and GPT Image render type most reliably; Midjourney is better for texture.
results:
  - type: image
    file: red.jpg
    alt: An off-white Swiss poster with a large red circle, a black diagonal bar and the headline FORM FOLGT FUNKTION.
    model: Ideogram 3
    caption: red
    placeholder: true
  - type: image
    file: blue.jpg
    alt: A variant with a blue circle and the headline RASTER UND RHYTHMUS on a modular grid.
    model: Ideogram 3
    caption: cobalt blue
    placeholder: true
---
Swiss International Typographic Style poster for {{event}}. Strict modular grid, oversized bold sans-serif headline "{{headline}}" set flush left near the bottom, a large {{accent}} circle overlapping the grid, a thick black diagonal bar, small secondary text in four columns (venue, dates, entry, programme), off-white paper background, subtle print texture, generous negative space, flat colours, no gradients, no photos --ar 3:4
