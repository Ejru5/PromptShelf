---
title: Workshop handout
summary: A friendly one-page handout — five numbered steps, a before/after example and a tick-box checklist.
category: documents
models: [Claude, ChatGPT, Gemini 2.5 Pro]
tags: [education, workshop, handout, print]
difficulty: beginner
created: 2026-08-26
settings:
  Output: A4 HTML → PDF
blanks:
  topic:
    label: Topic
    default: Writing prompts that work the first time
  audience:
    label: Audience
    default: marketing teams new to AI tools
results:
  - type: document
    pages: [page-1.jpg]
    pdf: document.pdf
    alt: A cream handout with a serif title, five numbered yellow steps, a before/after example and a checklist.
    model: Claude
    placeholder: true
---
Design a one-page workshop handout on "{{topic}}" for {{audience}}: a serif title, a one-line intro, five numbered steps with short explanations, a before/after example box, and a checklist with empty tick boxes. Friendly, practical tone, warm paper background, printable A4 HTML.
