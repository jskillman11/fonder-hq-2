import { redirect } from "next/navigation";
import { getCurrentProfile, getAccessibleClients } from "@/lib/get-program-data";
import { listUsers } from "@/lib/user-actions";
import AdminUsers from "@/components/AdminUsers";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/");

  const [users, clients] = await Promise.all([listUsers(), getAccessibleClients()]);

  return <AdminUsers users={users} clients={clients} />;
}
