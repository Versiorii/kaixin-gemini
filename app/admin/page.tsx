import { AdminApp } from "@/components/admin/admin-app";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";


export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }
  return <AdminApp />;
}
