---
title: Geometric logo reveal
summary: Three flat shapes fly in with springy overshoot, snap into a logo mark and reveal the wordmark.
category: motion
models: [Runway Gen-4, Veo 3, Kling 2.1]
tags: [logo, brand, intro, flat]
difficulty: intermediate
featured: true
created: 2026-10-23
settings:
  Duration: 4 s
  Aspect ratio: "1:1"
  Style: Flat vector
blanks:
  brand:
    label: Brand name
    default: nova
  background:
    label: Background
    default: indigo
notes:
  - Give each shape a colour and an entry direction — it stops the model inventing its own.
  - End on a "clean hold" so the last frame works as a still.
results:
  - type: video
    file: loop.mp4
    alt: A pink circle, yellow square and mint triangle assembling into a logo above the word nova on an indigo background.
    model: Runway Gen-4
    placeholder: true
---
Minimal logo reveal animation on a deep {{background}} background: a pink circle, a yellow rounded square and a mint triangle fly in from different edges with springy overshoot, snap together into a compact logo mark with a soft shockwave ring, then the wordmark "{{brand}}" wipes in from left to right below it, with a small letter-spaced subtitle "STUDIO". Flat vector style, smooth easing, 4 seconds, 1:1, ends on a clean hold
