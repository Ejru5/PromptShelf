---
title: Regex from examples
summary: Build a regular expression from match / no-match examples, with an annotated pattern and assertions.
category: code
models: [Claude, ChatGPT, GitHub Copilot]
tags: [regex, validation, javascript, utilities]
difficulty: beginner
created: 2026-08-31
settings:
  Language: Any
blanks:
  language:
    label: Language
    default: TypeScript
  target:
    label: What to match
    default: UK postcodes
  matches:
    label: Should match
    default: SW1A 1AA, M1 1AE, cr2 6xh, DN551PT
  non_matches:
    label: Should not match
    default: SW1A 1A, 12345, ABC 123, W1A-0AX
results:
  - type: code
    file: output.ts
    filename: uk-postcode.ts
    model: ChatGPT
---
Write a {{language}} regular expression that matches {{target}}. It must match all of these: {{matches}}. It must NOT match any of these: {{non_matches}}. Explain each part of the pattern in a comment, add a normalise() helper, and include quick assertions for every example.
