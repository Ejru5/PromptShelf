---
title: Golden-hour desert portrait
summary: A cinematic, wind-swept portrait on a sand dune — warm haze, long shadows and a 35mm film texture.
category: images
models: [Midjourney v7, Flux 1.1 Pro, GPT Image]
tags: [portrait, cinematic, landscape, film]
difficulty: beginner
featured: true
created: 2026-10-21
settings:
  Aspect ratio: "3:2"
  Style: raw
  Stylize: 250
blanks:
  subject:
    label: Subject
    default: a woman in a flowing red dress
    placeholder: Who's standing on the dune?
  light:
    label: Light
    default: golden hour
    options: [golden hour, blue hour, harsh midday sun]
notes:
  - Keep the subject small in the frame — the scale is what makes it feel cinematic.
  - Swap "35mm film" for "medium format" if you want a cleaner, sharper look.
  - One bold accent colour (the dress) against a muted palette does most of the work.
results:
  - type: image
    file: golden.jpg
    alt: A small figure in a red dress on a dune crest at sunset, the sun low behind layered orange dunes.
    model: Midjourney v7
    caption: golden hour
    placeholder: true
  - type: image
    file: blue-hour.jpg
    alt: The same dune scene at blue hour with violet sand, a pale sun on the horizon and a figure in white.
    model: Midjourney v7
    caption: blue hour
    placeholder: true
  - type: image
    file: midday.jpg
    alt: Bright midday version with blue sky, pale gold dunes and a figure in a blue dress.
    model: Flux 1.1 Pro
    caption: harsh midday sun
    placeholder: true
---
Cinematic wide shot of {{subject}} standing on the crest of a towering sand dune at {{light}}, fabric and hair caught in the wind, long soft shadows rippling across the sand, the sun low on the horizon behind distant dunes, warm atmospheric haze, shot on 35mm film with subtle grain, shallow depth of field, muted earthy palette with a single bold accent colour, epic sense of scale --ar 3:2 --style raw --stylize 250
