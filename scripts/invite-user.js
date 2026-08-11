// Provisions a real user: creates their Supabase auth account (sending them
// an invite/sign-in email) and a matching profiles row. Unlike seed.js and
// seed-test-fixtures.js, this is for real teammates/clients, not fixtures.
//
// Usage: node scripts/invite-user.js <email> <admin|client> [clientName]

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fonder-growth-hq.vercel.app";
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const [, , email, role = "admin", clientName] = process.argv;

function must(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

async function main() {
  if (!email) throw new Error("usage: node scripts/invite-user.js <email> <admin|client> [clientName]");
  if (!["admin", "client"].includes(role)) throw new Error(`role must be "admin" or "client", got "${role}"`);

  let clientId = null;
  if (role === "client") {
    if (!clientName) throw new Error("client role requires a clientName argument");
    const client = must(await supabase.from("clients").select("id").eq("name", clientName).single(), "client lookup");
    clientId = client.id;
  }

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
  });
  if (error) throw new Error(`invite ${email}: ${error.message}`);

  await supabase.from("profiles").insert({ id: data.user.id, role, client_id: clientId });

  console.log(`Invited ${email} as ${role}${clientName ? ` (${clientName})` : ""}. They'll receive a sign-in email.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
