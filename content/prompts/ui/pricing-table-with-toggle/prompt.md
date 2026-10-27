---
title: Pricing table with billing toggle
summary: Three-tier pricing with a highlighted plan and an animated monthly/yearly switch — one HTML file.
category: ui
models: [Claude, v0, Lovable]
tags: [pricing, saas, landing page, toggle]
difficulty: beginner
featured: true
created: 2026-10-22
settings:
  Output: HTML + CSS + JS
  Responsive: "Yes"
blanks:
  tiers:
    label: Tiers
    default: Starter (free), Pro ($24) and Business ($49)
  accent:
    label: Highlight colour
    default: indigo-to-violet
notes:
  - Swap "single HTML file" for "a React component with Tailwind" if you're pasting into a codebase.
results:
  - type: ui
    file: component.html
    height: 720
    alt: Three pricing cards with the middle Pro plan highlighted in an indigo gradient and a Monthly/Yearly toggle above.
    model: Claude
---
Build a responsive pricing section as a single HTML file with embedded CSS and JS. Three tiers — {{tiers}} — with the middle one highlighted as "Most popular" on a {{accent}} gradient card. Include a Monthly/Yearly segmented toggle (yearly shows a "−20%" badge) that animates the prices when switched. Each card has a name, one-line description, price, 3–4 features with check icons, and a full-width call-to-action. Cards lift slightly on hover, stack into one column under 820px, and the toggle uses accessible buttons with aria-pressed.
