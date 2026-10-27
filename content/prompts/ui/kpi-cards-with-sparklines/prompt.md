---
title: KPI cards with sparklines
summary: Dark analytics header — four metric cards with delta badges and sparklines that draw in on load.
category: ui
models: [v0, Claude, Lovable]
tags: [dashboard, analytics, dark mode, charts]
difficulty: intermediate
created: 2026-09-14
settings:
  Output: HTML + SVG + JS
  Theme: Dark
blanks:
  metrics:
    label: Metrics
    default: revenue, active users, conversion rate and churn
results:
  - type: ui
    file: component.html
    height: 380
    alt: Four dark cards for Revenue, Active users, Conversion and Churn, each with a coloured sparkline and delta badge.
    model: v0
---
Build a dark-mode analytics header with four KPI cards ({{metrics}}). Each card shows the label, a coloured delta badge (green when it's good, red when it's bad), the big value in tabular numbers, a "vs. previous 30 days" caption, and an SVG sparkline with a gradient fill that draws in on load. Add a 7d/30d/90d segmented control in the header. Responsive 4 → 2 → 1 columns, subtle hover lift, respects prefers-reduced-motion. Single HTML file.
