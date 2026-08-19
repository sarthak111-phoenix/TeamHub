import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Role } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  userRole?: Role;
  userName?: string;
}

export function AppShell({ children, userRole = "MEMBER", userName }: AppShellProps) {
  return (
    <div className="min-h-[100dvh] bg-dark-bg text-gray-100 flex flex-col">
      <Sidebar userRole={userRole} />
      <div className="lg:pl-64 flex flex-col flex-1">
        <Header userRole={userRole} userName={userName} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
