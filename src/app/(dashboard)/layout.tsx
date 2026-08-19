import * as React from "react";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Role } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const role: Role = user?.role || "MEMBER";
  const userName = user?.name || "Team Member";

  return (
    <AppShell userRole={role} userName={userName}>
      {children}
    </AppShell>
  );
}
