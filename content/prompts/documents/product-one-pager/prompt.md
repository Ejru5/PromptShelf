---
title: Product one-pager
summary: A single-page product sheet — outcome headline, hero visual, three features, key specs and a CTA band.
category: documents
models: [Claude, ChatGPT, Gemini 2.5 Pro]
tags: [marketing, sales, product, pdf]
difficulty: beginner
created: 2026-09-24
settings:
  Output: A4 HTML → PDF
blanks:
  product:
    label: Product
    default: Loop, a self-cleaning smart water bottle
  accent:
    label: Theme colour
    default: blue
results:
  - type: document
    pages: [page-1.jpg]
    pdf: document.pdf
    alt: A light blue product sheet with the headline Drink more water. Think less about it., a bottle illustration, three feature cards and specs.
    model: ChatGPT
    placeholder: true
---
Create a one-page product sheet for {{product}}: a headline that sells the outcome (not the feature), a short paragraph, a simple hero illustration, three feature cards with icons, a row of four key specs, and a dark call-to-action banner with the launch date and URL. Light {{accent}} theme, A4, print-ready HTML.
