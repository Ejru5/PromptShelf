---
title: User research synthesis
summary: Turn interview notes into themes with sticky-note evidence, a persona and numbered design implications.
category: reports
models: [Claude, ChatGPT, Gemini 2.5 Pro]
tags: [ux research, interviews, persona, insights]
difficulty: intermediate
created: 2026-10-17
settings:
  Output: A4 HTML → PDF
blanks:
  count:
    label: Number of interviews
    default: "14"
  topic:
    label: Topic
    default: how busy parents plan family meals
  notes:
    label: Interview notes
    default: "[paste your notes or transcripts here]"
results:
  - type: document
    pages: [page-1.jpg]
    pdf: document.pdf
    alt: A research summary with three coloured theme columns of sticky notes, a persona card for Jess and three numbered insights.
    model: Claude
    placeholder: true
---
Synthesise these {{count}} interview notes about {{topic}} into a one-page research summary: a headline insight phrased as a finding, three themes each backed by 2–3 sticky-note quotes or stats, a primary persona with a short scenario, and three numbered design implications. Only use evidence that appears in the notes.

Notes:
{{notes}}
