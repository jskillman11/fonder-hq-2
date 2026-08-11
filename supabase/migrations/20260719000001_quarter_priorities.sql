-- This Quarter revisions round, part 1 of 2: populate the (previously
-- empty) priorities table for Gozo's current quarter so title/scope/why
-- become inline-editable. Run this one first; the delivery-cadence
-- matrix update is a separate script.

with target_quarter as (
  select q.id
  from quarters q
  join programs p on p.id = q.program_id
  join clients c on c.id = p.client_id
  where c.name = 'Gozo' and q.is_current = true
)
insert into priorities (quarter_id, pri_label, title, scope, why, tags, sort_order)
select target_quarter.id, v.pri_label, v.title, v.scope, v.why, v.tags, v.sort_order
from target_quarter, (
  values
  ('Priority 1', 'Launch the GTM Shopify site', 'Launch week of Jul 21 and promote through socials.', 'Real DTC data and revenue start flowing from here; every downstream phase depends on this being live.', array['Digital'], 0),
  ('Priority 2', 'Develop brand system & art direction', 'Art direction guidelines, messaging guidelines, social templates.', 'Unlocks on-brand social media and TikTok/influencer content at higher volume to support top-of-funnel awareness and followership, and to increase traffic to the new brand.', array['Brand','Creative'], 1),
  ('Priority 3', 'Confirm the tier upgrade and ad spend commitment with Kaitlyn', 'Realign on how to realistically finance the growth we are pursuing.', 'Everything from Phase 4 onward depends on this being locked, not assumed.', array[]::text[], 2),
  ('Priority 4', 'Hire the TikTok Shop / creator specialist', 'Confirm budget and hire a dedicated contractor to lead creator strategy and relationships.', 'The highest-leverage open item before Phase 4 starts, see Decisions.', array['Marketing'], 3)
) as v(pri_label, title, scope, why, tags, sort_order)
where not exists (
  select 1 from priorities existing where existing.quarter_id = target_quarter.id
);
