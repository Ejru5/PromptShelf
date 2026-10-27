---
title: Testimonial marquee
summary: Two rows of testimonial cards scrolling infinitely in opposite directions, paused on hover.
category: ui
models: [Claude, v0, Bolt]
tags: [social proof, landing page, animation, css]
difficulty: beginner
created: 2026-08-25
settings:
  Output: HTML + CSS + JS
  Motion: Respects reduced motion
blanks:
  palette:
    label: Palette
    default: warm peach and orange
  heading:
    label: Heading
    default: Don't take our word for it
results:
  - type: ui
    file: component.html
    height: 560
    alt: A peach section titled Don't take our word for it with two rows of white testimonial cards.
    model: Claude
---
Create a testimonial section with two rows of cards scrolling infinitely in opposite directions (pure CSS animation, pause on hover, fade mask on both edges). Each card has five stars, a short quote, avatar initials in a coloured circle, a name and a role. Use a {{palette}} palette and the heading "{{heading}}" with a small pill above it. Duplicate the cards for a seamless loop and turn the motion off for prefers-reduced-motion users.
