"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCompletedHistory, CompletedHistoryItem } from "@/lib/actions/history";
import { History, CheckCircle2, Search, CheckSquare, FolderKanban, Calendar, User, ArrowRight } from "lucide-react";

interface HistoryClientProps {
  initialItems: CompletedHistoryItem[];
}

export function HistoryClient({ initialItems }: HistoryClientProps) {
  const [items, setItems] = React.useState<CompletedHistoryItem[]>(initialItems);
  const [type, setType] = React.useState<"ALL" | "TASKS" | "PROJECTS">("ALL");
  const [search, setSearch] = React.useState("");

  const refreshHistory = React.useCallback(async () => {
    const updated = await getCompletedHistory({ type, search });
    setItems(updated);
  }, [type, search]);

  React.useEffect(() => {
    refreshHistory();
  }, [type, search, refreshHistory]);

  const taskCount = items.filter((i) => i.type === "TASK").length;
  const projectCount = items.filter((i) => i.type === "PROJECT").length;

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-400" />
          Completed Work History Archive
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Permanent searchable record of completed tasks, finished milestones, and archived projects.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Total Archive Items</span>
            <div className="text-xl font-bold text-white mt-0.5">{items.length}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Completed Tasks</span>
            <div className="text-xl font-bold text-white mt-0.5">{taskCount}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Completed / Archived Projects</span>
            <div className="text-xl font-bold text-white mt-0.5">{projectCount}</div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="glass-metallic rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 border border-dark-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search completed work archive..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-dark-surface text-xs text-gray-200 placeholder-gray-500 rounded-lg border border-dark-border focus:outline-none focus:border-metallic-steel"
          />
        </div>

        {/* Type Tabs */}
        <div className="flex items-center gap-1 bg-dark-surface p-1 rounded-lg border border-dark-border">
          <button
            onClick={() => setType("ALL")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              type === "ALL" ? "bg-metallic-steel text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            All Work
          </button>
          <button
            onClick={() => setType("TASKS")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              type === "TASKS" ? "bg-metallic-steel text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Tasks ({taskCount})
          </button>
          <button
            onClick={() => setType("PROJECTS")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              type === "PROJECTS" ? "bg-metallic-steel text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Projects ({projectCount})
          </button>
        </div>
      </div>

      {/* History Archive List */}
      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const isTask = item.type === "TASK";

            return (
              <div
                key={item.id}
                className="metallic-card rounded-xl p-4 border border-dark-border/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isTask
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                          : "bg-cyan-950/80 text-cyan-300 border border-cyan-500/40"
                      }`}
                    >
                      {isTask ? (
                        <>
                          <CheckSquare className="w-3 h-3" /> Task Completed
                        </>
                      ) : (
                        <>
                          <FolderKanban className="w-3 h-3" /> Project {item.status}
                        </>
                      )}
                    </span>

                    {item.priority && <Badge priorityValue={item.priority as any} />}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-dark-border/60 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-gray-300 font-medium">
                      <User className="w-3 h-3 text-gray-400" />
                      <span>{item.completedBy}</span>
                    </div>
                    {item.projectTitle && (
                      <span className="text-[10px] text-metallic-cyan block font-mono">
                        {item.projectTitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      {new Date(item.completedAt).toLocaleDateString()}
                    </span>

                    <Link
                      href={isTask ? "/tasks" : `/projects/${item.id}`}
                      className="p-1 rounded text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
                      title="View Details"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center text-gray-400 border border-dashed border-dark-border">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-white">History log empty</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            When tasks and projects are marked as Completed or Archived, they automatically enter this permanent history archive.
          </p>
        </Card>
      )}
    </div>
  );
}
