-- This Quarter revisions round, part 2 of 2: fill in the real
-- month-by-month delivery cadence (quarters.matrix), which was seeded
-- as an empty lanes array. Run part 1 (priorities) first.

update quarters
set matrix = $json${
  "lanes": [
    {
      "name": "Digital / Web", "sub": "Site & platform build",
      "cells": [
        {"k":"up","v":"GTM site launches","s":"Live Jul 21, DTC storefront replaces the old wholesale-only presence."},
        {"k":"hold","v":"No scheduled work","s":"Site is live; the next build phase waits for TikTok Shop traffic."},
        {"k":"up","v":"TikTok Shop setup","s":"Native checkout, does not require the full-site conversion gate."}
      ],
      "cont": {"k":"cont","v":"Full Shopify build-out","s":"Subscribe and save, CRO, story pages, Oct 26 onward."}
    },
    {
      "name": "Creative & Brand", "sub": "Identity & content",
      "cells": [
        {"k":"up","v":"Brand deliverables refresh","s":"Event booth and linesheets wrap alongside the GTM launch."},
        {"k":"up","v":"Brand identity system","s":"Art direction and guidelines lock, unlocks on-brand social/creator content."},
        {"k":"up","v":"Content library expansion","s":"Gozo-led, building the library TikTok content will run on."}
      ],
      "cont": {"k":"cont","v":"Amazon creative assets","s":"Image stacks and A+ content, Jan 27."}
    },
    {
      "name": "Marketing", "sub": "Growth & creator",
      "cells": [
        {"k":"hold","v":"Awaiting specialist hire","s":"TikTok Shop / creator work is gated on the contractor budget decision."},
        {"k":"up","v":"TikTok specialist hire","s":"Target hire date Aug 1, budget pending confirmation."},
        {"k":"up","v":"TikTok Shop + Meta retargeting launch","s":"Creator-led revenue plus a small always-on retargeting floor."}
      ],
      "cont": {"k":"cont","v":"Influencer/affiliate execution","s":"Creator relationship management, Oct-Nov 26."}
    },
    {
      "name": "Wholesale", "sub": "Bridge revenue",
      "cells": [
        {"k":"cont","v":"Steady","s":"Continues funding the build in the background."},
        {"k":"cont","v":"Steady","s":"No active Fonder scope this month."},
        {"k":"cont","v":"Steady","s":"Scales down in relative share as DTC/TikTok Shop grow."}
      ],
      "cont": {"k":"cont","v":"Ongoing","s":"Bridge role continues until digital channels carry the business."}
    }
  ]
}$json$::jsonb
where id in (
  select q.id from quarters q
  join programs p on p.id = q.program_id
  join clients c on c.id = p.client_id
  where c.name = 'Gozo' and q.is_current = true
);
