import type { ReactNode } from "react";
import { AdminToastProvider } from "../../components/admin-toast";
import { RoleGuard } from "../../components/role-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // This guard improves UX only; every admin API must enforce ADMIN authorization server-side.
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AdminToastProvider>{children}</AdminToastProvider>
    </RoleGuard>
  );
}
