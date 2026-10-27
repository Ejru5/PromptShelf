---
title: Pencil sketch to watercolour
summary: Turn a rough pencil drawing into a loose watercolour painting while keeping every line and the composition.
category: images
models: [GPT Image, Gemini 2.5 Flash Image, Flux Kontext]
tags: [edit, illustration, watercolour, image-to-image]
difficulty: beginner
featured: true
created: 2026-10-24
settings:
  Input: Your sketch (photo or scan)
  Mode: Image edit
blanks:
  palette:
    label: Colours
    default: sky blue, sage and leafy greens, warm terracotta for the roof
    placeholder: Which colours go where?
notes:
  - Photograph the sketch in daylight, flat on a table, so the model can read the lines.
  - If the model adds new objects, repeat "no added objects" at the end of the prompt.
results:
  - type: before-after
    before: sketch.jpg
    after: watercolor.jpg
    alt: A pencil sketch of a cottage with a tree, hills and a fence, and the same scene as a soft watercolour painting.
    beforeLabel: Sketch
    afterLabel: Watercolour
    model: GPT Image
    placeholder: true
---
Turn the attached pencil sketch into a loose watercolour painting. Keep every line and the exact composition of the original, but fill the shapes with soft, translucent washes: {{palette}}. Let the colour bleed slightly past the lines, leave some white paper showing for highlights, and keep the pencil lines faintly visible underneath. Textured cold-press paper, gentle pigment granulation, no added objects, no text.
