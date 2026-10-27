---
title: LinkedIn story post
summary: A short story post with a one-line hook, a turning point with a number, three takeaways and a question.
category: writing
models: [Claude, ChatGPT]
tags: [linkedin, social, storytelling, personal brand]
difficulty: beginner
created: 2026-10-01
settings:
  Length: Under 220 words
blanks:
  story:
    label: Your story
    default: shipping a feature nobody used, and the one-word fix that changed adoption
results:
  - type: text
    file: output.md
    model: Claude
---
Write a LinkedIn post telling the story of {{story}}. Use short one-line paragraphs, open with a surprising one-line hook, build tension with what didn't work, reveal the turning point and the result with a number, then give three takeaways as → arrows and end with a genuine question. Under 220 words, 2–3 relevant hashtags, no emojis in the body.
