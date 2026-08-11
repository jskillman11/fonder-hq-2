"use server";

import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

async function requireAdmin(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Admin access required.");
  return user;
}

// Reading auth.users (for email) requires the admin API — everything else
// here runs on the session-bound client under normal RLS.
export async function listUsers() {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, role, client_id, created_at, clients(name)")
    .order("created_at");
  if (error) throw new Error(error.message);

  const admin = createAdminClient();
  const { data: authList, error: authError } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (authError) throw new Error(authError.message);
  const emailById = Object.fromEntries(authList.users.map((u) => [u.id, u.email]));

  return profiles.map((p) => ({
    id: p.id,
    email: emailById[p.id] ?? "(unknown)",
    role: p.role,
    clientId: p.client_id,
    clientName: p.clients?.name ?? null,
    createdAt: p.created_at,
  }));
}

// Creates the auth account (sends a real sign-in email) and the matching
// profiles row. Requires SUPABASE_SERVICE_ROLE_KEY to be set wherever this
// runs — see lib/supabase/admin.js.
export async function inviteUser({ email, role, clientId }) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  if (!email) throw new Error("Email is required.");
  if (!["admin", "client"].includes(role)) throw new Error(`Role must be "admin" or "client".`);
  if (role === "client" && !clientId) throw new Error("A client must be selected for a client-role user.");

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fonder-growth-hq.vercel.app";

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
  });
  if (error) throw new Error(error.message);

  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: data.user.id, role, client_id: role === "client" ? clientId : null });
  if (profileError) throw new Error(profileError.message);
}

// Role/client changes are plain table writes — already covered by the
// existing "admin update" RLS policy on profiles, no service-role needed.
export async function updateUserRoleAndClient({ userId, role, clientId }) {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);

  if (!["admin", "client"].includes(role)) throw new Error(`Role must be "admin" or "client".`);
  if (role === "client" && !clientId) throw new Error("A client must be selected for a client-role user.");
  if (userId === admin.id && role !== "admin") throw new Error("You can't demote your own account.");

  const { error } = await supabase
    .from("profiles")
    .update({ role, client_id: role === "client" ? clientId : null })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

// Removes access (deletes the profiles row) without touching the underlying
// auth account — the user can still sign in, they'll just land on "account
// not set up yet" until re-provisioned.
export async function revokeUser(userId) {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (userId === admin.id) throw new Error("You can't revoke your own access.");

  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  if (error) throw new Error(error.message);
}
