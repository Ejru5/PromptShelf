---
title: Typed fetch wrapper with retries
summary: A small TypeScript fetch helper — schema-validated responses, typed errors, timeouts and backoff.
category: code
models: [Claude, ChatGPT, Cursor]
tags: [typescript, api, zod, utilities]
difficulty: intermediate
created: 2026-10-12
settings:
  Language: TypeScript
blanks:
  validator:
    label: Validation library
    default: Zod
    options: [Zod, Valibot, ArkType]
results:
  - type: code
    file: output.ts
    filename: request.ts
    model: Claude
---
Write a small, dependency-light TypeScript fetch wrapper that validates the JSON response with a {{validator}} schema and infers the return type from it, throws a typed ApiError with the status and body, times out after a configurable number of milliseconds, and retries network errors and 5xx/429 responses with exponential backoff. Show one usage example.
