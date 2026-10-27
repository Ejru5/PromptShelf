---
title: Refactor a React class to hooks
summary: Convert a class component to a typed function component — correct effects, abort on unmount, no stale state.
category: code
models: [Claude, ChatGPT, Cursor]
tags: [react, typescript, refactor, hooks]
difficulty: intermediate
featured: true
created: 2026-10-18
settings:
  Language: TypeScript / React
blanks:
  code:
    label: Your component
    default: "// paste your class component here"
notes:
  - Include the parent's usage of the component so the model keeps the same props.
results:
  - type: code
    file: output.tsx
    filename: UserCard.tsx
    model: Claude
---
Refactor this React class component into a function component with hooks and TypeScript. Keep the behaviour identical, merge the lifecycle methods into effects with correct dependency arrays, cancel in-flight requests with AbortController to avoid stale updates, and keep the latest callback props in a ref so they don't retrigger fetches. Add a short comment wherever behaviour changed or a bug was fixed.

```tsx
{{code}}
```
