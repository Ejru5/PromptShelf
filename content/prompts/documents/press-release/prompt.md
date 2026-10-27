---
title: Product launch press release
summary: An AP-style press release with dateline, proof points, two quotes, availability and boilerplate.
category: documents
models: [Claude, ChatGPT]
tags: [pr, launch, marketing, writing]
difficulty: intermediate
created: 2026-10-13
settings:
  Output: A4 HTML → PDF
  Style: AP
blanks:
  company:
    label: Company
    default: Northwind Robotics
  announcement:
    label: Announcement
    default: the launch of Kestrel, a warehouse robot that learns new pick routes in under an hour
results:
  - type: document
    pages: [page-1.jpg]
    pdf: document.pdf
    alt: A two-column press release from Northwind headlined Northwind launches Kestrel, with pull quotes and an About box.
    model: ChatGPT
    placeholder: true
---
Write a press release announcing {{announcement}} for {{company}}. Follow AP style: FOR IMMEDIATE RELEASE, headline, italic subheadline, dateline, a strong lead paragraph with the who/what/why, a proof point with numbers, two quotes (CEO and customer), pricing and availability, an "About" boilerplate and media contact, ending with ###. Lay it out in two columns on an A4 page.
