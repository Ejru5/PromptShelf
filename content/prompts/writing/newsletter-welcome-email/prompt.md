---
title: Newsletter welcome email
summary: A warm welcome that sets expectations, points to the best posts and invites a reply.
category: writing
models: [Claude, ChatGPT, Gemini 2.5 Pro]
tags: [email, newsletter, onboarding, creator]
difficulty: beginner
created: 2026-08-24
settings:
  Length: Under 200 words
blanks:
  newsletter:
    label: Newsletter name
    default: The Sunday Garden
  frequency:
    label: Frequency
    default: weekly
  topic:
    label: Topic
    default: small-space gardening
  author:
    label: Author
    default: Rosa
results:
  - type: text
    file: output.md
    model: Claude
---
Write a welcome email for {{newsletter}}, a {{frequency}} newsletter about {{topic}} by {{author}}. Include a subject line and preview text, a warm one-line welcome, exactly what readers get in each issue (numbered), a "start here" list of three best posts, a request to reply with one question, a sign-off, and a P.S. about moving the email to the Primary tab. Friendly, under 200 words.
