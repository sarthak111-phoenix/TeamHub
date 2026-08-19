"use client";

import * as React from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { ProjectStatus } from "@/types";

interface ProjectFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: ProjectStatus | "ALL";
  onStatusChange: (val: ProjectStatus | "ALL") => void;
  onReset: () => void;
}

export function ProjectFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onReset,
}: ProjectFiltersProps) {
  return (
    <div className="glass-metallic rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 border border-dark-border">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter projects by title or scope..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-dark-surface text-xs text-gray-200 placeholder-gray-500 rounded-lg border border-dark-border focus:outline-none focus:border-metallic-steel"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as ProjectStatus | "ALL")}
            className="px-2.5 py-1.5 bg-dark-surface text-gray-200 rounded-lg border border-dark-border focus:outline-none focus:border-metallic-steel cursor-pointer"
          >
            <option value="ALL">All Lifecycle States</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {(search || status !== "ALL") && (
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
