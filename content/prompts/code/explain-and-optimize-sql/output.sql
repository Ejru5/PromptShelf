-- WHAT THE ORIGINAL DOES
-- For each customer, finds their most recent order in 2026 and its total.
-- It's slow because the correlated subquery re-scans `orders` once per
-- customer (~120k times), and `YEAR(created_at)` prevents index use.

-- OPTIMISED VERSION
-- 1. Filter by a date range (sargable) instead of YEAR().
-- 2. Rank orders once with a window function instead of a correlated subquery.
WITH ranked AS (
  SELECT
    o.customer_id,
    o.id          AS order_id,
    o.total_cents,
    o.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY o.customer_id
      ORDER BY o.created_at DESC
    ) AS rn
  FROM orders AS o
  WHERE o.created_at >= DATE '2026-01-01'
    AND o.created_at <  DATE '2027-01-01'
    AND o.status = 'paid'
)
SELECT
  c.id,
  c.email,
  r.order_id      AS latest_order_id,
  r.created_at    AS latest_order_at,
  r.total_cents / 100.0 AS latest_order_total
FROM customers AS c
JOIN ranked    AS r ON r.customer_id = c.id AND r.rn = 1
ORDER BY r.created_at DESC;

-- SUPPORTING INDEX (covers the filter, partition and sort)
CREATE INDEX CONCURRENTLY IF NOT EXISTS orders_paid_customer_created_idx
  ON orders (customer_id, created_at DESC)
  INCLUDE (total_cents)
  WHERE status = 'paid';

-- Expected: one index scan over 2026 paid orders instead of 120k subqueries.
-- On a 9M-row table this typically drops from ~14s to well under 1s.
