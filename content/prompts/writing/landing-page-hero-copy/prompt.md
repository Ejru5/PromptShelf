---
title: Landing page hero copy (3 angles)
summary: Three hero sections — outcome-first, pain-first and proof-first — with headline, subhead and CTA.
category: writing
models: [Claude, ChatGPT, Gemini 2.5 Pro]
tags: [copywriting, landing page, conversion, saas]
difficulty: beginner
featured: true
created: 2026-10-26
settings:
  Length: 3 options
  Tone: Plain, confident
blanks:
  product:
    label: Product
    default: Ledgerly
  audience:
    label: Audience
    default: small finance teams
  outcome:
    label: Outcome
    default: close their books in an afternoon instead of a week
results:
  - type: text
    file: output.md
    model: Claude
---
You are a senior conversion copywriter. Write three hero sections for {{product}}, which helps {{audience}} {{outcome}}. Give each a different angle — outcome first, pain first, proof first. For each, write a headline under 10 words, a one-sentence subhead that explains how, and a primary call-to-action with a risk-reducer (e.g. "No card required"). Then add one line on which pair to A/B test first and why. Plain, confident language; no buzzwords.
