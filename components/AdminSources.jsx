"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleSourceLive, connectShopify, disconnectShopify, syncShopifyNow } from "@/lib/source-actions";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Asta+Sans:wght@400..700&family=Geist+Mono:wght@400..700&family=Inter+Tight:wght@400..700&display=swap');
.au{
  --paper:#F2F1EC; --card:#FBFAF7; --ink:#181A1E; --muted:#6C6F76; --line:#DED9CF; --line2:#EAE6DD;
  --green:#008031; --lgreen:#F3FDBF; --lgreen-line:#CDEB9A; --amber:#E0A800; --amber-bg:#FBF3D6; --amber-line:#EAD489;
  --sans:'Asta Sans','Inter Tight',ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
  --mono:'Geist Mono',ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
  min-height:100vh; background:var(--paper); color:var(--ink); font-family:var(--sans); line-height:1.5;
}
.au *{box-sizing:border-box}
.au .wrap{max-width:640px;margin:0 auto;padding:40px 24px 80px}
.au .back{font-family:var(--mono);font-size:11.5px;color:var(--muted);text-decoration:none;cursor:pointer;background:none;border:none;padding:0}
.au .back:hover{color:var(--ink)}
.au h1{font-size:22px;font-weight:700;letter-spacing:-.02em;margin:14px 0 4px}
.au .sub{font-size:13px;color:var(--muted);margin-bottom:28px}
.au .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 22px}
.au .row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--line2)}
.au .row:last-child{border-bottom:none}
.au .key{font-family:var(--mono);font-size:11px;color:var(--muted)}
.au .label{font-size:14px;font-weight:600;margin-top:2px}
.au .status{display:flex;align-items:center;gap:10px}
.au .pill{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:10.5px;font-weight:600;padding:3px 9px;border-radius:20px;text-transform:uppercase;letter-spacing:.03em}
.au .pill.live{background:var(--lgreen);color:var(--green);border:1px solid var(--lgreen-line)}
.au .pill.off{background:var(--amber-bg);color:#8A6300;border:1px solid var(--amber-line)}
.au .pill.na{background:transparent;color:var(--muted);border:1px dashed var(--line)}
.au button.toggle{font-family:var(--sans);font-size:12px;font-weight:600;border-radius:8px;padding:6px 12px;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink)}
.au button.toggle:disabled{opacity:.5;cursor:default}
.au select.client-picker{font-family:var(--sans);font-size:13px;border:1px solid var(--line);border-radius:8px;padding:7px 10px;background:#fff;color:var(--ink);margin-bottom:20px}
.au .shopify-row{flex-direction:column;align-items:stretch;gap:10px}
.au .shopify-row .top{display:flex;align-items:center;justify-content:space-between}
.au .conn{font-size:12px;color:var(--muted);display:flex;flex-direction:column;gap:2px}
.au .conn .domain{font-family:var(--mono);color:var(--ink)}
.au .pill.error{background:#FBE2DE;color:#B3261E;border:1px solid #F0B8AF}
.au .actions{display:flex;gap:8px}
.au .connect-form{display:flex;flex-direction:column;gap:8px;padding-top:4px;border-top:1px solid var(--line2);margin-top:4px}
.au .connect-form input{font-family:var(--mono);font-size:12px;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:#fff;color:var(--ink)}
.au .connect-form .hint{font-size:11.5px;color:var(--muted)}
`;

export default function AdminSources({ sources: initialSources, clients, selectedClientId }) {
  const router = useRouter();
  const [sources, setSources] = useState(initialSources);
  const [busyId, setBusyId] = useState(null);
  const [connectFormOpen, setConnectFormOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [syncMessage, setSyncMessage] = useState(null);

  async function handleToggle(id, nextLive) {
    setBusyId(id);
    try {
      await toggleSourceLive(id, nextLive);
      setSources((s) => s.map((src) => (src.id === id ? { ...src, live: nextLive } : src)));
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleConnect(sourceId, e) {
    e.preventDefault();
    setBusyId(sourceId);
    try {
      await connectShopify(selectedClientId, domain, token);
      setConnectFormOpen(false);
      setDomain("");
      setToken("");
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleSyncNow(sourceId) {
    setBusyId(sourceId);
    setSyncMessage(null);
    try {
      const result = await syncShopifyNow(selectedClientId);
      setSyncMessage(`Synced ${result.orderCount} order(s) just now.`);
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDisconnect(sourceId, domainLabel) {
    if (!confirm(`Disconnect ${domainLabel}? This deletes the stored access token — you'll need to reconnect with a new one to resume syncing.`)) return;
    setBusyId(sourceId);
    try {
      await disconnectShopify(selectedClientId);
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="au">
      <style>{CSS}</style>
      <div className="wrap">
        <button className="back" onClick={() => router.push("/")}>&larr; Back to dashboard</button>
        <h1>Data sources</h1>
        <p className="sub">Connection status for the integrations scorecard metrics pull from — isolated per client.</p>

        {clients?.length > 1 && (
          <select
            className="client-picker"
            value={selectedClientId}
            onChange={(e) => router.push(`/admin/sources?client=${e.target.value}`)}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

        <div className="card">
          {sources.map((s) => {
            const isManual = s.key === "manual";
            const isShopify = s.key === "shopify";

            if (isShopify) {
              const conn = s.connection;
              return (
                <div className="row shopify-row" key={s.id}>
                  <div className="top">
                    <div>
                      <div className="key">{s.key}</div>
                      <div className="label">{s.label}</div>
                    </div>
                    <div className="status">
                      {conn ? (
                        <span className={`pill ${conn.lastSyncStatus === "error" ? "error" : "live"}`}>
                          {conn.lastSyncStatus === "error" ? "Sync error" : "Live"}
                        </span>
                      ) : (
                        <span className="pill off">Not connected</span>
                      )}
                      {!conn && (
                        <button className="toggle" onClick={() => setConnectFormOpen((v) => !v)}>
                          {connectFormOpen ? "Cancel" : "Connect"}
                        </button>
                      )}
                    </div>
                  </div>

                  {conn && (
                    <div className="top">
                      <div className="conn">
                        <span className="domain">{conn.storeDomain}</span>
                        <span>
                          {conn.lastSyncedAt ? `Last synced ${conn.lastSyncedAt}` : "Never synced yet"}
                          {conn.lastSyncStatus === "error" && conn.lastSyncError ? ` — ${conn.lastSyncError}` : ""}
                        </span>
                        {syncMessage && <span>{syncMessage}</span>}
                      </div>
                      <div className="actions">
                        <button className="toggle" disabled={busyId === s.id} onClick={() => handleSyncNow(s.id)}>
                          {busyId === s.id ? "…" : "Sync now"}
                        </button>
                        <button
                          className="toggle"
                          disabled={busyId === s.id}
                          onClick={() => handleDisconnect(s.id, conn.storeDomain)}
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}

                  {!conn && connectFormOpen && (
                    <form className="connect-form" onSubmit={(e) => handleConnect(s.id, e)}>
                      <input
                        placeholder="store-name.myshopify.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        required
                      />
                      <input
                        type="password"
                        placeholder="Admin API access token (shpat_...)"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        required
                      />
                      <span className="hint">
                        Read-only custom app: Shopify admin → Settings → Apps → Develop apps → scopes
                        read_orders + read_customers.
                      </span>
                      <button className="toggle" type="submit" disabled={busyId === s.id}>
                        {busyId === s.id ? "Connecting…" : "Save & connect"}
                      </button>
                    </form>
                  )}
                </div>
              );
            }

            return (
              <div className="row" key={s.id}>
                <div>
                  <div className="key">{s.key}</div>
                  <div className="label">{s.label}</div>
                </div>
                <div className="status">
                  {isManual ? (
                    <span className="pill na">Always manual</span>
                  ) : (
                    <>
                      <span className={`pill ${s.live ? "live" : "off"}`}>{s.live ? "Live" : "Not connected"}</span>
                      <button
                        className="toggle"
                        disabled={busyId === s.id}
                        onClick={() => handleToggle(s.id, !s.live)}
                      >
                        {busyId === s.id ? "…" : s.live ? "Mark disconnected" : "Mark live"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
