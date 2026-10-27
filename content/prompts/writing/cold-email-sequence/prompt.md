---
title: 3-step cold email sequence
summary: A short, personal outreach sequence — opener, follow-up with a new angle, and a polite break-up.
category: writing
models: [Claude, ChatGPT]
tags: [sales, email, outreach, b2b]
difficulty: beginner
created: 2026-10-10
settings:
  Emails: "3"
  Length: Under 90 words each
blanks:
  sender:
    label: Your name
    default: Leah
  company:
    label: Your company
    default: Trainflow
  prospect:
    label: Prospect
    default: Sam, Head of Operations at Harbour Logistics
  context:
    label: Personal context
    default: they just opened a second warehouse in Leeds
results:
  - type: text
    file: output.md
    model: Claude
---
Write a three-email cold outreach sequence from {{sender}} at {{company}} to {{prospect}}. Context: {{context}}. Email 1 (day 1): a personal opener tied to the context, a one-sentence value proposition with a real result, and a soft 15-minute ask. Email 2 (day 4): a new angle plus a short resource link. Email 3 (day 9): a polite break-up. Keep each under 90 words, use lowercase subject lines, and never write "I hope this finds you well".
