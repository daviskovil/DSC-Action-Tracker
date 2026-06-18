-- ── Migration 005: Add secondary_owners column ──────────────────────────────
-- Splits the owners[] array into:
--   owners            → primary owner (kept as text[], but UI treats owners[0] as primary)
--   secondary_owners  → additional owners (text[])
--
-- Strategy: move owners[2..] into secondary_owners, keep owners[1] as primary.
-- For rows with multiple owners, owners[0] stays in owners, rest go to secondary_owners.

alter table public.actions
  add column if not exists secondary_owners text[] not null default '{}';

-- Migrate existing multi-owner rows: keep first owner as primary, rest as secondary
update public.actions
set
  secondary_owners = owners[2:],   -- PostgreSQL array slicing: 2nd element onwards (1-indexed)
  owners           = owners[1:1]   -- keep only the first element
where array_length(owners, 1) > 1;
