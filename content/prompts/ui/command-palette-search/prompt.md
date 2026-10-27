---
title: ⌘K command palette
summary: A keyboard-first command palette with live filtering, match highlighting and grouped results.
category: ui
models: [Claude, ChatGPT, v0]
tags: [search, keyboard, modal, productivity]
difficulty: intermediate
created: 2026-09-28
settings:
  Output: HTML + CSS + JS
  Keyboard: ↑ ↓ ↵ esc
blanks:
  groups:
    label: Result groups
    default: Suggestions, Projects, People and Help
results:
  - type: ui
    file: component.html
    height: 560
    alt: A white command palette with a search field and grouped results, the first result highlighted in dark.
    model: Claude
---
Create a ⌘K command palette as a single HTML file: a centred modal over a dimmed backdrop with a search input, grouped results ({{groups}}), an icon for each item, right-aligned hints or shortcuts, and a footer showing keyboard hints. Typing filters results live and highlights the matched text; ↑/↓ moves the selection and hovering also selects. The selected row is dark with white text. Show a friendly empty state when nothing matches. Use role="listbox"/"option" and keep it accessible.
