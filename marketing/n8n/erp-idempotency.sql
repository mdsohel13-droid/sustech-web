-- ERP idempotency — stop duplicate `customers` on lead resubmit.
-- Run against the ERP Postgres (the DB behind POST /api/leads/from-web).
-- The website sends a stable `leadId` → stored as `webleadid`; we dedupe on it.
--
-- Order matters: you must clear existing duplicates BEFORE adding the unique
-- index, or the CREATE INDEX fails. Review step 0, run 1–2, then patch the route.

-- 0) PREVIEW — which webleadids currently have duplicates? (read-only)
SELECT webleadid, count(*) AS copies, array_agg(id ORDER BY id) AS ids
FROM customers
WHERE webleadid IS NOT NULL
GROUP BY webleadid
HAVING count(*) > 1;

-- 1) Collapse duplicates: keep the NEWEST row per webleadid, delete the older.
--    Safe here — these are test leads (e.g. 22 & 26 share leadId 999). For real
--    production data you'd merge fields first; with only test rows this is fine.
DELETE FROM customers a
USING customers b
WHERE a.webleadid IS NOT NULL
  AND a.webleadid = b.webleadid
  AND a.id < b.id;

-- 2) Enforce uniqueness so future resubmits can upsert.
--    Partial index → rows with NULL webleadid (e.g. legacy/manual) stay allowed.
CREATE UNIQUE INDEX IF NOT EXISTS customers_webleadid_uniq
  ON customers (webleadid) WHERE webleadid IS NOT NULL;

-- 3) VERIFY — index exists, no remaining dupes.
SELECT indexname FROM pg_indexes WHERE tablename = 'customers' AND indexname = 'customers_webleadid_uniq';
SELECT webleadid, count(*) FROM customers WHERE webleadid IS NOT NULL GROUP BY webleadid HAVING count(*) > 1;
-- ^ second query must return ZERO rows.
