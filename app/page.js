import { redirect } from "next/navigation";
import FonderHQ from "@/components/FonderHQ";
import { getProgramData, getAccessibleClients, getCurrentProfile } from "@/lib/get-program-data";

// Content lives in the database and can change without a deploy (inline
// editing, Claude-drafted updates) — always read fresh on each request.
export const dynamic = "force-dynamic";

function NotProvisioned({ email }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F2F1EC",
        fontFamily: "'Asta Sans','Inter Tight',ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 380 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em" }}>Account not set up yet</h1>
        <p style={{ fontSize: 13.5, color: "#6C6F76", marginTop: 10, lineHeight: 1.5 }}>
          {email} signed in successfully, but no access has been set up for this account yet. Ask your Fonder contact
          to provision it.
        </p>
      </div>
    </div>
  );
}

export default async function Page({ searchParams }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.role) return <NotProvisioned email={profile.email} />;

  const { client: requestedClientId } = await searchParams;

  const clients = profile.role === "admin" ? await getAccessibleClients() : null;
  const clientId = profile.role === "admin" ? requestedClientId || clients?.[0]?.id : profile.client_id;

  const { data, drafts, draftsList, programId } = await getProgramData(clientId, profile.role === "admin");

  return (
    <FonderHQ
      data={data}
      drafts={drafts}
      draftsList={draftsList}
      programId={programId}
      profile={profile}
      clients={clients}
    />
  );
}
