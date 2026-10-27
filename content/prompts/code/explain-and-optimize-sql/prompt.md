---
title: Explain and optimise a slow SQL query
summary: Plain-English explanation, why it's slow, a faster rewrite with the same rows, and the best index.
category: code
models: [Claude, ChatGPT]
tags: [sql, postgres, performance, database]
difficulty: advanced
created: 2026-09-19
settings:
  Dialect: PostgreSQL / MySQL
blanks:
  dialect:
    label: Database
    default: PostgreSQL
    options: [PostgreSQL, MySQL, SQLite, SQL Server]
  query:
    label: Your query
    default: "-- paste the slow query here"
notes:
  - Paste the EXPLAIN ANALYZE output too if you have it — the advice gets much more specific.
results:
  - type: code
    file: output.sql
    model: Claude
---
Explain what this {{dialect}} query does in two sentences, then explain why it's slow. Rewrite it to be faster while returning exactly the same rows — prefer sargable filters and window functions over correlated subqueries — and suggest the single best supporting index. Comment the new query.

```sql
{{query}}
```
