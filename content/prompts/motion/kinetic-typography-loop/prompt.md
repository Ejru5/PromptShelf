---
title: Kinetic typography loop
summary: Bold words slam in one at a time with circular colour wipes — generated as a single HTML canvas file.
category: motion
models: [Claude, ChatGPT, Gemini 2.5 Pro]
tags: [typography, code, loop, social]
difficulty: intermediate
created: 2026-10-11
settings:
  Output: HTML + canvas
  Size: 1080 × 1080
  Duration: 4.5 s
blanks:
  words:
    label: Words
    default: MAKE / IT / MOVE
  colors:
    label: Colours
    default: orange, black and blue
notes:
  - Record the browser tab with any screen recorder, or ask for a version that exports frames.
  - Ask for "the last frame matches the first" — it's the secret to a clean loop.
results:
  - type: video
    file: loop.mp4
    alt: The word MAKE in heavy black type on orange, with thin animated lines and a 01 / 03 counter.
    model: Claude
    placeholder: true
---
Create a seamless 4.5-second kinetic typography loop at 1080×1080 as a single HTML file using canvas. Show the words {{words}} one at a time. Each word slams in from 2.6× scale with a slight rotation and settles, while a circular colour wipe changes the background ({{colors}}). Add thin animated horizontal rules on the left and a small "01 / 03" counter in a monospace font. Use heavy sans-serif type, easeOutCubic timing, and make the last frame match the first so it loops perfectly.
