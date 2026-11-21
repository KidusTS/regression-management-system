-- =====================================================
-- V2__pack_version_test_order.sql
-- pack_version_tests.display_order now holds the position of a test inside its
-- pack version (Excel row order), written by Hibernate via @OrderColumn.
--
-- Rows created before this migration all have display_order = 0, and the original
-- Excel order was never stored. Backfill a stable, deterministic order (by Test ID)
-- so existing versions keep loading every test.
-- =====================================================

UPDATE pack_version_tests pvt
SET display_order = ranked.pos
FROM (
    SELECT p.pack_version_id,
           p.test_version_id,
           ROW_NUMBER() OVER (PARTITION BY p.pack_version_id ORDER BY rt.test_id_ref) - 1 AS pos
    FROM pack_version_tests p
    JOIN regression_test_versions v ON v.id = p.test_version_id
    JOIN regression_tests rt        ON rt.id = v.regression_test_id
) ranked
WHERE pvt.pack_version_id = ranked.pack_version_id
  AND pvt.test_version_id = ranked.test_version_id;
