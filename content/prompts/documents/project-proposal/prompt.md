---
title: Client project proposal
summary: A two-page proposal — editorial cover, goals, timeline and an itemised investment table.
category: documents
models: [Claude, ChatGPT]
tags: [proposal, freelance, agency, pdf]
difficulty: intermediate
created: 2026-10-07
settings:
  Output: A4 HTML → PDF
  Pages: "2"
blanks:
  studio:
    label: Your studio
    default: Northfold Studio
  client:
    label: Client
    default: Fernhill Coffee
  project:
    label: Project
    default: a website redesign with online ordering
results:
  - type: document
    pages: [page-1.jpg, page-2.jpg]
    pdf: document.pdf
    alt: A green proposal cover reading A warmer home online for Fernhill Coffee, and a second page with goals, timeline and pricing.
    model: Claude
    placeholder: true
---
Write and design a two-page project proposal from {{studio}} to {{client}} for {{project}}. Page 1: a full-bleed cover with a large serif headline, the date and a "prepared for" line. Page 2: an overview ("what we heard"), goals and success measures in two columns, a four-phase timeline, and an investment table with line items, a total and payment terms. Confident, warm tone. Deliver as print-ready A4 HTML.
