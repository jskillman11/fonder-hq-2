-- Pulse revisions round: add "% Returning Customers" driver tile, rename
-- "Subscription revenue" -> "Subscription Revenue Share", and drop two
-- action items that are being retired from the Pulse "open decisions" view
-- (TikTok contractor budget approval and the lifestyle-shoot location
-- access request) per Tom's Jul '26 feedback.

update programs
set north_star = jsonb_set(
  north_star,
  '{drivers}',
  '[
    {"label":"DTC conversion rate","now":"1.2%","target":"4%","spark":[0.8,0.9,1.1,1.0,1.2,1.1,1.3,1.2],"driven":["Web","Creative"],"note":"Visits that become orders."},
    {"label":"New customers / mo","now":"50","target":"400","spark":[22,28,31,30,38,41,46,50],"driven":["Everything"],"note":"Every phase of the roadmap contributes here."},
    {"label":"Average order value","now":"TBD","target":"$45","spark":null,"driven":["Merchandising strategy","Web"],"note":"Boxes of 8 at $25–30 each; bundling and a first-order upsell is the path to $45."},
    {"label":"% Returning Customers","now":"TBD","target":"25%","spark":null,"driven":["Email","Retention"],"note":"Share of orders placed by a customer who''s bought before."},
    {"label":"Subscription Revenue Share","now":"0%","target":"35%","spark":null,"driven":["Email","Web"],"note":"Flat target — cleaner to track against than a range."}
  ]'::jsonb
)
where id in (select p.id from programs p join clients c on c.id = p.client_id where c.name = 'Gozo');

delete from action_items
where type = 'needs_you'
  and (
    title ilike '%TikTok Shop / creator specialist contractor budget%'
    or title ilike '%Location access for lifestyle shoot%'
  )
  and program_id in (select p.id from programs p join clients c on c.id = p.client_id where c.name = 'Gozo');
