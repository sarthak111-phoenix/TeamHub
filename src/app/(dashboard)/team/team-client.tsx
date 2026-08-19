"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users, CheckSquare, FolderKanban, ArrowRight, Shield } from "lucide-react";
import { Role } from "@/types";

interface TeamClientProps {
  initialMembers: any[];
  currentUserId?: string;
  userRole?: Role;
}

export function TeamClient({ initialMembers, currentUserId, userRole = "MEMBER" }: TeamClientProps) {
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"ALL" | "ADMIN" | "MEMBER">("ALL");

  const filteredMembers = initialMembers.filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-metallic-cyan" />
          Team Directory
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Registered workspace team members, assigned responsibilities, and project involvement.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-metallic rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 border border-dark-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search member by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-dark-surface text-xs text-gray-200 placeholder-gray-500 rounded-lg border border-dark-border focus:outline-none focus:border-metallic-steel"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-1 bg-dark-surface p-1 rounded-lg border border-dark-border">
          <button
            onClick={() => setRoleFilter("ALL")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              roleFilter === "ALL" ? "bg-metallic-steel text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter("ADMIN")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              roleFilter === "ADMIN" ? "bg-metallic-steel text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setRoleFilter("MEMBER")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              roleFilter === "MEMBER" ? "bg-metallic-steel text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Members
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      {filteredMembers && filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m) => {
            const isMe = m.id === currentUserId;
            return (
              <div
                key={m.id}
                className="metallic-card rounded-xl p-5 border border-dark-border/80 hover:border-metallic-cyan/40 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge roleValue={m.role} />
                    {isMe && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-metallic-cyan/20 text-metallic-cyan font-bold border border-metallic-cyan/40">
                        YOU
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-dark-hover flex items-center justify-center font-bold text-lg text-white border border-metallic-steel/40">
                      {m.name ? m.name.charAt(0) : "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/team/${m.id}`}
                        className="text-base font-bold text-white group-hover:text-metallic-cyan transition-colors truncate block"
                      >
                        {m.name}
                      </Link>
                      <span className="text-xs text-gray-400 truncate block">{m.email}</span>
                    </div>
                  </div>

                  {m.bio && (
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed italic">
                      &quot;{m.bio}&quot;
                    </p>
                  )}
                </div>

                {/* Stats & Link */}
                <div className="pt-3 border-t border-dark-border/60 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-gray-300">
                      <CheckSquare className="w-3.5 h-3.5 text-metallic-steel" />
                      <span>{m._count?.assignedTasks || 0} tasks</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-300">
                      <FolderKanban className="w-3.5 h-3.5 text-metallic-cyan" />
                      <span>{m._count?.projectMemberships || 0} projects</span>
                    </span>
                  </div>

                  <Link
                    href={`/team/${m.id}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
                    title="View Member Profile"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="metallic-card rounded-xl p-12 text-center text-gray-400 border border-dashed border-dark-border">
          <Users className="w-12 h-12 text-metallic-cyan mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-white">No team members match search</h3>
        </div>
      )}
    </div>
  );
}
