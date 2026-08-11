-- Supports the draft/publish inline-editing flow: change_log rows with
-- status='draft' are pending edits not yet applied to the live table.

-- Human-readable context for the drafts review panel (e.g. "Initiative 1 ·
-- Why"), set at draft-creation time rather than reconstructed by joining
-- back through table_name/record_id at read time.
alter table change_log add column label text;

-- Re-editing the same field before it's published updates the existing
-- draft row (via ON CONFLICT) instead of piling up duplicate drafts.
create unique index change_log_pending_unique
  on change_log (table_name, record_id, field_name)
  where status = 'draft';
