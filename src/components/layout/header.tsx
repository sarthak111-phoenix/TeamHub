"use client";

import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import { Search, Shield, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { GlobalSearchModal } from "@/components/search/global-search-modal";
import { Role } from "@/types";

interface HeaderProps {
  userRole?: Role;
  userName?: string;
}

export function Header({ userRole = "MEMBER", userName = "Team Member" }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 glass-metallic border-b border-dark-border px-6 flex items-center justify-between">
        {/* Search trigger bar */}
        <div className="flex items-center gap-3 w-72">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative w-full cursor-pointer group"
          >
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-amber-400 transition-colors" />
            <input
              type="text"
              placeholder="Search tasks, projects, members... (Cmd+K)"
              readOnly
              className="w-full pl-9 pr-3 py-1.5 bg-dark-surface/80 text-xs text-gray-300 border border-dark-border rounded-lg cursor-pointer group-hover:border-amber-500/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <Badge roleValue={userRole} className="hidden sm:inline-flex">
            {userRole === "ADMIN" ? (
              <>
                <Shield className="w-3 h-3 text-amber-400" />
                <span>ADMIN ACCESS</span>
              </>
            ) : (
              <>
                <UserIcon className="w-3 h-3 text-orange-400" />
                <span>MEMBER ACCESS</span>
              </>
            )}
          </Badge>

          {/* Real Notification Center */}
          <NotificationCenter />

          {/* User menu */}
          <div className="flex items-center gap-3 pl-2 border-l border-dark-border">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-lg border border-amber-500/40 shadow-sm",
                },
              }}
            />
            <div className="hidden md:flex flex-col text-xs">
              <span className="font-semibold text-gray-200 leading-none">{userName}</span>
              <span className="text-[10px] text-amber-400/80 font-mono mt-0.5">{userRole}</span>
            </div>
          </div>
        </div>
      </header>

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
