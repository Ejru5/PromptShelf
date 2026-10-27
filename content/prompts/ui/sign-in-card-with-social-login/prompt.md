---
title: Sign-in card with social login
summary: A frosted-glass sign-in card on a mesh gradient — Google/Apple buttons, email, password and show/hide.
category: ui
models: [v0, Claude, Bolt]
tags: [auth, form, login, glassmorphism]
difficulty: beginner
created: 2026-10-09
settings:
  Output: HTML + CSS
  Accessible: Labels + autocomplete
blanks:
  product:
    label: Product name
    default: Acme
results:
  - type: ui
    file: component.html
    height: 700
    alt: A translucent sign-in card with Google and Apple buttons, email and password fields and a dark Sign in button.
    model: v0
---
Design a sign-in card for {{product}}: a frosted-glass card centred on a soft multi-colour mesh-gradient background, with a logo, a "Welcome back" heading, Google and Apple buttons side by side, an "or continue with email" divider, email and password fields with a show/hide password button, a "Remember me" checkbox and a "Forgot password?" link, a full-width dark primary button and a sign-up link. Use proper labels, autocomplete attributes and visible focus states. Single HTML file, no frameworks.
