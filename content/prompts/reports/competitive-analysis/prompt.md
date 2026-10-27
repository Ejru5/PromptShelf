---
title: Competitive analysis one-pager
summary: A capability matrix, 2×2 positioning map, SWOT grid and a clear recommendation on one page.
category: reports
models: [Claude, ChatGPT, Perplexity]
tags: [strategy, competitors, swot, product]
difficulty: intermediate
created: 2026-09-16
settings:
  Output: A4 HTML → PDF
blanks:
  product:
    label: Your product
    default: Quill (a note-taking app)
  competitors:
    label: Competitors
    default: Notion, Obsidian, Apple Notes and Bear
results:
  - type: document
    pages: [page-1.jpg]
    pdf: document.pdf
    alt: A comparison table of note-taking apps with filled and empty dots, a positioning map and a colourful SWOT grid.
    model: Claude
    placeholder: true
---
Create a one-page competitive analysis of {{product}} vs. {{competitors}}: a capability matrix (full / partial / none symbols) that includes price, a 2×2 positioning map (team vs. personal, simple vs. powerful), a SWOT grid, and a one-sentence recommendation. Be specific, fair to competitors, and flag anything you're unsure about.
