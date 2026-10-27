---
title: Odometer number counter
summary: Slot-machine digits that spin and settle on your number, plus a filling progress bar — as HTML canvas.
category: motion
models: [Claude, ChatGPT]
tags: [numbers, stats, code, social]
difficulty: intermediate
created: 2026-10-05
settings:
  Output: HTML + canvas
  Size: 1080 × 1080
  Duration: 5 s
blanks:
  label:
    label: Label
    default: PROMPTS COPIED
  number:
    label: Number
    default: "2026"
  accent:
    label: Accent
    default: yellow
results:
  - type: video
    file: loop.mp4
    alt: Four dark digit tiles reading 2026 under the label PROMPTS COPIED, with a yellow progress bar.
    model: Claude
    placeholder: true
---
Build an animated stats counter as a single HTML canvas file (1080×1080, 5-second loop). Show the label "{{label}}" above four odometer-style digit tiles that spin like a slot machine and settle one by one on {{number}}, with the last digit in {{accent}}. Below, a progress bar fills while a caption counts up to "+128% this month". Dark background, monospace digits with slashed zeros, ease-out timing, and a quick fade at the end so it loops.
