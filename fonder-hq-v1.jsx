import { useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   FONDER HQ · v1 prototype
   The client-facing growth operating system. The roadmap is the spine;
   around it: Pulse (the daily read), Quarter (the active plan),
   Scorecard (the metric tree, wired for live data), Decisions (the memory).
   Front end of the brand brain: same knowledge layers, rendered for humans.
   Styled to the Fonder UI System v1. Structure is ink, data is green.
──────────────────────────────────────────────────────────────────────────── */

const DATA = {
  client: { name: "Gozo", sub: "Formerly Raw Eddy's" },
  program: {
    timeframe: "Q4 2025 – Q4 2027",
    stage: "Launch → Traction",
    updated: "Jul 10, 2026",
    nextReview: "Oct 6, 2026",
    week: "Week 2 of 13",
    quarter: "Q3 '26",
    health: "on-track",
    headline: ["Prove the channel.", "Then add the next."],
    thesis:
      "Wholesale funds the build while the digital ecosystem comes online. Each channel has to convert and hold before the next one turns on: DTC first, then retention and paid, then Amazon, then TikTok Shop and retail.",
  },

  northStar: {
    value: "$500K run rate by end of 2027",
    hero: {
      label: "Monthly revenue", now: "$4.3k", target: "$40k+",
      spark: [2.1, 2.4, 2.2, 2.9, 3.1, 3.6, 3.4, 4.3],
      note: "All channels combined. Wholesale carries today; each new channel stacks on a base that already converts.",
    },
    drivers: [
      { label: "Conversion rate", now: "1.2%", target: "3–4%", spark: [0.8, 0.9, 1.1, 1.0, 1.2, 1.1, 1.3, 1.2], driven: ["Web", "Creative"], note: "Visits that become orders." },
      { label: "New customers / mo", now: "50", target: "400+", spark: [22, 28, 31, 30, 38, 41, 46, 50], driven: ["Paid", "Amazon", "TikTok"], note: "Stacked on organic and wholesale halo." },
      { label: "Repeat purchase", now: "TBD", target: "25%+", spark: null, driven: ["Email", "Subscription"], note: "Baseline reads once the full store ships." },
    ],
  },

  /* PULSE ------------------------------------------------------------------ */
  needsYou: [
    { title: "Approve the seasonal flavor plan", due: "Jul 18", detail: "First rotating subscription flavor. Fonder brief is in the shared folder; co-packer needs 6 weeks lead.", kind: "approve" },
    { title: "Confirm pause / swap / cancel with co-packer", due: "Jul 25", detail: "Subscription fulfillment requires all three before the 1C launch gate.", kind: "confirm" },
    { title: "Location access for lifestyle shoot", due: "Aug 1", detail: "Two half-days in August for the content library production.", kind: "logistics" },
  ],
  flags: [
    { label: "Flag · open question", text: "Co-packer sourcing is still in progress. Margins (55% now, 65% target) gate the Phase 2 paid-spend decision, not the calendar." },
    { label: "Flag · capacity", text: "Founder hours are running 60+. The August shoot and subscription setup land in the same window; we should sequence or delegate." },
  ],
  upNext: [
    { date: "Jul 21", text: "Subscribe & save flows into design review", lane: "Web" },
    { date: "Aug 4", text: "Studio photography · 3 SKUs", lane: "Creative" },
    { date: "Sep 1", text: "Full site soft launch behind password", lane: "Web" },
    { date: "Sep 22", text: "Ad creative starter pack delivered", lane: "Creative" },
    { date: "Oct 6", text: "Quarterly review · roadmap window advances", lane: "Program" },
  ],
  activity: [
    { date: "Jul 10", entry: "Quarterly review complete. Rolling window advanced to Jul '26 – Jun '27; Q3 plan issued." },
    { date: "Jun 21", entry: "Brand identity system delivered and approved for rollout." },
    { date: "Jun 1", entry: "GTM site live. First DTC orders shipping same week." },
    { date: "May 12", entry: "DTC pricing validated: bundle-first AOV strategy confirmed." },
  ],

  /* ROADMAP ----------------------------------------------------------------- */
  window: { start: "2026-07-01", end: "2027-06-30", label: "Rolling 12-month window" },
  arc: { start: "2025-10-01", end: "2027-12-31" },
  gates: [
    { after: "i1", label: "Gate · Phase 1 → 2", text: "Paid spend does not turn on until the full site converts and the content library can feed the account. Email lands first so acquisition dollars hit customers we can keep." },
    { after: "i2", label: "Gate · Phase 2 → 3", text: "TikTok Shop and retail wait for proven DTC conversion, Amazon velocity, and paid ROAS: real traction data instead of projections." },
  ],
  initiatives: [
    {
      id: "i0", code: "0", name: "Product strategy & packaging",
      desc: "Raw Eddy's becomes Gozo: research, positioning, reformulation, naming, packaging.",
      timeframe: { start: "2025-10-01", end: "2026-03-31", label: "Q4 '25 – Q1 '26" },
      status: "complete",
      why: "Before growth infrastructure, we needed clarity on who Gozo is for, what shelf it competes on, and how the brand shows up.",
      bench: [{ l: "Positioning", v: "Defined" }, { l: "Naming", v: "Gozo" }, { l: "Packaging", v: "3 SKUs" }, { l: "Shelf life", v: "12 mo" }],
      projects: [
        { code: "0A", name: "Audience & market strategy", tf: "Oct – Dec '25", start: "2025-10-01", end: "2025-12-31", status: "complete", tags: ["Brand"] },
        { code: "0B", name: "Positioning, naming & packaging", tf: "Jan – Mar '26", start: "2026-01-01", end: "2026-03-31", status: "complete", tags: ["Brand", "Creative"] },
      ],
    },
    {
      id: "i1", code: "1", name: "DTC launch, brand identity & content",
      desc: "Sell fast with a lean site, build the identity system, expand into the full store, stock the content library.",
      timeframe: { start: "2026-04-01", end: "2026-09-30", label: "Apr – Sep '26" },
      status: "in-progress",
      why: "Speed to revenue beats perfection. The GTM site got Gozo selling by June 1 while wholesale kept funding growth; the identity, full build, and content library must land before Phase 2's spend begins.",
      bench: [{ l: "GTM site", v: "Live ✓" }, { l: "Brand system", v: "Done ✓" }, { l: "Full site", v: "Sep" }, { l: "Conversion", v: "2%+" }],
      projects: [
        { code: "1A", name: "Lean GTM Shopify site", tf: "Apr – May '26", start: "2026-04-01", end: "2026-05-31", status: "complete", tags: ["Digital"] },
        { code: "1B", name: "Brand identity system", tf: "Jun '26", start: "2026-06-01", end: "2026-06-21", status: "complete", tags: ["Brand", "Creative"] },
        { code: "1C", name: "Full Shopify build", tf: "Jul – Sep '26", start: "2026-07-01", end: "2026-09-30", status: "in-progress", tags: ["Digital", "Creative"] },
        { code: "1D", name: "Content library & ad creative", tf: "Aug – Sep '26", start: "2026-08-01", end: "2026-09-30", status: "upcoming", tags: ["Creative"] },
      ],
    },
    {
      id: "i2", code: "2", name: "Retention, paid growth & Amazon",
      desc: "Email automation, paid media, and Amazon FBA: a multi-channel engine where each channel reinforces the others.",
      timeframe: { start: "2026-10-01", end: "2027-04-30", label: "Oct '26 – Apr '27" },
      status: "upcoming",
      why: "With a converting store, the priority is making every customer more valuable (email) before paying for more of them (paid). Amazon launches mid-phase on operations already battle-tested through DTC.",
      bench: [{ l: "Email rev share", v: "25%" }, { l: "Subscription rev", v: "20%+" }, { l: "Blended ROAS", v: "3:1+" }, { l: "Monthly revenue", v: "$25k+" }],
      projects: [
        { code: "2A", name: "Email automation & lifecycle", tf: "Oct – Dec '26", start: "2026-10-01", end: "2026-12-31", status: "upcoming", tags: ["Marketing", "Digital"] },
        { code: "2B", name: "Paid media · Meta + Google", tf: "Dec '26 – Apr '27", start: "2026-12-01", end: "2027-04-30", status: "upcoming", tags: ["Marketing"] },
        { code: "2C", name: "Amazon FBA launch", tf: "Jan – Apr '27", start: "2027-01-01", end: "2027-04-30", status: "upcoming", tags: ["Digital", "Creative"] },
      ],
    },
    {
      id: "i3", code: "3", name: "TikTok Shop & retail readiness",
      desc: "Specialist-led TikTok Shop launch, then multi-channel traction turned into LEAP and regional retail applications.",
      timeframe: { start: "2027-05-01", end: "2027-12-31", label: "May – Dec '27" },
      status: "upcoming",
      why: "TikTok Shop needs near-daily attention; launching it last means it lands on proven conversion, velocity, and ROAS, and the halo lifts every other channel. Retail is the capstone, pitched with 6–9 months of real data.",
      bench: [{ l: "Monthly revenue", v: "$40k+" }, { l: "TikTok Shop rev", v: "$5k+/mo" }, { l: "Following", v: "10k+" }, { l: "Retail apps", v: "LEAP + 2" }],
      projects: [
        { code: "3A", name: "TikTok Shop launch", tf: "May – Sep '27", start: "2027-05-01", end: "2027-09-30", status: "upcoming", tags: ["Digital", "Marketing"] },
        { code: "3B", name: "Retail readiness & applications", tf: "Aug – Dec '27", start: "2027-08-01", end: "2027-12-31", status: "upcoming", tags: ["Brand"] },
      ],
    },
  ],
  ramp: {
    title: "Why channels launch in this order",
    sub: "Illustrative end-of-program stack. Each channel earns its launch by the one before it proving out.",
    rows: [
      { label: "Wholesale", sub: "the revenue bridge", val: "$8k", width: 20, when: "live now" },
      { label: "+ DTC", sub: "site · email · paid", val: "$22k", width: 55, when: "live · Jun '26" },
      { label: "+ Amazon", sub: "FBA + Subscribe & Save", val: "$32k", width: 80, when: "Q1 '27" },
      { label: "+ TikTok Shop", sub: "specialist-led", val: "$40k+", width: 100, when: "Q2 '27" },
    ],
  },

  /* QUARTER ----------------------------------------------------------------- */
  quarter: {
    code: "Q3 '26", name: "Build the store that converts", dates: "July – September 2026",
    focus:
      "The GTM site is live and selling. This quarter turns it into the full experience: subscription, retention features, CRO foundations, and the content library Phase 2's paid spend will run on. Nothing scales until this converts.",
    priorities: [
      { pri: "Priority 1", title: "Full Shopify build", scope: "Story pages, subscribe & save with a rotating seasonal flavor, sample pack and gift bundle entry points, CRO foundations.", why: "Conversion is the lever on every future acquisition dollar. The subscription model is the retention engine everything in Phase 2 feeds." },
      { pri: "Priority 2", title: "Content library & ad creative", scope: "Studio photography for 3 SKUs, lifestyle imagery, a 3–5 variation ad starter pack, creative direction for ongoing content.", why: "Phase 2's paid account starves without creative volume. The library is built now so spend never waits on assets." },
      { pri: "Priority 3", title: "Subscription operations", scope: "Client-led: pause / swap / cancel with the co-packer, first seasonal flavor planned, fulfillment tested end to end.", why: "A subscription the operations can't honor is churn with extra steps. Ops readiness is a launch gate, not a follow-up." },
      { pri: "Priority 4", title: "Wholesale momentum", scope: "Client-led: gyms, studios, boutique grocery, universities; the Whole Foods forager relationship warms.", why: "Wholesale is the revenue bridge funding the build, and every door is future retail proof." },
    ],
    matrix: {
      lanes: [
        { name: "Web", sub: "full build · phased", cells: [
          { v: "Design", s: "Story pages + subscription flows", k: "up" },
          { v: "Build", s: "Develop, integrate, QA", k: "up" },
          { v: "Launch", s: "Soft launch, then cutover", k: "up" }],
          cont: { v: "CRO", s: "test and iterate", k: "cont" } },
        { name: "Creative", sub: "library · batched", cells: [
          { v: "Prep", s: "Shot lists, style frames", k: "up" },
          { v: "Produce", s: "Studio + lifestyle shoots", k: "up" },
          { v: "Deliver", s: "Library + ad starter pack", k: "up" }],
          cont: { v: "Refresh", s: "ongoing angles", k: "cont" } },
        { name: "Product ops", sub: "client · co-packer", cells: [
          { v: "Scope", s: "Subscription requirements", k: "up" },
          { v: "Stand up", s: "Pause / swap / cancel live", k: "up" },
          { v: "Test", s: "End-to-end fulfillment", k: "up" }],
          cont: { v: "Run", s: "steady state", k: "cont" } },
        { name: "Email", sub: "held until Phase 2", cells: [
          { v: "Hold", s: "capture only", k: "hold" },
          { v: "Hold", s: "list builds from site", k: "hold" },
          { v: "Prep", s: "Klaviyo scoping", k: "up" }],
          cont: { v: "Flows", s: "build begins Oct", k: "cont" } },
      ],
    },
    bench: [
      { l: "Site conversion", v: "2%+" }, { l: "Subscription", v: "Live" },
      { l: "Ad-ready assets", v: "40+" }, { l: "Email list", v: "1k+" },
    ],
  },

  /* SCORECARD ---------------------------------------------------------------- */
  scorecard: [
    { group: "Growth", rows: [
      { m: "Monthly revenue", now: "$4.3k", target: "$40k+", spark: [2.1, 2.4, 2.2, 2.9, 3.1, 3.6, 3.4, 4.3], status: "on-track", src: "shopify" },
      { m: "Annual run rate", now: "$52k", target: "$500k", spark: [25, 28, 31, 36, 40, 44, 48, 52], status: "on-track", src: "shopify" },
    ]},
    { group: "Acquisition", rows: [
      { m: "Conversion rate", now: "1.2%", target: "3–4%", spark: [0.8, 0.9, 1.1, 1.0, 1.2, 1.1, 1.3, 1.2], status: "on-track", src: "ga4" },
      { m: "New customers / mo", now: "50", target: "400+", spark: [22, 28, 31, 30, 38, 41, 46, 50], status: "on-track", src: "shopify" },
      { m: "Branded search", now: "Baseline TBD", target: "Growth trend", spark: null, status: "pending", src: "ga4" },
    ]},
    { group: "Retention", rows: [
      { m: "Repeat purchase rate", now: "TBD", target: "25%+", spark: null, status: "pending", src: "shopify" },
      { m: "Email rev share", now: "0%", target: "25%", spark: null, status: "pending", src: "klaviyo" },
      { m: "Subscription rev share", now: "0%", target: "20%+", spark: null, status: "pending", src: "shopify" },
    ]},
    { group: "Economics", rows: [
      { m: "Gross margins", now: "55%", target: "65%", spark: [52, 53, 53, 54, 54, 55, 55, 55], status: "at-risk", src: "manual", warn: "Co-packer sourcing gates Phase 2 spend" },
      { m: "Average order value", now: "TBD", target: "$25+", spark: null, status: "pending", src: "shopify" },
      { m: "Founder hours / wk", now: "60+", target: "≤40", spark: [65, 62, 66, 64, 60, 63, 61, 62], status: "at-risk", src: "manual", warn: "Biggest capacity risk in the program" },
      { m: "Co-packer capacity", now: "In sourcing", target: "10k units/mo", spark: null, status: "pending", src: "manual" },
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
    { date: "Jul '26", title: "Rolling window advanced to Jul '26 – Jun '27", body: "Quarterly review. Q3 plan issued: full Shopify build and content library are the quarter's spine. Q3 exit benchmarks set: 2%+ conversion, subscription live, 40+ ad-ready assets, 1k+ email list.", status: "active" },
    { date: "Mar '26", title: "Timeline extended to roughly 18 months", body: "Resource realism over optimism. Amazon moved into Phase 2 and TikTok Shop to Phase 3 so each launch lands on a proven base instead of splitting founder attention.", status: "standing" },
    { date: "Mar '26", title: "Influencer / affiliate program deferred", body: "Parked beyond the active roadmap until revenue supports dedicated creator partnerships and seeding budget. Founder-led content carries social in the meantime.", status: "standing" },
    { date: "Dec '25", title: "Lead with flavor and mission, not macros", body: "Positioning decision: bold nostalgic flavor and the mental health mission on the front of the pack; nutrition speaks from the back. Set against category research showing restriction messaging underperforms with Gen Z.", status: "standing" },
    { date: "Nov '25", title: "Wholesale is the bridge, not the destination", body: "Existing wholesale funds the digital build rather than being scaled for its own sake. Retail returns as the Phase 3 capstone with traction data behind it.", status: "standing" },
  ],

  tags: {
    Brand: "t-brand", Creative: "t-creative", Digital: "t-digital", Marketing: "t-marketing", Product: "t-product",
  },
};

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Asta+Sans:wght@400..700&family=Geist+Mono:wght@400..700&family=Inter+Tight:wght@400..700&display=swap');
:root{
  --paper:#F2F1EC; --card:#FBFAF7; --ink:#181A1E; --muted:#6C6F76;
  --line:#DED9CF; --line2:#EAE6DD;
  --green:#008031; --lgreen:#F3FDBF; --lgreen-line:#CDEB9A;
  --pink:#FFD6EC; --pink-line:#F5B9D8; --red:#F23400;
  --lblue:#EAF8FC; --blue:#3538E7;
  --amber:#E0A800; --amber-bg:#FBF3D6; --amber-line:#EAD489; --amber-ink:#8A6300;
  --gray-hi:#E7E4DC; --bench-bg:#EFEDE6; --dot:#C4C1B8; --on-dark:#D8D5CC;
  --sans:'Asta Sans','Inter Tight',ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
  --mono:'Geist Mono',ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
.hq{display:flex;min-height:100vh;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.5;letter-spacing:-.005em;-webkit-font-smoothing:antialiased}
.hq .mono{font-family:var(--mono);font-variant-numeric:tabular-nums;letter-spacing:-.01em}

/* ── sidebar: structure is ink ── */
.hq .side{width:224px;flex-shrink:0;background:var(--ink);color:var(--on-dark);display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
.hq .side .brand{padding:22px 20px 18px;border-bottom:1px solid rgba(216,213,204,.14)}
.hq .side .logo{font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.22em;color:#fff}
.hq .side .cl{margin-top:14px;display:flex;align-items:center;gap:9px}
.hq .side .cl .csq{width:26px;height:26px;border-radius:7px;background:var(--lgreen);color:var(--green);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-weight:700;font-size:12px}
.hq .side .cl .cn{font-size:13.5px;font-weight:650;color:#fff;line-height:1.15}
.hq .side .cl .cs{font-size:10px;color:var(--on-dark);opacity:.55}
.hq nav{padding:14px 10px;display:flex;flex-direction:column;gap:2px}
.hq .nav-lbl{font-family:var(--mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--on-dark);opacity:.4;padding:10px 10px 6px}
.hq .ni{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:9px;cursor:pointer;border:none;background:transparent;color:var(--on-dark);font-family:var(--sans);font-size:13.5px;font-weight:550;letter-spacing:-.01em;text-align:left;width:100%;opacity:.72;transition:.12s}
.hq .ni:hover{opacity:1;background:rgba(255,255,255,.05)}
.hq .ni.on{opacity:1;background:rgba(243,253,191,.1);color:#fff}
.hq .ni .k{font-family:var(--mono);font-size:10px;font-weight:600;width:16px;color:var(--on-dark);opacity:.5}
.hq .ni.on .k{color:var(--lgreen);opacity:1}
.hq .ni .badge{margin-left:auto;font-family:var(--mono);font-size:9px;font-weight:700;background:var(--amber-bg);color:var(--amber-ink);border-radius:20px;padding:1px 7px}
.hq .side .sfoot{margin-top:auto;padding:16px 20px;border-top:1px solid rgba(216,213,204,.14);font-family:var(--mono);font-size:9.5px;line-height:1.7;color:var(--on-dark);opacity:.55}
.hq .side .sfoot b{color:#fff;font-weight:600}

/* ── main ── */
.hq .main{flex:1;min-width:0;display:flex;flex-direction:column}
.hq .top{display:flex;align-items:center;gap:14px;padding:14px 28px;border-bottom:1px solid var(--line);background:var(--paper);position:sticky;top:0;z-index:40}
.hq .top .vt{font-size:15px;font-weight:680;letter-spacing:-.02em;white-space:nowrap}
.hq .ask{flex:1;max-width:430px;display:flex;align-items:center;gap:9px;background:#fff;border:1px solid var(--line);border-radius:11px;padding:8px 13px;color:var(--muted);font-size:12.5px;cursor:text}
.hq .ask .kb{margin-left:auto;font-family:var(--mono);font-size:9.5px;color:var(--dot);border:1px solid var(--line2);border-radius:5px;padding:1px 5px}
.hq .top .ctx{margin-left:auto;display:flex;align-items:center;gap:9px}
.hq .ctx .qchip{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;background:var(--ink);color:var(--on-dark);border-radius:20px;padding:4px 11px;white-space:nowrap}
.hq .content{padding:30px 28px 90px;max-width:1060px;width:100%;margin:0 auto}

/* type & shared */
.hq .h-page{font-size:clamp(24px,3.4vw,34px);font-weight:700;letter-spacing:-.03em;line-height:1.05}
.hq .lede{font-size:14.5px;color:var(--muted);max-width:70ch;margin-top:8px;line-height:1.55}
.hq .lbl{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600}
.hq .card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px 22px}
.hq .tile{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.hq .sect{margin-top:34px}
.hq .sect > .lbl{display:block;margin-bottom:12px}
.hq .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:860px){.hq .grid2{grid-template-columns:1fr}}

/* pills */
.hq .pill{display:inline-flex;align-items:center;gap:4px;font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.04em;border-radius:20px;padding:3px 9px;text-transform:uppercase;white-space:nowrap}
.hq .pill.up{background:var(--green);color:#fff}
.hq .pill.ok{background:#fff;color:var(--green);border:1px solid var(--green)}
.hq .pill.done{background:var(--gray-hi);color:var(--muted)}
.hq .pill.next{background:transparent;color:var(--muted);border:1px solid var(--line)}
.hq .pill.risk{background:var(--pink);color:var(--red);border:1px solid var(--pink-line)}
.hq .pill.pend{background:transparent;color:var(--muted);border:1px dashed var(--line)}
.hq .pill.black{background:var(--ink);color:var(--on-dark)}
.hq .pill.t-brand{background:var(--pink);color:var(--red);border:1px solid var(--pink-line)}
.hq .pill.t-creative{background:var(--lblue);color:var(--blue)}
.hq .pill.t-digital{background:var(--lgreen);color:var(--green);border:1px solid var(--lgreen-line)}
.hq .pill.t-marketing{background:var(--ink);color:var(--on-dark)}
.hq .pill.t-product{background:transparent;color:var(--muted);border:1px solid var(--line)}
.hq .pill.src{background:var(--card);color:var(--muted);border:1px solid var(--line2);text-transform:none;letter-spacing:0}
.hq .pill.src .dot-soon{width:5px;height:5px;border-radius:50%;background:var(--amber)}
.hq .pill.src .dot-live{width:5px;height:5px;border-radius:50%;background:var(--green)}

/* north star tiles */
.hq .ntile{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:17px 19px;display:flex;flex-direction:column}
.hq .nlabel{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:500}
.hq .nvals{display:flex;align-items:baseline;gap:11px;margin-top:8px;flex-wrap:wrap}
.hq .nnow{font-family:var(--mono);font-size:15px;font-weight:600;color:var(--muted)}
.hq .narrow{color:var(--green);font-size:14px}
.hq .ntarget{font-family:var(--mono);font-weight:700;color:var(--green);font-size:21px}
.hq .nnote{font-size:12px;color:var(--muted);margin-top:7px;line-height:1.45}
.hq .n-hero{background:var(--green);border-color:var(--green)}
.hq .n-hero .nlabel{color:var(--lgreen);opacity:.8}
.hq .n-hero .nnow{color:var(--lgreen);opacity:.6;font-size:20px}
.hq .n-hero .narrow{color:var(--lgreen);opacity:.7;font-size:19px}
.hq .n-hero .ntarget{color:var(--lgreen);font-size:clamp(30px,4.4vw,42px);letter-spacing:-.03em;line-height:1}
.hq .n-hero .nnote{color:var(--lgreen);opacity:.85}
.hq .heror{display:grid;grid-template-columns:1.35fr 1fr 1fr 1fr;gap:12px}
@media(max-width:980px){.hq .heror{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.hq .heror{grid-template-columns:1fr}}
.hq .drv{background:var(--lgreen);border-color:var(--lgreen-line)}
.hq .drv .nlabel{color:var(--green);opacity:.7}
.hq .drv .nnow{color:var(--green);opacity:.55;font-size:13px}
.hq .drv .narrow{color:var(--green);opacity:.75}
.hq .drv .ntarget{color:var(--green);font-size:19px}
.hq .drv .nnote{color:var(--green);opacity:.7}
.hq .driver{margin-top:auto;padding-top:9px;border-top:1px solid rgba(0,128,49,.4);font-family:var(--mono);font-size:9px;color:var(--green);opacity:.62}
.hq .driver .sep{margin:0 .3em}
.hq .sparkbox{margin-top:10px}

/* needs-you / up-next / activity */
.hq .task{display:flex;gap:12px;padding:12px 0;border-top:1px solid var(--line2);align-items:flex-start}
.hq .task:first-of-type{border-top:none;padding-top:2px}
.hq .task .tk{flex-shrink:0;margin-top:2px;width:16px;height:16px;border:1.5px solid var(--dot);border-radius:5px}
.hq .task .tt{font-size:13.5px;font-weight:640;letter-spacing:-.01em}
.hq .task .td{font-size:12px;color:var(--muted);line-height:1.5;margin-top:2px}
.hq .task .due{margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--amber-ink);background:var(--amber-bg);border:1px solid var(--amber-line);border-radius:20px;padding:2px 8px;white-space:nowrap;flex-shrink:0}
.hq .flag{background:var(--amber-bg);border:1px solid var(--amber-line);border-left:3px solid var(--amber);border-radius:0 12px 12px 0;padding:12px 16px;font-size:12.5px;line-height:1.5}
.hq .flag + .flag{margin-top:8px}
.hq .flag .fl{font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--amber-ink);font-weight:700;display:block;margin-bottom:3px}
.hq .up{display:flex;gap:13px;padding:9px 0;border-top:1px solid var(--line2);align-items:baseline}
.hq .up:first-of-type{border-top:none;padding-top:2px}
.hq .up .ud{font-family:var(--mono);font-size:10.5px;font-weight:600;color:var(--muted);min-width:48px;flex-shrink:0}
.hq .up .ut{font-size:13px;line-height:1.45}
.hq .up .ul{margin-left:auto;font-family:var(--mono);font-size:9px;color:var(--dot);text-transform:uppercase;letter-spacing:.06em;flex-shrink:0}
.hq .act{display:flex;gap:13px;padding:8px 0;border-top:1px solid var(--line2);font-size:12.5px}
.hq .act:first-of-type{border-top:none;padding-top:0}
.hq .act .ad{font-family:var(--mono);font-size:10px;font-weight:600;color:var(--dot);min-width:48px;flex-shrink:0;padding-top:2px}
.hq .act .ae{color:var(--muted);line-height:1.5}

/* gate */
.hq .gate{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--green);border-radius:0 12px 12px 0;padding:13px 17px}
.hq .gate + .gate{margin-top:10px}
.hq .gate .g{font-family:var(--mono);font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--green);font-weight:600}
.hq .gate p{margin:5px 0 0;font-size:13px;line-height:1.5;max-width:84ch}

/* arc */
.hq .arc-scroll{overflow-x:auto;padding-bottom:4px}
.hq .arc-inner{min-width:760px;position:relative}
.hq .qrow{position:relative;height:15px;margin-bottom:6px}
.hq .qrow span{position:absolute;font-family:var(--mono);font-size:8.5px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;opacity:.7}
.hq .arc-track{position:relative;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px 0}
.hq .arc-window{position:absolute;top:-1px;bottom:-1px;border:1.5px dotted var(--dot);border-radius:14px;background:rgba(255,255,255,.45);z-index:1}
.hq .arc-window .wl{position:absolute;top:-8px;left:10px;font-family:var(--mono);font-size:8px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:var(--paper);padding:0 6px}
.hq .arc-today{position:absolute;top:-6px;bottom:-6px;border-left:2px dashed var(--red);z-index:6}
.hq .arc-today span{position:absolute;top:-14px;left:50%;transform:translateX(-50%);font-family:var(--mono);font-size:8.5px;font-weight:600;color:var(--red);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.hq .arc-rows{display:flex;flex-direction:column;gap:7px;position:relative;z-index:3;padding:0 10px}
.hq .arc-row{display:flex}
.hq .ibar{border-radius:9px;padding:8px 9px;display:flex;flex-direction:column;gap:6px;overflow:hidden;cursor:pointer;transition:box-shadow .12s}
.hq .ibar:hover{box-shadow:0 0 0 2px var(--lgreen-line)}
.hq .ibar.done{background:var(--gray-hi);border:1px solid var(--line)}
.hq .ibar.live{background:var(--green);border:1px solid var(--green)}
.hq .ibar.next{background:#fff;border:1.5px dashed var(--line)}
.hq .ibar .ihead{display:flex;align-items:center;gap:6px}
.hq .ibar .ino{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:5px;font-family:var(--mono);font-size:9.5px;font-weight:700;flex-shrink:0}
.hq .ibar.done .ino{background:rgba(24,26,30,.12);color:var(--muted)}
.hq .ibar.live .ino{background:rgba(243,253,191,.28);color:var(--lgreen)}
.hq .ibar.next .ino{background:var(--paper);color:var(--muted);border:1px solid var(--line2)}
.hq .ibar .inm{font-size:9.5px;font-weight:650;line-height:1.25;letter-spacing:-.01em}
.hq .ibar.done .inm{color:var(--muted)}.hq .ibar.live .inm{color:var(--lgreen)}.hq .ibar.next .inm{color:var(--muted)}
.hq .pbar{height:16px;border-radius:5px;display:flex;align-items:center;gap:5px;padding:0 7px;overflow:hidden;min-width:54px}
.hq .ibar.done .pbar{background:rgba(24,26,30,.07)}
.hq .ibar.live .pbar{background:rgba(243,253,191,.2)}
.hq .ibar.next .pbar{background:var(--paper);border:1px dashed var(--line2)}
.hq .pbar .pc{font-family:var(--mono);font-size:7.5px;font-weight:700;flex-shrink:0}
.hq .pbar .pn{font-size:7.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hq .ibar.done .pc,.hq .ibar.done .pn{color:var(--muted)}
.hq .ibar.live .pc,.hq .ibar.live .pn{color:var(--lgreen)}
.hq .ibar.next .pc,.hq .ibar.next .pn{color:var(--muted)}
.hq .arc-key{display:flex;flex-wrap:wrap;gap:14px;margin-top:11px;font-size:11px;color:var(--muted)}
.hq .arc-key span{display:flex;align-items:center;gap:6px}
.hq .arc-key i{width:18px;height:11px;border-radius:4px;display:inline-block}
.hq .arc-key i.k-done{background:var(--gray-hi)}.hq .arc-key i.k-live{background:var(--green)}
.hq .arc-key i.k-next{background:#fff;border:1.5px dashed var(--line)}
.hq .arc-key i.k-win{background:rgba(255,255,255,.6);border:1.5px dotted var(--dot)}

/* initiative cards */
.hq .init{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.hq .ihd{display:flex;align-items:flex-start;gap:12px;padding:18px 20px;cursor:pointer}
.hq .ihd:hover{background:var(--card)}
.hq .isq{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:var(--ink);color:#fff;font-family:var(--mono);font-size:12px;font-weight:700;flex-shrink:0}
.hq .init.is-done .isq{background:var(--gray-hi);color:var(--muted)}
.hq .ihd h3{font-size:16px;font-weight:680;letter-spacing:-.02em;line-height:1.25}
.hq .ihd .idesc{font-size:12px;color:var(--muted);margin-top:3px;line-height:1.5;max-width:66ch}
.hq .ihd .imeta{margin-left:auto;display:flex;align-items:center;gap:9px;flex-shrink:0}
.hq .ihd .itf{font-family:var(--mono);font-size:10px;color:var(--muted);white-space:nowrap}
.hq .caret{font-size:9px;color:var(--dot);transition:transform .15s;display:inline-block}
.hq .caret.open{transform:rotate(180deg)}
.hq .ibody{border-top:1px solid var(--line2);padding:16px 20px 20px}
.hq .why{background:var(--card);border:1px solid var(--line2);border-radius:12px;padding:12px 15px;margin-bottom:12px}
.hq .why .wl{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;margin-right:8px}
.hq .why p{display:inline;font-size:13px;color:var(--muted);line-height:1.55}
.hq .proj{display:flex;align-items:center;gap:9px;padding:10px 13px;border:1px solid var(--line2);border-radius:11px;background:var(--card);flex-wrap:wrap}
.hq .proj + .proj{margin-top:7px}
.hq .pcode{font-family:var(--mono);font-size:9.5px;font-weight:700;color:var(--muted)}
.hq .pname{font-size:13px;font-weight:640;letter-spacing:-.01em}
.hq .ptf{font-family:var(--mono);font-size:9.5px;color:var(--muted);margin-left:auto;white-space:nowrap}

/* bench */
.hq .bench{background:var(--bench-bg);border:1.5px dotted var(--dot);border-radius:14px;padding:14px 17px}
.hq .bench h5{font-family:var(--mono);font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:9px}
.hq .bench .bgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
@media(max-width:620px){.hq .bench .bgrid{grid-template-columns:repeat(2,1fr)}}
.hq .bench .l{font-family:var(--mono);font-size:9.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.hq .bench .v{font-family:var(--mono);font-size:15px;font-weight:700;margin-top:3px;letter-spacing:-.01em}

/* ramp */
.hq .lrow{display:grid;grid-template-columns:160px 1fr 104px;gap:14px;align-items:center;margin-bottom:10px}
@media(max-width:640px){.hq .lrow{grid-template-columns:1fr;gap:5px;margin-bottom:16px}}
.hq .lrow .ll{font-size:12.5px;font-weight:600;line-height:1.2}
.hq .lrow .ll span{display:block;font-size:10.5px;color:var(--muted);font-weight:400;margin-top:1px}
.hq .ltrack{position:relative;height:28px;background:var(--paper);border:1px solid var(--line2);border-radius:8px}
.hq .lfill{height:100%;border-radius:7px;display:flex;align-items:center;padding:0 10px;color:var(--lgreen);font-family:var(--mono);font-size:12px;font-weight:700;min-width:54px}
.hq .lrow.r1 .lfill{background:rgba(0,128,49,.42)}
.hq .lrow.r2 .lfill{background:rgba(0,128,49,.62)}
.hq .lrow.r3 .lfill{background:rgba(0,128,49,.8)}
.hq .lrow.r4 .lfill{background:var(--green)}
.hq .lwhen{font-family:var(--mono);font-size:10.5px;color:var(--muted);text-align:right;white-space:nowrap}

/* quarter view */
.hq .mhead{display:flex;align-items:center;gap:13px;flex-wrap:wrap}
.hq .mno{font-family:var(--mono);font-size:11.5px;font-weight:600;color:#fff;background:var(--ink);border-radius:8px;padding:5px 9px;letter-spacing:.03em}
.hq .mname{font-size:21px;font-weight:680;letter-spacing:-.025em}
.hq .mdates{font-family:var(--mono);font-size:10.5px;color:var(--muted);margin-left:auto}
.hq .ws{border-top:1px solid var(--line2);padding:16px 0}
.hq .ws:first-of-type{border-top:none;padding-top:4px}
.hq .ws .pri{display:inline-block;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--on-dark);background:var(--ink);border-radius:20px;padding:3px 10px}
.hq .ws .wt{font-size:16px;font-weight:660;letter-spacing:-.02em;margin:9px 0 4px}
.hq .ws .scope{font-size:13px;line-height:1.55;max-width:84ch}
.hq .ws .whyl{font-size:12.5px;color:var(--muted);line-height:1.55;margin-top:6px;max-width:84ch}
.hq .ws .whyl .lb{font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;font-weight:700;color:var(--ink);margin-right:6px}
.hq .matrix-wrap{overflow-x:auto}
.hq table.matrix{width:100%;min-width:640px;border-collapse:separate;border-spacing:0}
.hq .matrix th{font-family:var(--mono);font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:600;text-align:left;padding:0 8px 10px;border-bottom:1px solid var(--dot)}
.hq .matrix th.c{text-align:center;width:21%}
.hq .matrix td{padding:6px 7px;vertical-align:top;border-top:1px solid var(--line2)}
.hq .matrix tr:first-child td{border-top:none;padding-top:10px}
.hq .matrix .sector{font-size:12.5px;font-weight:650;white-space:nowrap;padding-left:2px}
.hq .matrix .sector span{display:block;font-family:var(--mono);font-size:9.5px;font-weight:400;color:var(--muted);margin-top:2px}
.hq .cell{border-radius:10px;padding:9px 10px;border:1px solid transparent}
.hq .cell.up{background:#fff;border-color:var(--line)}
.hq .cell.hold{background:transparent;border:1px dashed var(--pink-line)}
.hq .cell.cont{background:var(--gray-hi);border-color:var(--line2)}
.hq .cell .v{font-size:12.5px;font-weight:670;letter-spacing:-.01em}
.hq .cell.hold .v,.hq .cell.cont .v{color:var(--muted)}
.hq .cell .s{font-size:10.5px;color:var(--muted);margin-top:2px;line-height:1.35}

/* scorecard */
.hq .sc-wrap{overflow-x:auto}
.hq table.sc{width:100%;min-width:680px;border-collapse:separate;border-spacing:0;font-size:13px}
.hq .sc th{font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600;text-align:left;padding:8px 10px;border-bottom:1px solid var(--ink)}
.hq .sc td{padding:11px 10px;border-bottom:1px solid var(--line2);vertical-align:middle}
.hq .sc .grp td{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600;padding:18px 10px 7px;border-bottom:1px solid var(--line)}
.hq .sc .m{font-weight:650}
.hq .sc .num{font-family:var(--mono);font-variant-numeric:tabular-nums;font-weight:600}
.hq .sc .tgt{font-family:var(--mono);font-variant-numeric:tabular-nums;font-weight:700;color:var(--green)}
.hq .sc .nodata{font-family:var(--mono);font-size:10px;color:var(--dot)}

/* decisions */
.hq .dec{border:1px solid var(--line);border-radius:14px;background:#fff;padding:16px 19px}
.hq .dec + .dec{margin-top:10px}
.hq .dec .dh{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.hq .dec .dd{font-family:var(--mono);font-size:10.5px;font-weight:600;color:var(--muted)}
.hq .dec .dt{font-size:14.5px;font-weight:660;letter-spacing:-.015em}
.hq .dec .db{font-size:12.5px;color:var(--muted);line-height:1.55;margin-top:6px;max-width:86ch}

/* dark closer + warn */
.hq .dep{background:var(--ink);color:#EDEBE4;border-radius:18px;padding:24px 26px}
.hq .dep .t{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#C9A96A;font-weight:500}
.hq .dep h3{font-size:19px;font-weight:650;letter-spacing:-.02em;margin:9px 0 7px}
.hq .dep p{font-size:13.5px;color:#B9B7B0;line-height:1.55;max-width:78ch}
.hq .warn-tri{vertical-align:middle;margin-left:6px;flex-shrink:0}

.hq :focus-visible{outline:2px solid var(--green);outline-offset:3px;border-radius:4px}
@media(prefers-reduced-motion:reduce){.hq *{transition:none!important}}

/* responsive shell */
@media(max-width:820px){
  .hq{flex-direction:column}
  .hq .side{width:100%;height:auto;position:static;flex-direction:column}
  .hq .side .brand{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(216,213,204,.14)}
  .hq .side .cl{margin-top:0}
  .hq nav{flex-direction:row;overflow-x:auto;padding:8px 12px;gap:4px}
  .hq .nav-lbl,.hq .side .sfoot{display:none}
  .hq .ni{white-space:nowrap;width:auto}
  .hq .top{padding:12px 16px;flex-wrap:wrap}
  .hq .ask{order:3;max-width:none;width:100%}
  .hq .content{padding:22px 16px 70px}
}
`;

/* ─── ATOMS ──────────────────────────────────────────────────────────────── */
const STATUS = {
  "in-progress": { label: "In progress", cls: "up" },
  "on-track": { label: "On track", cls: "ok" },
  complete: { label: "Complete", cls: "done" },
  upcoming: { label: "Upcoming", cls: "next" },
  "at-risk": { label: "Needs focus", cls: "risk" },
  pending: { label: "Baseline TBD", cls: "pend" },
};
const Chip = ({ status }) => {
  const s = STATUS[status] || STATUS.upcoming;
  return <span className={`pill ${s.cls}`}>{s.label}</span>;
};
const TagPill = ({ tag }) => <span className={`pill ${DATA.tags[tag] || "t-product"}`}>{tag}</span>;

const Spark = ({ data, w = 84, h = 26, hero = false }) => {
  if (!data) return <span className="nodata mono">awaiting data</span>;
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - min) / rng) * (h - 6)}`).join(" ");
  const [lx, ly] = pts.split(" ").pop().split(",");
  const stroke = hero ? "#F3FDBF" : "#008031";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={hero ? 0.9 : 0.75} />
      <circle cx={lx} cy={ly} r="2.6" fill={stroke} />
    </svg>
  );
};
const WarnTri = ({ title }) => (
  <svg className="warn-tri" width="13" height="13" viewBox="0 0 24 24" role="img" aria-label="risk">
    <title>{title}</title>
    <path d="M12 3 L22 20 L2 20 Z" fill="#F5C518" stroke="#1a1a1a" strokeWidth="1.4" strokeLinejoin="round" />
    <rect x="11.1" y="9" width="1.8" height="5.5" rx=".9" fill="#1a1a1a" />
    <circle cx="12" cy="17" r="1.05" fill="#1a1a1a" />
  </svg>
);

/* ─── SHARED BLOCKS ──────────────────────────────────────────────────────── */
const NorthStarRow = () => {
  const ns = DATA.northStar;
  return (
    <div className="heror">
      <div className="ntile n-hero">
        <div className="nlabel">Monthly revenue · north star: {ns.value}</div>
        <div className="nvals">
          <span className="nnow mono">{ns.hero.now}</span>
          <span className="narrow">→</span>
          <span className="ntarget mono">{ns.hero.target}</span>
        </div>
        <div className="sparkbox"><Spark data={ns.hero.spark} w={150} h={30} hero /></div>
        <div className="nnote">{ns.hero.note}</div>
      </div>
      {ns.drivers.map((d) => (
        <div key={d.label} className="ntile drv">
          <div className="nlabel">{d.label}</div>
          <div className="nvals">
            <span className="nnow mono">{d.now}</span>
            <span className="narrow">→</span>
            <span className="ntarget mono">{d.target}</span>
          </div>
          <div className="sparkbox"><Spark data={d.spark} /></div>
          <div className="driver">
            Driven by: {d.driven.map((x, i) => <span key={x}>{i > 0 && <span className="sep">·</span>}{x}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
};

const Arc = ({ onJump }) => {
  const ps = new Date(DATA.arc.start), pe = new Date(DATA.arc.end);
  const span = pe - ps;
  const pct = (d) => ((new Date(d) - ps) / span) * 100;
  const np = Math.min(100, Math.max(0, pct(new Date())));
  const quarters = [
    ["Q4 '25", "2025-10-01"], ["Q1 '26", "2026-01-01"], ["Q2 '26", "2026-04-01"],
    ["Q3 '26", "2026-07-01"], ["Q4 '26", "2026-10-01"], ["Q1 '27", "2027-01-01"],
    ["Q2 '27", "2027-04-01"], ["Q3 '27", "2027-07-01"], ["Q4 '27", "2027-10-01"],
  ];
  const cls = (s) => (s === "complete" ? "done" : s === "in-progress" ? "live" : "next");
  const wl = pct(DATA.window.start), ww = pct(DATA.window.end) - wl;
  return (
    <div>
      <div className="arc-scroll"><div className="arc-inner">
        <div className="qrow">{quarters.map(([l, d]) => <span key={l} style={{ left: `${pct(d)}%` }}>{l}</span>)}</div>
        <div className="arc-track">
          <div className="arc-window" style={{ left: `${wl}%`, width: `${ww}%` }}><span className="wl">{DATA.window.label}</span></div>
          <div className="arc-today" style={{ left: `${np}%` }}><span>Today</span></div>
          <div className="arc-rows">
            {DATA.initiatives.map((init) => {
              const il = pct(init.timeframe.start), iw = pct(init.timeframe.end) - il;
              const iS = new Date(init.timeframe.start), iE = new Date(init.timeframe.end);
              return (
                <div key={init.id} className="arc-row">
                  <div style={{ width: `${il}%`, flexShrink: 0 }} />
                  <div className={`ibar ${cls(init.status)}`} style={{ width: `${iw}%` }}
                    onClick={() => onJump && onJump(init.id)} role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && onJump && onJump(init.id)}>
                    <div className="ihead"><span className="ino">{init.code}</span><span className="inm">{init.name}</span></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {init.projects.map((p) => {
                        const rl = Math.max(0, ((new Date(p.start) - iS) / (iE - iS)) * 100);
                        const rw = Math.max(22, Math.min(100 - rl, ((new Date(p.end) - new Date(p.start)) / (iE - iS)) * 100));
                        return (
                          <div key={p.code} className="pbar" style={{ marginLeft: `${rl}%`, width: `${rw}%` }}>
                            <span className="pc">{p.code}</span><span className="pn">{p.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="arc-key">
          <span><i className="k-done" />Complete</span>
          <span><i className="k-live" />In progress</span>
          <span><i className="k-next" />Upcoming</span>
          <span><i className="k-win" />Rolling window · refreshed quarterly</span>
        </div>
      </div></div>
    </div>
  );
};

/* ─── VIEWS ──────────────────────────────────────────────────────────────── */
const Pulse = ({ go }) => (
  <div>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <h1 className="h-page">The pulse</h1>
        <p className="lede">Where the program stands right now: the numbers that matter, what needs you, and what lands next. Refreshed as the work moves.</p>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
        <span className="pill black">{DATA.program.quarter} · {DATA.program.week}</span>
        <Chip status="on-track" />
      </div>
    </div>

    <div className="sect"><NorthStarRow /></div>

    <div className="sect grid2">
      <div className="card">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="lbl">Needs you · {DATA.needsYou.length}</span>
          <span className="lbl" style={{ color: "var(--dot)" }}>Client actions</span>
        </div>
        {DATA.needsYou.map((t) => (
          <div key={t.title} className="task">
            <span className="tk" />
            <div style={{ minWidth: 0 }}>
              <div className="tt">{t.title}</div>
              <div className="td">{t.detail}</div>
            </div>
            <span className="due mono">by {t.due}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="card" style={{ marginBottom: 14 }}>
          <span className="lbl" style={{ display: "block", marginBottom: 10 }}>Up next</span>
          {DATA.upNext.map((u) => (
            <div key={u.text} className="up">
              <span className="ud mono">{u.date}</span>
              <span className="ut">{u.text}</span>
              <span className="ul mono">{u.lane}</span>
            </div>
          ))}
        </div>
        <div>
          {DATA.flags.map((f) => (
            <div key={f.text} className="flag"><span className="fl">{f.label}</span>{f.text}</div>
          ))}
        </div>
      </div>
    </div>

    <div className="sect grid2">
      <div className="card">
        <span className="lbl" style={{ display: "block", marginBottom: 8 }}>Recent activity</span>
        {DATA.activity.map((a) => (
          <div key={a.entry} className="act"><span className="ad mono">{a.date}</span><span className="ae">{a.entry}</span></div>
        ))}
        <span onClick={() => go("decisions")} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && go("decisions")}
          style={{ display: "inline-block", marginTop: 12, fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--green)", borderBottom: "1px solid var(--lgreen-line)", cursor: "pointer" }}>
          Full decision log →
        </span>
      </div>
      <div className="gate" style={{ alignSelf: "start" }}>
        <div className="g">Next gate · Phase 1 → 2</div>
        <p>{DATA.gates[0].text}</p>
        <span onClick={() => go("roadmap")} role="button" tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && go("roadmap")}
          style={{ display: "inline-block", marginTop: 9, fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, color: "var(--green)", borderBottom: "1px solid var(--lgreen-line)", cursor: "pointer" }}>
          See it on the roadmap →
        </span>
      </div>
    </div>
  </div>
);

const InitiativeCard = ({ init, forcedOpen }) => {
  const [open, setOpen] = useState(init.status === "in-progress");
  const isOpen = forcedOpen || open;
  return (
    <div className={`init ${init.status === "complete" ? "is-done" : ""}`} id={init.id}>
      <div className="ihd" onClick={() => setOpen(!isOpen)} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(!isOpen)}>
        <span className="isq">{init.code}</span>
        <div style={{ minWidth: 0 }}>
          <h3>{init.name}</h3>
          <div className="idesc">{init.desc}</div>
        </div>
        <div className="imeta">
          <span className="itf mono">{init.timeframe.label}</span>
          <Chip status={init.status} />
          <span className={`caret mono ${isOpen ? "open" : ""}`}>▾</span>
        </div>
      </div>
      {isOpen && (
        <div className="ibody">
          <div className="why"><span className="wl">Why</span><p>{init.why}</p></div>
          <div className="bench" style={{ marginBottom: 12 }}>
            <h5>Success looks like</h5>
            <div className="bgrid">
              {init.bench.map((b) => <div key={b.l}><div className="l">{b.l}</div><div className="v mono">{b.v}</div></div>)}
            </div>
          </div>
          {init.projects.map((p) => (
            <div key={p.code} className="proj">
              <span className="pcode mono">{p.code}</span>
              <span className="pname">{p.name}</span>
              {p.tags.map((t) => <TagPill key={t} tag={t} />)}
              <span className="ptf mono">{p.tf}</span>
              <Chip status={p.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Roadmap = () => {
  const [jump, setJump] = useState(null);
  return (
    <div>
      <h1 className="h-page">{DATA.program.headline[0]} {DATA.program.headline[1]}</h1>
      <p className="lede">{DATA.program.thesis} What sits inside the rolling window is committed; what sits beyond it is directional and firms up at each quarterly review.</p>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 12 }}>The arc · {DATA.program.timeframe}</span>
        <Arc onJump={(id) => setJump(id)} />
      </div>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Why channels launch in this order</span>
        <div className="card">
          <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 16, maxWidth: "80ch", lineHeight: 1.5 }}>{DATA.ramp.sub}</p>
          {DATA.ramp.rows.map((r, i) => (
            <div key={r.label} className={`lrow r${i + 1}`}>
              <div className="ll">{r.label}<span>{r.sub}</span></div>
              <div className="ltrack"><div className="lfill" style={{ width: `${r.width}%` }}>{r.val}</div></div>
              <div className="lwhen mono">{r.when}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Initiatives & gates</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DATA.initiatives.map((init) => (
            <div key={init.id}>
              <InitiativeCard init={init} forcedOpen={jump === init.id} />
              {DATA.gates.find((g) => g.after === init.id) && (
                <div className="gate" style={{ marginTop: 12 }}>
                  <div className="g">{DATA.gates.find((g) => g.after === init.id).label}</div>
                  <p>{DATA.gates.find((g) => g.after === init.id).text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Quarter = () => {
  const q = DATA.quarter;
  return (
    <div>
      <div className="mhead">
        <span className="mno mono">{q.code}</span>
        <span className="mname">{q.name}</span>
        <span className="mdates mono">{q.dates}</span>
      </div>
      <p className="lede" style={{ marginTop: 12 }}>{q.focus}</p>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 4 }}>Where the work goes</span>
        <div className="card" style={{ paddingTop: 14, paddingBottom: 12 }}>
          {q.priorities.map((w) => (
            <div key={w.title} className="ws">
              <span className="pri">{w.pri}</span>
              <div className="wt">{w.title}</div>
              <div className="scope">{w.scope}</div>
              <div className="whyl"><span className="lb">Why</span>{w.why}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sect">
        <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Delivery cadence</span>
        <div className="card">
          <div className="matrix-wrap">
            <table className="matrix">
              <thead><tr>
                <th>Lane</th><th className="c">July</th><th className="c">August</th><th className="c">September</th><th className="c" style={{ color: "var(--dot)" }}>Continuing</th>
              </tr></thead>
              <tbody>
                {q.matrix.lanes.map((l) => (
                  <tr key={l.name}>
                    <td className="sector">{l.name}<span>{l.sub}</span></td>
                    {l.cells.map((c, i) => (
                      <td key={i}><div className={`cell ${c.k}`}><div className="v">{c.v}</div><div className="s">{c.s}</div></div></td>
                    ))}
                    <td><div className={`cell ${l.cont.k}`}><div className="v">{l.cont.v}</div><div className="s">{l.cont.s}</div></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="sect">
        <div className="bench">
          <h5>Benchmarks · Q3 exit · the quarter is won here</h5>
          <div className="bgrid">
            {q.bench.map((b) => <div key={b.l}><div className="l">{b.l}</div><div className="v mono">{b.v}</div></div>)}
          </div>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, lineHeight: 1.55, maxWidth: "84ch" }}>
          The monthly plan under this quarter lives in ClickUp with the shared dashboard: tasks, owners, dates, and deliverables. This view stays at the level a founder should be flying at.
        </p>
      </div>
    </div>
  );
};

const Scorecard = () => (
  <div>
    <h1 className="h-page">Scorecard</h1>
    <p className="lede">The full metric tree behind the north star. Today these values update at the monthly review; the sources marked below wire in live as each channel launches, and threshold breaches raise flags on the pulse automatically.</p>
    <div className="sect card" style={{ paddingTop: 12 }}>
      <div className="sc-wrap">
        <table className="sc">
          <thead><tr>
            <th style={{ width: "24%" }}>Metric</th><th>Now</th><th>Target</th><th>Trend</th><th>Status</th><th>Source</th>
          </tr></thead>
          <tbody>
            {DATA.scorecard.map((g) => (
              [
                <tr key={g.group} className="grp"><td colSpan={6}>{g.group}</td></tr>,
                ...g.rows.map((r) => {
                  const src = DATA.sources[r.src];
                  return (
                    <tr key={r.m}>
                      <td className="m">{r.m}{r.warn && <WarnTri title={r.warn} />}</td>
                      <td className="num">{r.now}</td>
                      <td className="tgt">{r.target}</td>
                      <td><Spark data={r.spark} w={92} h={24} /></td>
                      <td><Chip status={r.status} /></td>
                      <td>
                        <span className="pill src">
                          {src.live === null ? null : <span className={src.live ? "dot-live" : "dot-soon"} />}
                          {src.label}{src.live === false ? " · wiring" : ""}
                        </span>
                      </td>
                    </tr>
                  );
                }),
              ]
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 14, lineHeight: 1.55, maxWidth: "84ch" }}>
      Trend lines shown are illustrative until sources go live. Amber dot: connector planned (Shopify, GA4, Klaviyo now; Amazon Seller Central and TikTok Shop as those channels launch). Manual metrics stay manual by design; founder hours are self-reported at the monthly review.
    </p>
  </div>
);

const Decisions = () => (
  <div>
    <h1 className="h-page">Decisions</h1>
    <p className="lede">The program's memory: every meaningful call, when it was made, and the reasoning behind it. Six months from now, "why are we doing it this way?" gets answered here instead of re-litigated.</p>

    <div className="sect">
      <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Open · needs a call</span>
      {DATA.flags.map((f) => (
        <div key={f.text} className="flag"><span className="fl">{f.label}</span>{f.text}</div>
      ))}
    </div>

    <div className="sect">
      <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Standing gates</span>
      {DATA.gates.map((g) => (
        <div key={g.label} className="gate"><div className="g">{g.label}</div><p>{g.text}</p></div>
      ))}
    </div>

    <div className="sect">
      <span className="lbl" style={{ display: "block", marginBottom: 12 }}>Decision log</span>
      {DATA.decisions.map((d) => (
        <div key={d.title} className="dec">
          <div className="dh">
            <span className="dd mono">{d.date}</span>
            <span className="dt">{d.title}</span>
            <span className={`pill ${d.status === "active" ? "up" : "done"}`} style={{ marginLeft: "auto" }}>{d.status}</span>
          </div>
          <div className="db">{d.body}</div>
        </div>
      ))}
    </div>

    <div className="sect dep">
      <div className="t">Beyond this program</div>
      <h3>What the foundation makes possible</h3>
      <p>Influencer and affiliate programs once revenue supports creator partnerships, paid scaled on proven creative, Amazon expansion, Whole Foods LEAP and regional retail with multi-channel data behind the pitch, a seasonal flavor drop cadence, and community built around the mental health mission. Each lands harder because of what this roadmap builds first.</p>
    </div>
  </div>
);

/* ─── SHELL ──────────────────────────────────────────────────────────────── */
const NAV = [
  { id: "pulse", k: "01", label: "Pulse" },
  { id: "roadmap", k: "02", label: "Roadmap" },
  { id: "quarter", k: "03", label: "This quarter" },
  { id: "scorecard", k: "04", label: "Scorecard" },
  { id: "decisions", k: "05", label: "Decisions" },
];
const TITLES = { pulse: "Pulse", roadmap: "Roadmap", quarter: "This quarter", scorecard: "Scorecard", decisions: "Decisions" };

export default function FonderHQ() {
  const [view, setView] = useState("pulse");
  return (
    <div className="hq">
      <style>{CSS}</style>

      <aside className="side">
        <div className="brand">
          <div className="logo">FONDER · HQ</div>
          <div className="cl">
            <span className="csq mono">G</span>
            <div>
              <div className="cn">{DATA.client.name}</div>
              <div className="cs">{DATA.client.sub}</div>
            </div>
          </div>
        </div>
        <nav>
          <div className="nav-lbl">Growth engine</div>
          {NAV.map((n) => (
            <button key={n.id} className={`ni ${view === n.id ? "on" : ""}`} onClick={() => setView(n.id)}>
              <span className="k mono">{n.k}</span>{n.label}
              {n.id === "pulse" && <span className="badge mono">{DATA.needsYou.length}</span>}
            </button>
          ))}
          <div className="nav-lbl" style={{ marginTop: 8 }}>Workspace</div>
          <button className="ni" style={{ cursor: "default", opacity: 0.4 }}>
            <span className="k mono">→</span>Monthly ops · ClickUp
          </button>
          <button className="ni" style={{ cursor: "default", opacity: 0.4 }}>
            <span className="k mono">→</span>Brand library
          </button>
        </nav>
        <div className="sfoot">
          <div>Program <b>{DATA.program.timeframe}</b></div>
          <div>Updated <b>{DATA.program.updated}</b></div>
          <div>Next review <b>{DATA.program.nextReview}</b></div>
        </div>
      </aside>

      <div className="main">
        <div className="top">
          <span className="vt">{TITLES[view]}</span>
          <div className="ask" role="button" tabIndex={0} aria-label="Ask the brand brain">
            <span className="mono" style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>✳</span>
            Ask the brand brain: why is this quarter about conversion?
            <span className="kb mono">⌘K</span>
          </div>
          <div className="ctx">
            <span className="qchip mono">{DATA.program.quarter} · {DATA.program.week}</span>
          </div>
        </div>
        <div className="content">
          {view === "pulse" && <Pulse go={setView} />}
          {view === "roadmap" && <Roadmap />}
          {view === "quarter" && <Quarter />}
          {view === "scorecard" && <Scorecard />}
          {view === "decisions" && <Decisions />}
        </div>
      </div>
    </div>
  );
}
