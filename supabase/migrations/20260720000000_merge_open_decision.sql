-- Merge the one "needs you" action item into the decisions table as a
-- new "open" status, so Pulse's Open Decisions tile and the Decisions
-- page read from a single source going forward instead of two.

alter table decisions add column due_date date;

insert into decisions (program_id, date_label, sort_date, title, body, status, due_date)
select
  p.id,
  'Jul 26',
  date '2026-07-16',
  'Confirm Transformative Growth tier upgrade and ad spend commitment',
  'Everything from Phase 4 on (Amazon, paid media, the TikTok specialist hire) assumes this is active starting August. Needs written confirmation.',
  'open',
  date '2026-08-01'
from programs p
join clients c on c.id = p.client_id
where c.name = 'Gozo'
and not exists (
  select 1 from decisions d where d.program_id = p.id and d.status = 'open'
);

delete from action_items
where type = 'needs_you'
and program_id in (
  select p.id from programs p
  join clients c on c.id = p.client_id
  where c.name = 'Gozo'
);
