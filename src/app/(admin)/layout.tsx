import { getUserRole } from "@/lib/actions/role";
import AdminClientLayout from "./AdminClientLayout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const userRole = await getUserRole();
  return <AdminClientLayout userRole={userRole}>{children}</AdminClientLayout>;
}
