---
title: Sales pipeline snapshot
summary: A dark one-page weekly snapshot — forecast vs. target, stage funnel, top deals and a focus callout.
category: reports
models: [Claude, ChatGPT]
tags: [sales, crm, forecast, weekly]
difficulty: intermediate
created: 2026-09-08
settings:
  Output: A4 HTML → PDF
  Theme: Dark
blanks:
  team:
    label: Team
    default: the EMEA sales team
  data:
    label: CRM export
    default: "[paste your CRM export here]"
results:
  - type: document
    pages: [page-1.jpg]
    pdf: document.pdf
    alt: A dark navy pipeline report headlined Q4 is tracking at 92% of target, with a blue funnel and a top deals table.
    model: ChatGPT
    placeholder: true
---
Build a weekly sales pipeline snapshot from this CRM export for {{team}}: a headline stating forecast vs. target, three KPI tiles (open pipeline, weighted forecast, win rate), a stage funnel with values and deal counts, a table of the top five deals to close this quarter with coloured stage pills, and one "focus this week" callout. Dark theme, one A4 page.

CRM export:
{{data}}
