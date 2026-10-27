---
title: Sensory product description + SEO
summary: A product page that sells the feeling — intro, how it's made, specs, a tip, plus SEO title and meta.
category: writing
models: [Claude, ChatGPT]
tags: [e-commerce, seo, copywriting, product]
difficulty: beginner
created: 2026-09-03
settings:
  Includes: SEO title + meta description
blanks:
  product:
    label: Product
    default: a smoked cedar soy candle with a wooden wick
  brand:
    label: Brand
    default: Ember & Oak
  tone:
    label: Tone
    default: calm, sensory and warm
results:
  - type: text
    file: output.md
    model: Claude
---
Write a product page for {{product}} for {{brand}}. Tone: {{tone}}. Include a two-sentence sensory intro, one sentence on how it's made, four bullet specs with bold labels, one practical tip, plus an SEO title under 60 characters and a meta description under 155 characters. No exclamation marks, and avoid clichés like "elevate" or "indulge".
