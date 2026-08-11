"use server";

import { createClient } from "./supabase/server";

// The "designated text fields" from the brief — the only (table, column)
// pairs inline editing is allowed to touch. Anything not listed here is
// rejected even if a request somehow reaches this module.
const ALLOWED_FIELDS = {
  programs: ["thesis"],
  initiatives: ["why", "description"],
  quarters: ["focus"],
  priorities: ["title", "scope", "why"],
  decisions: ["title", "body"],
  action_items: ["title", "body"],
  metrics: ["now_value"],
};

function assertAllowed(table, field) {
  if (!ALLOWED_FIELDS[table]?.includes(field)) {
    throw new Error(`Editing ${table}.${field} is not allowed.`);
  }
}

async function requireAdmin(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Admin access required.");
  return user;
}

// Creates or updates the single pending draft for a field. old_value is
// always read fresh from the live table — never trusted from the caller,
// since the caller's "current" value may already be showing a draft.
export async function saveDraftEdit({ programId, table, recordId, field, newValue, label }) {
  assertAllowed(table, field);
  const supabase = await createClient();
  const user = await requireAdmin(supabase);

  const { data: existingDraft, error: existingError } = await supabase
    .from("change_log")
    .select("id")
    .eq("table_name", table)
    .eq("record_id", recordId)
    .eq("field_name", field)
    .eq("status", "draft")
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  if (existingDraft) {
    const { error } = await supabase
      .from("change_log")
      .update({ new_value: newValue, label, changed_by: user.id })
      .eq("id", existingDraft.id);
    if (error) throw new Error(error.message);
    return { id: existingDraft.id, newValue };
  }

  const { data: liveRow, error: liveError } = await supabase.from(table).select(field).eq("id", recordId).single();
  if (liveError) throw new Error(liveError.message);

  const { data: inserted, error: insertError } = await supabase
    .from("change_log")
    .insert({
      program_id: programId,
      table_name: table,
      record_id: recordId,
      field_name: field,
      old_value: liveRow[field],
      new_value: newValue,
      label,
      changed_by: user.id,
      status: "draft",
    })
    .select("id")
    .single();
  if (insertError) throw new Error(insertError.message);
  return { id: inserted.id, newValue };
}

export async function publishDraft(draftId) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { data: draft, error } = await supabase
    .from("change_log")
    .select("*")
    .eq("id", draftId)
    .eq("status", "draft")
    .single();
  if (error) throw new Error(error.message);
  assertAllowed(draft.table_name, draft.field_name);

  const { error: updateError } = await supabase
    .from(draft.table_name)
    .update({ [draft.field_name]: draft.new_value })
    .eq("id", draft.record_id);
  if (updateError) throw new Error(updateError.message);

  const { error: publishError } = await supabase
    .from("change_log")
    .update({ status: "published" })
    .eq("id", draftId);
  if (publishError) throw new Error(publishError.message);
}

export async function publishAllDrafts(programId) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const { data: drafts, error } = await supabase
    .from("change_log")
    .select("id")
    .eq("program_id", programId)
    .eq("status", "draft");
  if (error) throw new Error(error.message);
  for (const d of drafts ?? []) {
    await publishDraft(d.id);
  }
}

export async function discardDraft(draftId) {
  const supabase = await createClient();
  await requireAdmin(supabase);
  const { error } = await supabase.from("change_log").delete().eq("id", draftId).eq("status", "draft");
  if (error) throw new Error(error.message);
}

// Safe for any role — RLS already limits change_log to admin, so a
// client-role caller simply gets an empty array, not an error.
export async function getPendingDrafts(programId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("change_log")
    .select("*")
    .eq("program_id", programId)
    .eq("status", "draft")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}
