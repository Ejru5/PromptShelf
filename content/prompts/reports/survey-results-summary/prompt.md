---
title: Survey results summary
summary: A one-page visual summary — NPS donut, ranked bars for what customers value and top frustrations, quotes.
category: reports
models: [Claude, ChatGPT]
tags: [survey, nps, research, customers]
difficulty: beginner
created: 2026-10-03
settings:
  Output: A4 HTML → PDF
blanks:
  company:
    label: Company
    default: Brightdesk
  responses:
    label: Responses
    default: "1,204"
  data:
    label: Survey data
    default: "[paste responses or summary table here]"
results:
  - type: document
    pages: [page-1.jpg]
    pdf: document.pdf
    alt: A survey summary with an NPS donut showing +43, blue and red ranked bar charts and two customer quotes.
    model: Claude
    placeholder: true
---
Summarise this customer survey (n = {{responses}}) for {{company}} as a one-page visual report: an NPS donut with the promoter/passive/detractor split and the change vs. last year, ranked bars for what customers value most and their top frustrations, and two representative quotes with roles. Keep commentary to one or two sentences per section.

Survey data:
{{data}}
