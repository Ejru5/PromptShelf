---
title: Monthly growth report
summary: Turn raw metrics into a two-page report with KPI tiles, charts, a funnel, cohort table and commentary.
category: reports
models: [Claude, ChatGPT, Gemini 2.5 Pro]
tags: [kpi, growth, charts, monthly]
difficulty: intermediate
featured: true
created: 2026-10-25
settings:
  Output: A4 HTML → PDF
  Pages: "2"
  Charts: Inline SVG
blanks:
  company:
    label: Company
    default: Lumen App
  month:
    label: Month
    default: October 2026
  data:
    label: Your data
    default: "[paste CSV or metrics here]"
    hint: Weekly actives, signups by channel, conversion, churn, funnel steps, cohort retention.
notes:
  - Paste data as CSV — models read tables far more reliably than screenshots.
  - Ask the model to list any numbers it had to estimate before it builds the report.
results:
  - type: document
    pages: [page-1.jpg, page-2.jpg]
    pdf: document.pdf
    alt: A growth report for October 2026 with four KPI tiles, a line chart, a bar chart, feature adoption bars and a funnel page.
    model: Claude
    placeholder: true
---
Turn the metrics below into a two-page monthly growth report for {{company}}, {{month}}. Page 1: four KPI tiles with month-over-month deltas, a line chart of weekly actives vs. signups, a bar chart of signups by channel, feature-adoption bars and a three-sentence "What happened" summary. Page 2: the activation funnel, a cohort retention table with heatmap shading, next month's bets and risks. Use inline SVG charts with clear labels, and say which numbers you had to estimate.

Data:
{{data}}
