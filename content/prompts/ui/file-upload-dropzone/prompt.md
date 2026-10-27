---
title: File upload dropzone
summary: Drag-and-drop upload panel with file-type badges, animated progress bars and remove buttons.
category: ui
models: [v0, Claude, Lovable]
tags: [upload, form, drag and drop, progress]
difficulty: beginner
created: 2026-10-16
settings:
  Output: HTML + CSS + JS
blanks:
  context:
    label: Used for
    default: attaching brand assets to a project
results:
  - type: ui
    file: component.html
    height: 640
    alt: An upload panel with a dashed green dropzone and three files with PDF, JPG and SVG badges and progress bars.
    model: v0
---
Design a file upload panel for {{context}}: a dashed dropzone (click or drag and drop, highlighted on drag-over) with an accepted-types hint, and a list of files showing a coloured file-type badge, the filename (truncated), size, an animated progress bar that turns into "Uploaded", and a remove button. Put Cancel and a primary "Attach files" button at the bottom. Fresh green accent, rounded corners, keyboard accessible. Single HTML file with vanilla JS.
