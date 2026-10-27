---
title: Quarterly financial summary
summary: A board-ready one-pager — KPI tiles, revenue chart, revenue mix donut, income statement and commentary.
category: reports
models: [Claude, ChatGPT]
tags: [finance, board, quarterly, p&l]
difficulty: advanced
created: 2026-08-29
settings:
  Output: A4 HTML → PDF
blanks:
  company:
    label: Company
    default: Fieldstone
  quarter:
    label: Quarter
    default: Q3 FY2026
  data:
    label: Numbers
    default: "[paste P&L, cash and revenue mix here]"
notes:
  - Always ask the model to recompute subtotals — and check them yourself before it goes to the board.
results:
  - type: document
    pages: [page-1.jpg]
    pdf: document.pdf
    alt: A financial summary headlined Revenue up 24%, with KPI tiles, a green bar chart, a donut and an income statement table.
    model: Claude
    placeholder: true
---
Prepare a board-ready quarterly financial summary for {{company}}, {{quarter}}: a headline, four KPI tiles (revenue, gross margin, operating income, cash) with year-over-year deltas, a quarterly revenue bar chart, a revenue-mix donut, an unaudited income statement comparing to the prior year, and a short commentary paragraph. Recalculate every subtotal and percentage from the raw numbers.

Numbers:
{{data}}
