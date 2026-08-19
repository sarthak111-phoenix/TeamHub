"use client";

import * as React from "react";
import { getActivities } from "@/lib/actions/activities";
import { Activity, Search, Filter, RefreshCw, CheckSquare, FolderKanban, MessageSquare, User, Clock } from "lucide-react";

interface ActivityClientProps {
  initialActivities: any[];
  members: any[];
}

export function ActivityClient({ initialActivities, members }: ActivityClientProps) {
  const [activities, setActivities] = React.useState<any[]>(initialActivities);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Filters State
  const [entityType, setEntityType] = React.useState<"ALL" | "TASK" | "PROJECT">("ALL");
  const [actorId, setActorId] = React.useState<string | "ALL">("ALL");
  const [search, setSearch] = React.useState("");

  const refreshActivities = React.useCallback(async () => {
    setIsRefreshing(true);
    const updated = await getActivities({
      entityType,
      actorId,
      search,
      limit: 100,
    });
    setActivities(updated);
    setIsRefreshing(false);
  }, [entityType, actorId, search]);

  React.useEffect(() => {
    refreshActivities();
  }, [entityType, actorId, search, refreshActivities]);

  const handleResetFilters = () => {
    setEntityType("ALL");
    setActorId("ALL");
    setSearch("");
  };

  const parseDetails = (detailsStr?: string | null) => {
    if (!detailsStr) return null;
    try {
      return JSON.parse(detailsStr);
    } catch {
      return { note: detailsStr };
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("CREATED")) return "bg-emerald-950/80 text-emerald-300 border-emerald-500/40";
    if (action.includes("UPDATED") || action.includes("CHANGED")) return "bg-blue-950/80 text-blue-300 border-blue-500/40";
    if (action.includes("ARCHIVED") || action.includes("DELETED") || action.includes("REMOVED")) return "bg-rose-950/80 text-rose-300 border-rose-500/40";
    if (action.includes("COMMENTED")) return "bg-cyan-950/80 text-cyan-300 border-cyan-500/40";
    return "bg-slate-800 text-slate-300 border-slate-600/40";
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-metallic-steel" />
          Workspace Activity Feed
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Chronological audit trail of team actions, task updates, project milestone shifts, and comments.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-metallic rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 border border-dark-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search activity events by action or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-dark-surface text-xs text-gray-200 placeholder-gray-500 rounded-lg border border-dark-border focus:outline-none focus:border-metallic-steel"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as any)}
              className="px-2.5 py-1.5 bg-dark-surface text-gray-200 rounded-lg border border-dark-border focus:outline-none focus:border-metallic-steel cursor-pointer"
            >
              <option value="ALL">All Entity Types</option>
              <option value="TASK">Tasks Only</option>
              <option value="PROJECT">Projects Only</option>
            </select>
          </div>

          <select
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
            className="px-2.5 py-1.5 bg-dark-surface text-gray-200 rounded-lg border border-dark-border focus:outline-none focus:border-metallic-steel cursor-pointer"
          >
            <option value="ALL">All Team Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {(search || entityType !== "ALL" || actorId !== "ALL") && (
            <button
              onClick={handleResetFilters}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Stream Timeline List */}
      {activities && activities.length > 0 ? (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-dark-border">
          {activities.map((act) => {
            const details = parseDetails(act.details);
            const isTask = act.entityType === "TASK";

            return (
              <div key={act.id} className="relative group">
                {/* Bullet Node */}
                <div className="absolute -left-6 top-3 w-5 h-5 rounded-full bg-dark-card border-2 border-metallic-steel/80 flex items-center justify-center text-metallic-steel group-hover:scale-110 transition-transform">
                  {isTask ? (
                    <CheckSquare className="w-2.5 h-2.5" />
                  ) : (
                    <FolderKanban className="w-2.5 h-2.5 text-metallic-cyan" />
                  )}
                </div>

                {/* Event Card */}
                <div className="p-4 bg-dark-card rounded-xl border border-dark-border/80 hover:border-metallic-steel/40 transition-colors space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {act.actor?.name || "System"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getActionBadgeColor(
                          act.action
                        )}`}
                      >
                        {act.action.replace("_", " ")}
                      </span>
                    </div>

                    <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Contextual Details */}
                  {details && (
                    <div className="p-2.5 bg-dark-surface/60 rounded-lg border border-dark-border/60 text-xs text-gray-300 space-y-1">
                      {details.title && (
                        <div className="font-semibold text-white">Title: {details.title}</div>
                      )}
                      {details.name && (
                        <div className="font-semibold text-white">Project: {details.name}</div>
                      )}
                      {details.status && (
                        <div className="text-[11px] text-gray-400">
                          Status: <span className="text-gray-200">{details.status}</span>
                        </div>
                      )}
                      {details.from && details.to && (
                        <div className="text-[11px] text-gray-400">
                          Transition: <span className="text-gray-300">{details.from}</span> →{" "}
                          <span className="text-emerald-400 font-semibold">{details.to}</span>
                        </div>
                      )}
                      {details.note && (
                        <div className="text-[11px] text-gray-300 italic">&quot;{details.note}&quot;</div>
                      )}
                      {details.content && (
                        <div className="text-[11px] text-gray-300 italic">&quot;{details.content}&quot;</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="metallic-card rounded-xl p-12 text-center text-gray-400 border border-dashed border-dark-border">
          <Activity className="w-12 h-12 text-metallic-steel mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-white">No activity logged yet</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Task and project actions automatically populate this live audit stream.
          </p>
        </div>
      )}
    </div>
  );
}
