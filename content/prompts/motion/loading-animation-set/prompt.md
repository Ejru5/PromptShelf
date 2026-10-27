---
title: Loading animation set
summary: Four pure-CSS loaders — arc spinner, bouncing dots, pulse rings and an equaliser — in one file.
category: motion
models: [Claude, ChatGPT, v0]
tags: [css, ui, loader, code]
difficulty: beginner
created: 2026-09-05
settings:
  Output: HTML + CSS
  Loop: 3 s
blanks:
  colors:
    label: Dot colours
    default: blue, violet and pink
results:
  - type: video
    file: loop.mp4
    alt: A 2×2 grid of white cards with an orange arc spinner, three bouncing dots, green pulse rings and yellow equaliser bars.
    model: Claude
    placeholder: true
---
Design four loading animations in pure CSS (no JavaScript), each centred in a white rounded card on a warm off-white background in a 2×2 grid: 1) a spinning arc that grows and shrinks, 2) three bouncing dots in {{colors}}, 3) concentric pulse rings around a solid centre dot, 4) an equaliser of five rounded bars. Every animation loops every 3 seconds, respects prefers-reduced-motion, and is delivered as a single HTML file with comments.
