import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  FolderKanban,
  Activity,
  AlertCircle,
  Plus,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const userId = user?.id || "";

  const now = new Date();

  // Execute database queries safely with fallbacks
  let myAssignedPendingCount = 0;
  let teamPendingCount = 0;
  let activeProjectsCount = 0;
  let completedTasksCount = 0;
  let urgentTasksCount = 0;
  let overdueTasksCount = 0;
  let myAssignedTasks: any[] = [];
  let teamPendingTasks: any[] = [];
  let activeProjects: any[] = [];
  let recentlyCompletedWork: any[] = [];
  let recentActivities: any[] = [];

  try {
    const results = await Promise.all([
      // 1. My assigned pending count
      userId ? db.task.count({ where: { assigneeId: userId, status: { not: "COMPLETED" } } }) : 0,
      // 2. Team pending count
      db.task.count({ where: { status: { not: "COMPLETED" } } }),
      // 3. Active projects count
      db.project.count({ where: { status: "ACTIVE" } }),
      // 4. Completed tasks count
      db.task.count({ where: { status: "COMPLETED" } }),
      // 5. Urgent tasks count
      db.task.count({ where: { priority: "URGENT", status: { not: "COMPLETED" } } }),
      // 6. Overdue tasks count
      db.task.count({ where: { dueDate: { lt: now }, status: { not: "COMPLETED" } } }),
      // 7. My assigned tasks (prioritized by overdue & urgent)
      userId
        ? db.task.findMany({
            where: { assigneeId: userId, status: { not: "COMPLETED" } },
            take: 5,
            orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { updatedAt: "desc" }],
            include: { project: { select: { name: true } } },
          })
        : [],
      // 8. Team pending tasks overview
      db.task.findMany({
        where: { status: { not: "COMPLETED" } },
        take: 5,
        orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
        include: {
          assignee: { select: { name: true, avatarUrl: true } },
          project: { select: { name: true } },
        },
      }),
      // 9. Active projects with real task counts for progress calculation
      db.project.findMany({
        where: { status: "ACTIVE" },
        take: 4,
        orderBy: { updatedAt: "desc" },
        include: {
          owner: { select: { name: true } },
          tasks: { select: { id: true, status: true } },
          _count: { select: { members: true } },
        },
      }),
      // 10. Recently completed tasks
      db.task.findMany({
        where: { status: "COMPLETED" },
        take: 4,
        orderBy: { completedAt: "desc" },
        include: {
          assignee: { select: { name: true } },
          project: { select: { name: true } },
        },
      }),
      // 11. Recent activity logs
      db.activity.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { name: true, role: true } },
        },
      }),
    ]);

    [
      myAssignedPendingCount,
      teamPendingCount,
      activeProjectsCount,
      completedTasksCount,
      urgentTasksCount,
      overdueTasksCount,
      myAssignedTasks,
      teamPendingTasks,
      activeProjects,
      recentlyCompletedWork,
      recentActivities,
    ] = results as any;
  } catch (error) {
    console.error("[DashboardPage] Database query error:", error);
  }

  return (
    <div className="space-y-8 text-xs">
      {/* Header Banner */}
      <div className="metallic-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-dark-border relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || "Member"}
            </h1>
            <Badge roleValue={user?.role} />
          </div>
          <p className="text-xs sm:text-sm text-gray-400">
            {isAdmin
              ? "Workspace Overview: Manage projects, monitor team velocity, and assign high-priority tasks."
              : "Workspace Overview: Track your assigned tasks, monitor project milestones, and view team updates."}
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link href="/tasks">
            <Button variant="primary" size="sm" className="shadow-metallic-glow">
              <Plus className="w-4 h-4" /> Tasks
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="secondary" size="sm">
              <FolderKanban className="w-4 h-4" /> Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">My Tasks</span>
            <span className="text-xl font-bold text-white mt-0.5">{myAssignedPendingCount}</span>
          </div>
          <CheckSquare className="w-5 h-5 text-blue-400 opacity-60" />
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">Team Pending</span>
            <span className="text-xl font-bold text-slate-200 mt-0.5">{teamPendingCount}</span>
          </div>
          <Clock className="w-5 h-5 text-slate-400 opacity-60" />
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">Active Projects</span>
            <span className="text-xl font-bold text-cyan-400 mt-0.5">{activeProjectsCount}</span>
          </div>
          <FolderKanban className="w-5 h-5 text-cyan-400 opacity-60" />
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">Completed</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5">{completedTasksCount}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400 opacity-60" />
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-rose-400 block font-medium">Urgent</span>
            <span className="text-xl font-bold text-rose-400 mt-0.5">{urgentTasksCount}</span>
          </div>
          <AlertCircle className="w-5 h-5 text-rose-400 opacity-60" />
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-400 block font-medium">Overdue</span>
            <span className="text-xl font-bold text-amber-400 mt-0.5">{overdueTasksCount}</span>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-400 opacity-60 animate-pulse" />
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): My Work & Team Pending */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Assigned Work Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Assigned Work</CardTitle>
                <p className="text-xs text-gray-400">Tasks assigned to you requiring immediate progress.</p>
              </div>
              <Link href="/tasks" className="text-xs text-metallic-cyan hover:underline font-medium flex items-center gap-1">
                View All Tasks <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {myAssignedTasks.length > 0 ? (
                <div className="space-y-3">
                  {myAssignedTasks.map((t) => {
                    const isOverdue = t.dueDate && new Date(t.dueDate) < now;
                    return (
                      <div
                        key={t.id}
                        className="p-3.5 bg-dark-surface/60 rounded-xl border border-dark-border/80 flex items-center justify-between gap-3 hover:border-metallic-steel/40 transition-colors"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge statusValue={t.status} />
                            <Badge priorityValue={t.priority} />
                            {isOverdue && (
                              <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3" /> OVERDUE
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-semibold text-white truncate">{t.title}</h4>
                          {t.project && (
                            <span className="text-[10px] text-metallic-cyan font-mono block">
                              {t.project.name}
                            </span>
                          )}
                        </div>
                        <Link href="/tasks">
                          <Button variant="ghost" size="sm" className="text-xs">
                            Details
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 border border-dashed border-dark-border rounded-xl">
                  <CheckSquare className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-gray-300">No pending assigned tasks</p>
                  <p className="text-xs text-gray-400 mt-1">
                    You have no uncompleted tasks assigned to you right now.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Projects Progress Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Projects Progress</CardTitle>
                <p className="text-xs text-gray-400">Calculated completion percentages based on live database tasks.</p>
              </div>
              <Link href="/projects" className="text-xs text-metallic-cyan hover:underline font-medium flex items-center gap-1">
                All Projects <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {activeProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeProjects.map((p: any) => {
                    const total = p.tasks?.length || 0;
                    const completed = p.tasks?.filter((t: any) => t.status === "COMPLETED").length || 0;
                    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                      <div
                        key={p.id}
                        className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/projects/${p.id}`}
                            className="font-bold text-white hover:text-metallic-cyan transition-colors truncate"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[10px] text-gray-400 font-mono">{pct}%</span>
                        </div>

                        <div className="w-full h-1.5 bg-dark-surface rounded-full overflow-hidden border border-dark-border/50">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>Owner: {p.owner?.name || "System"}</span>
                          <span>{completed}/{total} Tasks Completed</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 border border-dashed border-dark-border rounded-xl">
                  <FolderKanban className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-gray-300">No active projects</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Activity Feed & Recently Completed */}
        <div className="space-y-6">
          {/* Recent Team Activity Widget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-metallic-steel" />
                Live Team Activity
              </CardTitle>
              <Link href="/activity" className="text-xs text-metallic-cyan hover:underline">
                Feed →
              </Link>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-dark-surface/50 rounded-lg border border-dark-border/40 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-semibold text-gray-200">{act.actor?.name || "System"}</span>
                        <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className="text-xs text-gray-300 font-medium block">
                        {act.action.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 italic border border-dashed border-dark-border rounded-xl">
                  No recent activity logged yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently Completed Work Archive Widget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                Recently Completed
              </CardTitle>
              <Link href="/history" className="text-xs text-metallic-cyan hover:underline">
                Archive →
              </Link>
            </CardHeader>
            <CardContent>
              {recentlyCompletedWork.length > 0 ? (
                <div className="space-y-2.5">
                  {recentlyCompletedWork.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 bg-dark-surface/50 rounded-lg border border-dark-border/40 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <h5 className="font-semibold text-white truncate text-xs">{t.title}</h5>
                        <span className="text-[10px] text-gray-400 block truncate">
                          Completed by {t.assignee?.name || "Member"}
                        </span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 italic border border-dashed border-dark-border rounded-xl">
                  No completed work logged yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
