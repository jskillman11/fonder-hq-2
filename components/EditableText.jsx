"use client";

import { useContext, useState } from "react";
import { EditContext } from "./EditContext";
import { saveDraftEdit } from "@/lib/draft-actions";

// Renders plain text for non-admins (identical to the original prototype).
// For admins, click-to-edit; saving writes a draft (change_log status=
// 'draft') rather than the live table — nothing here touches published
// content until a later "publish" action.
export default function EditableText({ table, recordId, field, value, label, multiline = false }) {
  const { isAdmin, drafts, programId, onSaved } = useContext(EditContext);
  const key = `${table}:${recordId}:${field}`;
  const draft = drafts[key];

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [localOverride, setLocalOverride] = useState(null);

  // Drafts are unpublished by definition — never show one to a non-admin,
  // even if one happens to be present in context. Belt and suspenders with
  // the isAdmin-gated fetch in get-program-data.js.
  if (!isAdmin) {
    return <>{value}</>;
  }

  const displayValue = localOverride ?? (draft ? draft.value : value);

  if (editing) {
    const Field = multiline ? "textarea" : "input";
    return (
      <span className="editing-wrap">
        <Field
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={multiline ? 4 : undefined}
          autoFocus
        />
        <span className="editing-actions">
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await saveDraftEdit({ programId, table, recordId, field, newValue: text, label });
                setLocalOverride(text);
                setEditing(false);
                onSaved?.();
              } catch (err) {
                alert(err.message);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" disabled={saving} onClick={() => setEditing(false)}>
            Cancel
          </button>
        </span>
      </span>
    );
  }

  return (
    <span
      className={`editable${draft ? " has-draft" : ""}`}
      role="button"
      tabIndex={0}
      title="Click to edit"
      onClick={() => {
        setText(displayValue);
        setEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          setText(displayValue);
          setEditing(true);
        }
      }}
    >
      {displayValue}
      {draft && <span className="draft-dot" title="Unpublished edit" />}
    </span>
  );
}
