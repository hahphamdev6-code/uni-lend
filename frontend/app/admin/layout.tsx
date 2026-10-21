import type { ReactNode } from "react";
import { AdminToastProvider } from "../../components/admin-toast";
import { RoleGuard } from "../../components/role-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AdminToastProvider>{children}</AdminToastProvider>
    </RoleGuard>
  );
}
