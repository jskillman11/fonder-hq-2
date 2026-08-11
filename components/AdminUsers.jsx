"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteUser, updateUserRoleAndClient, revokeUser } from "@/lib/user-actions";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Asta+Sans:wght@400..700&family=Geist+Mono:wght@400..700&family=Inter+Tight:wght@400..700&display=swap');
.au{
  --paper:#F2F1EC; --card:#FBFAF7; --ink:#181A1E; --muted:#6C6F76; --line:#DED9CF; --line2:#EAE6DD;
  --green:#008031; --lgreen:#F3FDBF; --lgreen-line:#CDEB9A; --red:#F23400;
  --sans:'Asta Sans','Inter Tight',ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
  --mono:'Geist Mono',ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
  min-height:100vh; background:var(--paper); color:var(--ink); font-family:var(--sans); line-height:1.5;
}
.au *{box-sizing:border-box}
.au .wrap{max-width:840px;margin:0 auto;padding:40px 24px 80px}
.au .back{font-family:var(--mono);font-size:11.5px;color:var(--muted);text-decoration:none;cursor:pointer;background:none;border:none;padding:0}
.au .back:hover{color:var(--ink)}
.au h1{font-size:22px;font-weight:700;letter-spacing:-.02em;margin:14px 0 4px}
.au .sub{font-size:13px;color:var(--muted);margin-bottom:28px}
.au .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:22px}
.au .card + .card{margin-top:20px}
.au h2{font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-bottom:16px}
.au table{width:100%;border-collapse:collapse;font-size:13px}
.au th{text-align:left;font-family:var(--mono);font-size:10.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);padding:8px 10px;border-bottom:1px solid var(--line)}
.au td{padding:9px 10px;border-bottom:1px solid var(--line2);vertical-align:middle}
.au select, .au input{font-family:var(--sans);font-size:12.5px;border:1px solid var(--line);border-radius:7px;padding:6px 9px;background:#fff;color:var(--ink)}
.au .pill{display:inline-flex;align-items:center;font-family:var(--mono);font-size:10px;font-weight:600;padding:2.5px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.03em}
.au .pill.admin{background:var(--ink);color:#fff}
.au .pill.client{background:transparent;color:var(--muted);border:1px solid var(--line)}
.au button.btn{font-family:var(--sans);font-size:12.5px;font-weight:600;border-radius:8px;padding:7px 13px;cursor:pointer;border:none}
.au button.btn.primary{background:var(--ink);color:#fff}
.au button.btn.primary:disabled{opacity:.5;cursor:default}
.au button.btn.ghost{background:transparent;color:var(--red);border:1px solid var(--line)}
.au button.btn.small{padding:4px 9px;font-size:11.5px}
.au .row-actions{display:flex;gap:8px;align-items:center}
.au .invite-form{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap}
.au .field{display:flex;flex-direction:column;gap:5px}
.au .field label{font-size:11px;color:var(--muted)}
.au .err{color:var(--red);font-size:12.5px;margin-top:10px}
`;

export default function AdminUsers({ users: initialUsers, clients }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [clientId, setClientId] = useState(clients?.[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleInvite(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await inviteUser({ email, role, clientId: role === "client" ? clientId : null });
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setError("");
    try {
      await updateUserRoleAndClient({ userId, role: newRole, clientId: newRole === "client" ? clients?.[0]?.id : null });
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleClientChange(userId, newClientId) {
    setError("");
    try {
      await updateUserRoleAndClient({ userId, role: "client", clientId: newClientId });
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRevoke(userId, userEmail) {
    if (!confirm(`Revoke access for ${userEmail}? They'll be able to sign in but won't see any client data until re-provisioned.`)) return;
    setError("");
    try {
      await revokeUser(userId);
      setUsers((u) => u.filter((x) => x.id !== userId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="au">
      <style>{CSS}</style>
      <div className="wrap">
        <button className="back" onClick={() => router.push("/")}>&larr; Back to dashboard</button>
        <h1>Manage users</h1>
        <p className="sub">Invite admins and clients, change roles, or revoke access. Admin-only.</p>

        <div className="card">
          <h2>Invite a user</h2>
          <form className="invite-form" onSubmit={handleInvite}>
            <div className="field">
              <label htmlFor="inv-email">Email</label>
              <input id="inv-email" type="email" required placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: 220 }} />
            </div>
            <div className="field">
              <label htmlFor="inv-role">Role</label>
              <select id="inv-role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
              </select>
            </div>
            {role === "client" && (
              <div className="field">
                <label htmlFor="inv-client">Client</label>
                <select id="inv-client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  {clients?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="btn primary" disabled={busy}>{busy ? "Sending…" : "Send invite"}</button>
          </form>
          {error && <p className="err">{error}</p>}
        </div>

        <div className="card">
          <h2>Users ({users.length})</h2>
          <table>
            <thead>
              <tr><th>Email</th><th>Role</th><th>Client</th><th>Invited</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                      <option value="admin">Admin</option>
                      <option value="client">Client</option>
                    </select>
                  </td>
                  <td>
                    {u.role === "client" ? (
                      <select value={u.clientId ?? ""} onChange={(e) => handleClientChange(u.id, e.target.value)}>
                        {clients?.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>&mdash;</span>
                    )}
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn ghost small" onClick={() => handleRevoke(u.id, u.email)}>Revoke</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
