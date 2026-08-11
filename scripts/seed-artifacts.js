// Seeds a client's Artifacts tab content. Rerunnable — upserts on
// (client_id, title) so editing an artifact here and re-running just
// updates it in place rather than duplicating.
//
// Usage: node scripts/seed-artifacts.js "Client Name"

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const GOZO_ARTIFACTS = [
  {
    title: "Channel Strategy",
    content: `# Channel Strategy

TikTok Shop ahead of Meta: it runs on its own native checkout, so it doesn't need the site to be fully built the way paid traffic landing on-site does. It's commission-based rather than upfront spend, and it fits a Gen Z snack impulse-buy category well. Most importantly, it generates real signal on what creative and messaging convert — paid performs better against proven creative than against a cold guess.

Amazon ahead of paid, but not free of spend: Amazon's own PPC (Sponsored Products) is a built-in cost of launching there, separate from the Meta/Google phase that's being deferred.

Paid media last, funded by what's already working: once DTC, TikTok Shop, and Amazon each show a real conversion baseline, spend scales as a share of the revenue those channels are generating — buying more of something proven, not hoping to discover what works.

## Illustrative channel stack

Not a forecast — just the logic behind the order.

| Channel | Monthly revenue | Timing |
| --- | --- | --- |
| Wholesale | $8k | Live now |
| + DTC | $22k | Jul '26 |
| + TikTok Shop | $30k | Q4 '26 |
| + Amazon | $38k | Q1 '27 |
| + Paid amplification | $42k+ | Q2 '27 |

## Channel spend & budget plan

Ad spend reinvests as a share of revenue rather than sitting at a fixed number — the ramp shows how that plays out month by month as channels come online and prove themselves. Treat this as a planning scenario, not a forecast.

### Meta retargeting

**Starts when:** the Meta Pixel and product catalog are live and the site has built a 30-day retargeting pool of roughly 500–1,000+ visitors.

**Budget:** start around $300–500/month ($10–15/day). Increase in ~$150–200 steps only if ROAS holds above roughly 4x.

### Amazon PPC (Sponsored Products)

**Starts when:** day one of the Amazon launch — not optional, needed to build initial sales velocity and organic rank.

**Budget:** ~$5,000/month for the first 90 days, with a deliberately loose target ACOS (30–40%+) — the goal early on is visibility and review velocity, not margin. Taper and tighten toward ~15–20% ACOS after ~90 days.

### Paid media — Meta & Google prospecting

**Starts when:** DTC conversion holds at 2%+, TikTok Shop has real organic sales data, and Amazon is live.

**Budget:** total paid media (retargeting + Amazon PPC + prospecting) scales toward ~25% of trailing monthly revenue as each channel proves out. Scale only while blended CAC stays at or below AOV × gross margin.

### TikTok Shop / creator specialist (staffing, not ad spend)

A dedicated contractor, not folded into Kaitlyn's in-house social role. Budget: $3,500–5,500/month.

### Influencer / affiliate seeding (client-owned budget)

Product seeding to a small initial roster of 10–20 creators, shifting to commission-based affiliate deals (typical TikTok Shop CPG commission 15–25%) as specific creators prove ROI. Kaitlyn's budget, separate from the contractor's fee.
`,
  },
  {
    title: "Growth Assumptions & Research",
    content: `# Growth Assumptions & Research

The Jul '26 roadmap recalibration (AOV, subscription target, ad spend levels, Amazon budget) was informed by industry benchmarking, not guesswork. This is the reasoning trail, kept here so it doesn't get lost.

## Ad spend as a share of revenue

For DTC brands under $1M in annual revenue, typical ad spend runs 20–35% of revenue, with 40%+ correlating with unprofitability industry-wide. This is what set the ~25% reinvestment ceiling once all channels are proven.

## DTC snack/CPG customer acquisition cost

Multiple independent benchmarks converge on $40–55 CAC for snack/food & beverage DTC brands — meaningfully higher than the original $25 AOV target could comfortably absorb. Raising AOV to $40+ (via bundling multiple boxes) was the fix, not cutting CAC targets that aren't really under our control yet.

## TikTok Shop — real, but power-law

Case studies exist of brands moving fast this way (a comparable pet-treat brand went from $0 to $380K/month GMV in 5 months), but every one had a dedicated, often full-time, creator-relations hire — not a shared duty layered onto an existing role. The blunter data point: only 1.6% of TikTok Shop affiliates ever drive over $1,000 in GMV, and 58% of recruited creators churn within 90 days. This is why a dedicated contractor is budgeted, not optional.

## Amazon FBA launch economics

A realistically competitive new-listing launch runs $8–15K total across the first 90 days (inventory, photography, and PPC combined); sub-$5K launches are explicitly flagged as running at a "significant competitive disadvantage" against established players like Kind and Clif. The Amazon PPC budget was raised from an original $1,500–2,500/month to ~$5,000/month on this basis.

## Subscription economics

Snack is the lowest-converting DTC subscription category industry-wide (38% conversion, vs. 50%+ for coffee), and even category leaders (Chewy, BARK) needed years of being subscription-native from day one to reach 80%+ subscription mix. This is why the target came down from an original 60% to 30–35% — still a real lever, just not the load-bearing one.

## AOV benchmarks

General DTC food & beverage AOV runs $45–65. Gozo's original $25 target was on the low end even before accounting for the CAC math above; $40–45 (via bundling) is both more realistic for the category and structurally necessary for the unit economics to work.
`,
  },
];

function must(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

async function main() {
  const clientName = process.argv[2];
  if (!clientName) throw new Error("usage: node scripts/seed-artifacts.js \"Client Name\"");

  const client = must(await supabase.from("clients").select("id").eq("name", clientName).single(), "client lookup");

  // No unique constraint on (client_id, title) — delete-then-insert per
  // title instead of upsert, so reruns update in place without duplicating.
  for (let i = 0; i < GOZO_ARTIFACTS.length; i++) {
    const a = GOZO_ARTIFACTS[i];
    await supabase.from("artifacts").delete().eq("client_id", client.id).eq("title", a.title);
    must(
      await supabase.from("artifacts").insert({ client_id: client.id, title: a.title, content: a.content, sort_order: i }),
      `artifact "${a.title}"`
    );
  }

  console.log(`Seeded ${GOZO_ARTIFACTS.length} artifact(s) for "${clientName}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
