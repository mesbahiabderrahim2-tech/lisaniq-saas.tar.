-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 010: Prepare dataset aggregation column
--
-- Adds a nullable aggregated_metrics jsonb column to datasets.
-- This column is intentionally unused at the application layer.
-- It is preparation for a future optimization that will replace
-- full cached_rows JSONB storage with pre-aggregated KPI metrics,
-- reducing row size for large datasets.
--
-- No existing data is modified.
-- No existing columns are removed.
-- No API code reads or writes this column yet.
-- cached_rows and all existing report generation is unchanged.
-- ══════════════════════════════════════════════════════════════

alter table public.datasets
  add column if not exists aggregated_metrics jsonb;
