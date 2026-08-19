"use client";

import * as React from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { TaskStatus, TaskPriority } from "@/types";

interface MemberOption {
  id: string;
  name: string;
}

interface TaskFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: TaskStatus | "ALL";
  onStatusChange: (val: TaskStatus | "ALL") => void;
  priority: TaskPriority | "ALL";
  onPriorityChange: (val: TaskPriority | "ALL") => void;
  assigneeId: string | "ALL";
  onAssigneeChange: (val: string | "ALL") => void;
  members: MemberOption[];
  onReset: () => void;
}

export function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  assigneeId,
  onAssigneeChange,
  members,
  onReset,
}: TaskFiltersProps) {
  return (
    <div className="glass-metallic rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 border border-dark-border">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter tasks by title or description..."
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
            onChange={(e) => onStatusChange(e.target.value as TaskStatus | "ALL")}
            className="px-2.5 py-1.5 bg-dark-surface text-gray-200 rounded-lg border border-dark-border focus:outline-none focus:border-metallic-steel cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="TO_DO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as TaskPriority | "ALL")}
          className="px-2.5 py-1.5 bg-dark-surface text-gray-200 rounded-lg border border-dark-border focus:outline-none focus:border-metallic-steel cursor-pointer"
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        <select
          value={assigneeId}
          onChange={(e) => onAssigneeChange(e.target.value)}
          className="px-2.5 py-1.5 bg-dark-surface text-gray-200 rounded-lg border border-dark-border focus:outline-none focus:border-metallic-steel cursor-pointer"
        >
          <option value="ALL">All Assignees</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {(search || status !== "ALL" || priority !== "ALL" || assigneeId !== "ALL") && (
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
