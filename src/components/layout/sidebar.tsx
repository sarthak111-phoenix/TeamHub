"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  Activity,
  History,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { Role } from "@/types";
import { Logo } from "@/components/ui/logo";

interface SidebarProps {
  userRole?: Role;
}

export function Sidebar({ userRole = "MEMBER" }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Team", href: "/team", icon: Users },
    { label: "Activity", href: "/activity", icon: Activity },
    { label: "Completed Work", href: "/history", icon: History },
  ];

  if (userRole === "ADMIN") {
    navItems.push({ label: "Admin Hub", href: "/admin", icon: ShieldCheck });
  }

  const toggleMobileMenu = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Mobile Menu Trigger */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full shadow-metallic-glow border border-amber-400/40"
        aria-label="Toggle Navigation"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          "fixed top-0 left-0 bottom-0 z-40 w-64 glass-metallic border-r border-dark-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center border-b border-dark-border/80">
          <Link href="/dashboard" className="block">
            <Logo size="sm" tagline="PHOENIX WORKSPACE" />
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-gray-400 hover:text-amber-200 hover:bg-dark-surface/60"
                )}
              >
                <Icon
                  className={clsx(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-amber-400" : "text-gray-400"
                  )}
                />
                <span>{item.label}</span>
                {item.href === "/admin" && (
                  <span className="ml-auto text-[10px] font-bold uppercase px-1.5 py-0.5 rounded metallic-badge-admin">
                    Admin
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-dark-border/80 text-xs text-gray-400 font-mono">
          <div className="flex items-center justify-between text-[11px]">
            <span>ROLE:</span>
            <span className="text-amber-400 font-bold">
              {userRole}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
