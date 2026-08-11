import { redirect } from "next/navigation";
import { getCurrentProfile, getAccessibleClients } from "@/lib/get-program-data";
import { listSources } from "@/lib/source-actions";
import AdminSources from "@/components/AdminSources";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage({ searchParams }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/");

  const { client: requestedClientId } = await searchParams;
  const clients = await getAccessibleClients();
  const clientId = requestedClientId || clients?.[0]?.id;

  const sources = await listSources(clientId);

  return <AdminSources sources={sources} clients={clients} selectedClientId={clientId} />;
}
