// Seed data for Fonder HQ (client: Gozo). Ports the DATA object from the
// original fonder-hq-v1.jsx prototype. Used to seed Supabase tables via
// scripts/seed.js; the app itself reads from the database, not this file,
// once the migration in step 2 is wired up.
//
// Revised 2026-07-16 against "Gozo Brand Growth Roadmap_V2.md": restructured
// into 7 phases (splitting GTM site build from brand identity work), flat
// single-number targets (AOV $45, conversion 4%, subscription 35%), revenue
// mix tracking, and dropped founder-hours/margin/co-packer tracking from
// Fonder HQ per Tom's call — see decision log.

const DATA = {
  client: { name: "Gozo", sub: "Formerly Raw Eddy's" },
  program: {
    timeframe: "Q4 2025 – Q2 2027",
    stage: "Launch → Traction",
    updated: "Jul 16, 2026",
    nextReview: "Oct 5, 2026",
    week: "Week 3 of 13",
    quarter: "Q3 '26",
    health: "on-track",
    headline: ["Prove the channel.", "Then add the next."],
    thesis:
      "Wholesale still funds the build while the digital ecosystem comes online, but the order has changed. DTC sells first; brand identity locks the visual system next. TikTok Shop and creator partnerships — led by a dedicated specialist, not squeezed onto Kaitlyn's team — build proof and awareness at high leverage before paid spend scales. Amazon and full DTC retention infrastructure follow. Paid media scales last, and only as fast as revenue can fund it: ad spend reinvests as a share of revenue, not a fixed budget regardless of performance.",
  },

  northStar: {
    value: "$500K ARR revenue by end of Q1 2027",
    hero: {
      label: "Total monthly revenue", now: "$4.3k", target: "$42k",
      spark: [2.1, 2.4, 2.2, 2.9, 3.1, 3.6, 3.4, 4.3],
      note: "All channels combined. Ad spend reinvests as a share of revenue as it grows — see Scorecard · Paid Media for the ramp.",
    },
    drivers: [
      { label: "DTC conversion rate", now: "1.2%", target: "4%", spark: [0.8, 0.9, 1.1, 1.0, 1.2, 1.1, 1.3, 1.2], driven: ["Web", "Creative"], note: "Visits that become orders." },
      { label: "New customers / mo", now: "50", target: "400", spark: [22, 28, 31, 30, 38, 41, 46, 50], driven: ["Everything"], note: "Every phase of the roadmap contributes here." },
      { label: "Average order value", now: "TBD", target: "$45", spark: null, driven: ["Merchandising strategy", "Web"], note: "Boxes of 8 at $25–30 each; bundling and a first-order upsell is the path to $45." },
      { label: "% Returning Customers", now: "TBD", target: "25%", spark: null, driven: ["Email", "Retention"], note: "Share of orders placed by a customer who's bought before." },
      { label: "Subscription Revenue Share", now: "0%", target: "35%", spark: null, driven: ["Email", "Web"], note: "Flat target — cleaner to track against than a range." },
    ],
  },

  /* PULSE ------------------------------------------------------------------ */
  flags: [
    { label: "Flag · open question", text: "Co-packer sourcing is still in progress — tracked in the 3-year outlook, not Fonder HQ." },
    { label: "Flag · decision needed", text: "TikTok Shop sits outside the current 12-month SOW (a separate Year 2 agreement). Confirm with Kaitlyn whether to formalize a scope addendum now rather than wait until Month 12." },
  ],
  upNext: [
    { date: "Jul 21", text: "GTM Shopify site launch", lane: "Web" },
    { date: "Aug 1", text: "Brand identity & art direction kickoff", lane: "Creative" },
    { date: "Aug 1", text: "TikTok Shop specialist contractor hire target", lane: "Marketing" },
    { date: "Sep 1", text: "TikTok Shop setup begins", lane: "Marketing" },
    { date: "Oct 6", text: "Quarterly review · roadmap window advances", lane: "Program" },
  ],
  activity: [
    { date: "Jul 16", entry: "Roadmap restructured into 7 phases (splitting GTM site build from brand identity), targets flattened to single numbers, revenue-mix tracking added, founder-hours/margin/co-packer tracking dropped from Fonder HQ." },
    { date: "May 12", entry: "DTC pricing validated: bundle-first AOV strategy confirmed (boxes of 8, $25–30)." },
    { date: "Apr 22", entry: "MSA and SOW fully executed — 12-month Complete DTC Foundation engagement begins." },
  ],

  /* ROADMAP ----------------------------------------------------------------- */
  window: { start: "2026-07-01", end: "2027-06-30", label: "Rolling 12-month window" },
  arc: { start: "2025-10-01", end: "2027-12-31" },
  gates: [
    { after: "i3", label: "Gate · Phase 3 → 4", text: "Requires jump to $10k/mo engagement to support TikTok Shop and Influencer/Affiliate Management." },
    { after: "i5", label: "Gate · Phase 5 → 6", text: "None blocking — Amazon partner search and asset planning can run in parallel; only the Amazon launch itself (and its PPC spend) waits on creative assets being ready." },
    { after: "i6", label: "Gate · Phase 6 → 7", text: "Meta/Google prospecting doesn't turn on until DTC, TikTok Shop, and Amazon each show a real conversion baseline — not a projection." },
  ],
  initiatives: [
    {
      id: "i1", code: "1", name: "Product Strategy & Packaging",
      desc: "Raw Eddy's becomes Gozo: research, positioning, reformulation direction, naming, packaging.",
      timeframe: { start: "2025-10-01", end: "2026-03-31", label: "Oct '25 – Mar '26" },
      status: "complete",
      why: "Strategy had to land before any build began.",
      bench: [{ l: "Positioning", v: "Defined" }, { l: "Naming", v: "Gozo" }, { l: "Packaging", v: "3 SKUs" }, { l: "Shelf life", v: "12 mo" }],
      projects: [
        { code: "1.1", name: "Product & Positioning Strategy", tf: "Oct – Nov '25", start: "2025-10-01", end: "2025-11-30", status: "complete", tags: ["Brand"] },
        { code: "1.2", name: "Brand Renaming", tf: "Nov – Dec '25", start: "2025-11-01", end: "2025-12-31", status: "complete", tags: ["Brand"] },
        { code: "1.3", name: "Product Reformulation", tf: "Dec '25 – Feb '26", start: "2025-12-01", end: "2026-02-28", status: "complete", tags: ["Product"] },
        { code: "1.4", name: "Packaging Redesign", tf: "Jan – Mar '26", start: "2026-01-01", end: "2026-03-31", status: "complete", tags: ["Brand", "Creative"] },
      ],
    },
    {
      id: "i2", code: "2", name: "Rebrand Implementation & DTC Launch",
      desc: "Turn the rebrand into something sellable: reformulated product into production, the lean GTM Shopify site built, and the photography and wholesale collateral needed to keep that channel moving while DTC comes online.",
      timeframe: { start: "2026-03-01", end: "2026-07-31", label: "Mar '26 – Jul '26" },
      status: "in-progress",
      why: "The rebrand only matters once it's actually buyable. This phase gets the reformulated product into production, builds the GTM site, and refreshes the wholesale-facing materials so that channel doesn't stall while DTC ramps up around it.",
      bench: [{ l: "GTM site", v: "Launching Jul 21" }, { l: "Production", v: "In progress" }, { l: "Wholesale collateral", v: "Refreshed" }],
      projects: [
        { code: "2.1", name: "GTM Shopify — Design & Development", tf: "Mar – May '26", start: "2026-03-01", end: "2026-05-31", status: "complete", tags: ["Digital"] },
        { code: "2.2", name: "Product & Packaging Production", tf: "Apr – Jun '26", start: "2026-04-01", end: "2026-06-30", status: "in-progress", tags: ["Product"] },
        { code: "2.3", name: "Foundational Creative Content (product & lifestyle photography)", tf: "May – Jun '26", start: "2026-05-01", end: "2026-06-30", status: "in-progress", tags: ["Creative"] },
        { code: "2.4", name: "Brand Deliverables Redesign — Event Booth & Linesheets", tf: "Jun – Jul '26", start: "2026-06-01", end: "2026-07-15", status: "in-progress", tags: ["Brand", "Creative"] },
        { code: "2.5", name: "GTM Shopify — Launch", tf: "Jul 21, '26", start: "2026-07-21", end: "2026-07-21", status: "in-progress", tags: ["Digital"] },
      ],
    },
    {
      id: "i3", code: "3", name: "Brand Identity & Content Foundation",
      desc: "Lock the brand identity system and build the content library that TikTok Shop and creator content will run on.",
      timeframe: { start: "2026-08-01", end: "2026-09-30", label: "Aug '26 – Sep '26" },
      status: "upcoming",
      why: "Brand identity and the foundational content library ship before creator-facing content goes out, so TikTok Shop content isn't visually orphaned once the identity system lands.",
      bench: [{ l: "Traffic / mo", v: "1,000 → 1,250" }, { l: "New customers / mo", v: "80 → 100" }, { l: "AOV", v: "$26 → $30" }, { l: "Repeat purchase", v: "8% → 15%" }],
      projects: [
        { code: "3.1", name: "Social Media Templates (Fonder-led)", tf: "Aug '26", start: "2026-08-01", end: "2026-08-31", status: "upcoming", tags: ["Creative"] },
        { code: "3.2", name: "Brand Guidelines & Art Direction System (Fonder-led)", tf: "Aug '26", start: "2026-08-01", end: "2026-08-31", status: "upcoming", tags: ["Brand", "Creative"] },
        { code: "3.3", name: "Content Library Expansion (Gozo-led)", tf: "Aug – Sep '26", start: "2026-08-01", end: "2026-09-30", status: "upcoming", tags: ["Creative"] },
      ],
    },
    {
      id: "i4", code: "4", name: "TikTok Shop & Influencer Activation",
      desc: "Launch TikTok Shop and a creator/affiliate program, led by a dedicated Fonder-staffed specialist.",
      timeframe: { start: "2026-09-01", end: "2026-11-30", label: "Sep '26 – Nov '26" },
      status: "upcoming",
      why: "Lower upfront cost than paid prospecting, strong fit for the Gen Z/snack category, and it proves out creative and messaging before any money goes to Meta. Execution now sits with a dedicated specialist rather than Kaitlyn's in-house social lead — case studies of brands that scaled fast on TikTok Shop consistently had someone whose full-time or near-full-time job was creator relations, and Kaitlyn can't absorb that on top of everything else.",
      bench: [
        { l: "TikTok Shop launch", v: "Not started" }, { l: "Influencer campaigns", v: "Not started" }, { l: "Meta retargeting", v: "Not started" },
        { l: "New customers / mo", v: "100 → 125" }, { l: "TikTok Shop revenue", v: "$0 → $1k" }, { l: "Total DTC sales", v: "$6k → $10k" },
      ],
      projects: [
        { code: "4.1", name: "TikTok Shop Setup & Launch (Gozo-led)", tf: "Sep '26", start: "2026-09-01", end: "2026-09-30", status: "upcoming", tags: ["Digital", "Marketing"] },
        { code: "4.2", name: "Influencer/Affiliate Strategy & Creator Vetting (Fonder-led)", tf: "Sep – Oct '26", start: "2026-09-01", end: "2026-10-31", status: "upcoming", tags: ["Marketing", "Creative"] },
        { code: "4.3", name: "Influencer/Affiliate Execution & Relationship Management (Fonder contractor)", tf: "Oct – Nov '26", start: "2026-10-01", end: "2026-11-30", status: "upcoming", tags: ["Marketing"] },
        { code: "4.4", name: "Meta Retargeting Launch (Fonder-led)", tf: "Sep '26", start: "2026-09-01", end: "2026-09-30", status: "upcoming", tags: ["Marketing"] },
      ],
    },
    {
      id: "i5", code: "5", name: "DTC Expansion & Lifecycle Marketing",
      desc: "Full Shopify build-out, lifecycle email, and a new variety pack SKU to expand the DTC catalog.",
      timeframe: { start: "2026-10-01", end: "2027-01-31", label: "Oct '26 – Jan '27" },
      status: "upcoming",
      why: "Once TikTok Shop and creator content are driving traffic, the site and retention infrastructure need to be ready to convert and keep it — this is what the 35% subscription-revenue goal actually depends on.",
      bench: [{ l: "DTC conversion", v: "TBD" }, { l: "DTC AOV", v: "TBD" }, { l: "Subscribe & Save", v: "Not started" }, { l: "Core email flows", v: "Not started" }],
      projects: [
        { code: "5.1", name: "Design Variety Pack Packaging", tf: "Oct '26", start: "2026-10-01", end: "2026-10-31", status: "upcoming", tags: ["Brand", "Creative"] },
        { code: "5.2", name: "Full Shopify Build-Out (story pages, subscribe & save, CRO)", tf: "Oct – Dec '26", start: "2026-10-01", end: "2026-12-31", status: "upcoming", tags: ["Digital", "Creative"] },
        { code: "5.3", name: "Email Automation & Lifecycle Flows", tf: "Nov '26 – Jan '27", start: "2026-11-01", end: "2027-01-31", status: "upcoming", tags: ["Marketing", "Digital"] },
        { code: "5.4", name: "Launch Variety Pack SKU on Shopify", tf: "Jan '27", start: "2027-01-01", end: "2027-01-31", status: "upcoming", tags: ["Digital", "Product"] },
      ],
    },
    {
      id: "i6", code: "6", name: "Amazon Launch",
      desc: "Select an FBA partner, supply Amazon-specific creative, launch with a competitive PPC budget from day one.",
      timeframe: { start: "2027-01-01", end: "2027-04-30", label: "Jan '27 – Apr '27" },
      status: "upcoming",
      why: "Amazon rarely gains velocity or rank without real PPC from day one. That spend is a built-in cost of the Amazon launch itself, not part of the paid media phase after it.",
      bench: [{ l: "Amazon live", v: "Feb '27" }, { l: "PPC budget", v: "$5k/mo" }, { l: "Partner selected", v: "Jan '27" }],
      projects: [
        { code: "6.1", name: "FBA Partner/Agency Selection", tf: "Jan '27", start: "2027-01-01", end: "2027-01-31", status: "upcoming", tags: ["Digital"] },
        { code: "6.2", name: "Amazon Creative Assets (Image Stacks + A+ Content)", tf: "Jan '27", start: "2027-01-01", end: "2027-01-31", status: "upcoming", tags: ["Creative", "Digital"] },
        { code: "6.3", name: "Amazon Launch & Sponsored Products PPC", tf: "Feb – Apr '27", start: "2027-02-01", end: "2027-04-30", status: "upcoming", tags: ["Digital", "Marketing"] },
      ],
    },
    {
      id: "i7", code: "7", name: "Paid Media Reinvestment & Scale",
      desc: "Meta + Google prospecting, funded as a share of revenue and scaled only while it's paying back.",
      timeframe: { start: "2027-02-01", end: "2027-06-30", label: "Feb/Mar '27 onward" },
      status: "upcoming",
      why: "By now there's real creative and audience data from TikTok, organic, and Amazon to inform what to test on paid, instead of paying to discover it cold.",
      bench: [{ l: "Total paid media", v: "~25% of revenue" }, { l: "Blended CAC", v: "≤ AOV × margin" }],
      projects: [
        { code: "7.1", name: "Campaign Strategy & Creative Concepts", tf: "Feb '27", start: "2027-02-01", end: "2027-02-28", status: "upcoming", tags: ["Marketing", "Creative"] },
        { code: "7.2", name: "Creative Asset Production", tf: "Feb '27", start: "2027-02-01", end: "2027-02-28", status: "upcoming", tags: ["Creative"] },
        { code: "7.3", name: "Meta + Google Paid Prospecting", tf: "Feb '27 onward", start: "2027-02-01", end: "2027-06-30", status: "upcoming", tags: ["Marketing"] },
        { code: "7.4", name: "Meta Retargeting (ongoing floor)", tf: "Ongoing", start: "2026-09-01", end: "2027-06-30", status: "in-progress", tags: ["Marketing"] },
      ],
    },
  ],
  ramp: {
    title: "Why channels launch in this order",
    sub: "Illustrative end-of-program stack. Each channel earns its launch by the one before it proving out — paid spend scales only as fast as revenue funds it.",
    rows: [
      { label: "Wholesale", sub: "the revenue bridge", val: "$8k", width: 19, when: "live now" },
      { label: "+ DTC", sub: "site · email · paid", val: "$22k", width: 52, when: "live · Jul '26" },
      { label: "+ TikTok Shop", sub: "creator-led", val: "$30k", width: 71, when: "Q4 '26" },
      { label: "+ Amazon", sub: "FBA + PPC", val: "$38k", width: 90, when: "Q1 '27" },
      { label: "+ Paid amplification", sub: "reinvested from revenue", val: "$42k+", width: 100, when: "Q2 '27" },
    ],
  },

  /* QUARTER ----------------------------------------------------------------- */
  quarter: {
    code: "Q3 '26", name: "Get to launch, hire the specialist, lock the identity", dates: "July – September 2026",
    focus:
      "Wholesale continues as the steady bridge revenue in the background. Everything active this quarter is about getting the GTM site live, hiring the TikTok Shop/creator specialist, and using the weeks right after launch to lock the brand identity system before any creator-facing content goes out.",
    priorities: [
      { pri: "Priority 1", title: "Launch the GTM Shopify site", tags: ["Digital"], scope: "Launch week of Jul 21 and promote through socials.", why: "Real DTC data and revenue start flowing from here; every downstream phase depends on this being live." },
      { pri: "Priority 2", title: "Develop brand system & art direction", tags: ["Brand", "Creative"], scope: "Art direction guidelines, messaging guidelines, social templates.", why: "Unlocks on-brand social media and TikTok/influencer content at higher volume to support top-of-funnel awareness and followership, and to increase traffic to the new brand." },
      { pri: "Priority 3", title: "Confirm the tier upgrade and ad spend commitment with Kaitlyn", tags: [], scope: "Realign on how to realistically finance the growth we're pursuing.", why: "Everything from Phase 4 onward depends on this being locked, not assumed." },
      { pri: "Priority 4", title: "Hire the TikTok Shop / creator specialist", tags: ["Marketing"], scope: "Confirm budget and hire a dedicated contractor to lead creator strategy and relationships.", why: "The highest-leverage open item before Phase 4 starts — see Decisions." },
    ],
    matrix: {
      lanes: [
        {
          name: "Digital / Web", sub: "Site & platform build",
          cells: [
            { k: "up", v: "GTM site launches", s: "Live Jul 21 — DTC storefront replaces the old wholesale-only presence." },
            { k: "hold", v: "No scheduled work", s: "Site is live; the next build phase waits for TikTok Shop traffic." },
            { k: "up", v: "TikTok Shop setup", s: "Native checkout — doesn't require the full-site conversion gate." },
          ],
          cont: { k: "cont", v: "Full Shopify build-out", s: "Subscribe & save, CRO, story pages — Oct '26 onward." },
        },
        {
          name: "Creative & Brand", sub: "Identity & content",
          cells: [
            { k: "up", v: "Brand deliverables refresh", s: "Event booth & linesheets wrap alongside the GTM launch." },
            { k: "up", v: "Brand identity system", s: "Art direction & guidelines lock — unlocks on-brand social/creator content." },
            { k: "up", v: "Content library expansion", s: "Gozo-led — building the library TikTok content will run on." },
          ],
          cont: { k: "cont", v: "Amazon creative assets", s: "Image stacks & A+ content — Jan '27." },
        },
        {
          name: "Marketing", sub: "Growth & creator",
          cells: [
            { k: "hold", v: "Awaiting specialist hire", s: "TikTok Shop / creator work is gated on the contractor budget decision." },
            { k: "up", v: "TikTok specialist hire", s: "Target hire date Aug 1 — budget pending confirmation." },
            { k: "up", v: "TikTok Shop + Meta retargeting launch", s: "Creator-led revenue plus a small always-on retargeting floor." },
          ],
          cont: { k: "cont", v: "Influencer/affiliate execution", s: "Creator relationship management — Oct–Nov '26." },
        },
        {
          name: "Wholesale", sub: "Bridge revenue",
          cells: [
            { k: "cont", v: "Steady", s: "Continues funding the build in the background." },
            { k: "cont", v: "Steady", s: "No active Fonder scope this month." },
            { k: "cont", v: "Steady", s: "Scales down in relative share as DTC/TikTok Shop grow." },
          ],
          cont: { k: "cont", v: "Ongoing", s: "Bridge role continues until digital channels carry the business." },
        },
      ],
    },
    bench: [
      { l: "GTM site", v: "Launching Jul 21" }, { l: "Brand system", v: "Not started" },
      { l: "Specialist hired", v: "Pending" }, { l: "Tier upgrade", v: "Pending confirmation" },
    ],
  },

  /* SCORECARD ---------------------------------------------------------------- */
  scorecard: [
    { group: "Revenue", rows: [
      { m: "Monthly revenue (3-mo avg)", now: "$6k", target: "$42k", spark: [2.1, 2.4, 2.2, 2.9, 3.1, 3.6, 3.4, 6], status: "pending", src: "shopify", key: "shopify_revenue_3mo_avg" },
      { m: "Annual run rate", now: "$60k", target: "$500k", spark: [25, 28, 31, 36, 40, 44, 48, 60], status: "pending", src: "shopify", key: "shopify_arr" },
    ]},
    { group: "Revenue Mix", rows: [
      { m: "Wholesale revenue share", now: "99%", target: "~19%", spark: null, status: "pending", src: "manual" },
      { m: "DTC revenue share", now: "1%", target: "~43%", spark: null, status: "pending", src: "manual" },
      { m: "TikTok Shop revenue share", now: "0%", target: "~19%", spark: null, status: "pending", src: "manual" },
      { m: "Amazon revenue share", now: "0%", target: "~19%", spark: null, status: "pending", src: "manual" },
    ]},
    { group: "DTC", rows: [
      { m: "Traffic", now: "TBD", target: "TBD", spark: null, status: "pending", src: "ga4" },
      { m: "Total orders / month", now: "TBD", target: "TBD", spark: null, status: "pending", src: "shopify", key: "shopify_orders_per_month" },
      { m: "Total new customers / month", now: "TBD", target: "400", spark: null, status: "pending", src: "shopify", key: "shopify_new_customers_per_month" },
      { m: "Conversion rate", now: "1.2%", target: "4%", spark: [0.8, 0.9, 1.1, 1.0, 1.2, 1.1, 1.3, 1.2], status: "on-track", src: "shopify" },
      { m: "Average order value", now: "TBD", target: "$45", spark: null, status: "pending", src: "shopify", key: "shopify_aov" },
    ]},
    { group: "Retention", rows: [
      { m: "Repeat purchase rate", now: "TBD", target: "25%", spark: null, status: "pending", src: "shopify", key: "shopify_repeat_purchase_rate" },
      { m: "Subscription revenue share", now: "0%", target: "35%", spark: null, status: "pending", src: "shopify" },
      { m: "Email revenue share", now: "0%", target: "25%", spark: null, status: "pending", src: "klaviyo" },
    ]},
    { group: "Brand & Social", rows: [
      { m: "Branded search", now: "TBD", target: "TBD", spark: null, status: "pending", src: "manual" },
      { m: "Social following (IG + TikTok)", now: "TBD", target: "10k+", spark: null, status: "pending", src: "manual" },
    ]},
    { group: "Paid Media", rows: [
      { m: "Total advertising spend (% of revenue)", now: "0%", target: "~25% once proven", spark: null, status: "pending", src: "manual" },
      { m: "Total advertising cost of sale (TACoS)", now: "TBD", target: "TBD", spark: null, status: "pending", src: "manual" },
    ]},
  ],
  sources: {
    shopify: { label: "Shopify", live: false },
    ga4: { label: "GA4", live: false },
    klaviyo: { label: "Klaviyo", live: false },
    manual: { label: "Manual", live: null },
  },

  /* DECISIONS ----------------------------------------------------------------- */
  decisions: [
    { date: "Jul '26", title: "Confirm Transformative Growth tier upgrade and ad spend commitment", body: "Everything from Phase 4 on (Amazon, paid media, the TikTok specialist hire) assumes this is active starting August. Needs written confirmation.", status: "open", dueDate: "2026-08-01" },
    { date: "Jul '26", title: "Founder hours, gross margins, and co-packer capacity removed from Fonder HQ tracking", body: "These stay in the 3-year outlook conversation (which lives outside Fonder HQ), but aren't tracked here — they're not fully in Fonder's control to influence, can't be automated, and self-reporting founder hours specifically felt invasive to ask of Kaitlyn.", status: "standing" },
    { date: "Jul '26", title: "Roadmap restructured into 7 phases, splitting GTM site build from brand identity work", body: "Rebrand Implementation & DTC Launch (site + production + wholesale collateral) is now its own phase, separate from Brand Identity & Content Foundation (identity system + content library) — clearer sequencing than bundling them together.", status: "standing" },
    { date: "Jul '26", title: "Targets flattened to single numbers instead of ranges (AOV $45, conversion 4%, subscription 35%)", body: "Cleaner to actually track against than a range.", status: "standing" },
    { date: "Jul '26", title: "Ad spend shifted to a reinvestment-of-revenue model", body: "Combined Amazon PPC + Meta/Google + retargeting spend follows a reinvestment rule (roughly 20–30% of trailing revenue, ramping to ~25% once all channels are proven) rather than a fixed test budget — sized against DTC/CPG ad-spend benchmarks for sub-$1M brands. Requires Kaitlyn's explicit commitment to scale spend as revenue grows, contingent on performance.", status: "active" },
    { date: "Jul '26", title: "TikTok Shop / creator relations staffed by a dedicated Fonder contractor", body: "Reverses the earlier client-side execution split. Case studies of brands that scaled fast on TikTok Shop consistently had someone whose full-time or near-full-time job was creator relations — Kaitlyn's in-house social lead can't absorb this on top of everything else. Contractor budget (~$3,500–5,500/mo) to be confirmed, along with whether it's billed inside the $10K retainer or as a separate line.", status: "active" },
    { date: "Jul '26", title: "Amazon PPC budget raised from $1,500–2,500/mo to ~$5,000/mo", body: "Original figure was bootstrap-tier; a realistically competitive launch in this category needs closer to $8–15K total across the launch window.", status: "standing" },
    { date: "Jul '26", title: "Revenue target shifted from end of 2026 to end of Q1 2027", body: "Still $500K annual run rate. Launch slipped ~3 months versus the original plan (GTM site launching Jul '26 vs. the original Apr–May target); the target moved back by the same margin rather than being compressed.", status: "standing" },
    { date: "Jul '26", title: "Influencer/affiliate program reactivated, reversing the Mar '26 deferral", body: "TikTok Shop's low-upfront-cost, creator-driven model fits the Gen Z/snack category and can build awareness and revenue before any paid spend turns on.", status: "standing" },
    { date: "Jul '26", title: "TikTok Shop moved from Year 2 to Phase 4 of Year 1", body: "Doesn't require the full-site conversion gate the way Meta/Google prospecting does — it has its own native checkout — and it generates creative and audience learning before any paid spend begins.", status: "standing" },
    { date: "Jul '26", title: "Paid media (Meta + Google prospecting) moved to last", body: "Turns on only after DTC, TikTok Shop, and Amazon each show a real conversion baseline. A small Meta retargeting-only budget is carved out as an earlier exception, since it doesn't need the same proof gate as cold prospecting.", status: "standing" },
    { date: "Jul '26", title: "Transformative Growth tier upgrade assumed effective August 2026", body: "Every Phase 4+ initiative — Amazon, paid media, expanded content production, the TikTok specialist — depends on this being confirmed in writing with Kaitlyn.", status: "active" },
    { date: "Mar '26", title: "Timeline extended to roughly 18 months", body: "Resource realism over optimism. Amazon and TikTok Shop moved later so each launch would land on a proven base instead of splitting founder attention — since revised above, now that TikTok Shop moves earlier with dedicated staffing in place.", status: "standing" },
    { date: "Mar '26", title: "Influencer / affiliate program deferred", body: "Parked beyond the active roadmap until revenue supports dedicated creator partnerships and seeding budget. Founder-led content carried social in the meantime. Reversed Jul '26 — see above.", status: "standing" },
    { date: "Dec '25", title: "Lead with flavor and mission, not macros", body: "Positioning decision: bold nostalgic flavor and the mental health mission on the front of the pack; nutrition speaks from the back. Set against category research showing restriction messaging underperforms with Gen Z.", status: "standing" },
    { date: "Nov '25", title: "Wholesale is the bridge, not the destination", body: "Existing wholesale funds the digital build rather than being scaled for its own sake. Retail returns as a later capstone with traction data behind it.", status: "standing" },
  ],

  tags: {
    Brand: "t-brand", Creative: "t-creative", Digital: "t-digital", Marketing: "t-marketing", Product: "t-product",
  },
};

module.exports = { DATA };
