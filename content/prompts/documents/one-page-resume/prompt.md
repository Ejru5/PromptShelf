---
title: One-page designer resume
summary: A two-column, print-ready A4 resume with quantified bullets, skill chips and a dark sidebar.
category: documents
models: [Claude, ChatGPT, Gemini 2.5 Pro]
tags: [resume, career, pdf, print]
difficulty: beginner
featured: true
created: 2026-10-20
settings:
  Output: A4 HTML → PDF
  Pages: "1"
blanks:
  name:
    label: Your name
    default: Maya Okafor
  role:
    label: Role
    default: Senior Product Designer
  years:
    label: Years of experience
    default: "8"
notes:
  - Paste your real work history after the prompt — the model will rewrite bullets with numbers.
  - Ask for "ATS-friendly plain version too" if you're applying through job portals.
results:
  - type: document
    pages: [page-1.jpg]
    pdf: document.pdf
    alt: A one-page resume with a navy sidebar of contact details and skills and a main column of experience.
    model: Claude
    placeholder: true
---
You are an expert resume writer and designer. Create a one-page resume for {{name}}, a {{role}} with {{years}} years of experience, as a print-ready A4 HTML page. Use two columns: a dark sidebar with an initials avatar, contact details, skill chips, tool proficiency bars and languages; and a main column with the name, title, a two-sentence profile, three roles with 2–3 quantified bullet points each (use real numbers), education and recognition. Clean sans-serif typography, one accent colour, no photos. Make it ready to save as PDF.
