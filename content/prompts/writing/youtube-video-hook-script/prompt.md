---
title: YouTube hook script (first 30 s)
summary: A tight opening — visual payoff, stakes, promise, credibility and transition, with shot directions.
category: writing
models: [Claude, ChatGPT, Gemini 2.5 Pro]
tags: [youtube, script, video, retention]
difficulty: beginner
created: 2026-09-22
settings:
  Length: 30 seconds
blanks:
  topic:
    label: Video topic
    default: rescuing a dying houseplant
  channel:
    label: Channel
    default: a small plant-care channel
results:
  - type: text
    file: output.md
    model: ChatGPT
---
Write the first 30 seconds of a YouTube script about {{topic}} for {{channel}}. Structure it as HOOK (open on the visual payoff), STAKES (name a common mistake without revealing it), PROMISE (exactly what viewers will learn and how long it takes), CREDIBILITY (one line), and TRANSITION. Include timestamps and short shot directions in italics, then finish with one line of retention notes.
