---
title: Generate thorough unit tests
summary: Tests grouped into happy path, edge cases and invalid input — with it.each for repetitive cases.
category: code
models: [Claude, ChatGPT, GitHub Copilot]
tags: [testing, vitest, jest, typescript]
difficulty: beginner
created: 2026-10-04
settings:
  Framework: Vitest or Jest
blanks:
  framework:
    label: Test framework
    default: Vitest
    options: [Vitest, Jest, Node test runner]
  code:
    label: Function to test
    default: "// paste the function here"
results:
  - type: code
    file: output.test.ts
    filename: format-price.test.ts
    model: Claude
---
Write {{framework}} unit tests for the function below. Group them into happy path, edge cases and invalid input. Cover rounding, negative numbers, zero, very large and very small values, and anything that should throw. Use it.each for repetitive cases, descriptive test names, and no mocks unless they're needed.

```ts
{{code}}
```
