"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EditProfileModal } from "@/components/team/edit-profile-modal";
import { getUserProfile } from "@/lib/actions/users";
import { Role } from "@/types";
import {
  Users,
  ArrowLeft,
  Calendar,
  Mail,
  Edit2,
  CheckSquare,
  CheckCircle2,
  FolderKanban,
  Activity,
  Clock,
} from "lucide-react";

interface UserProfileClientProps {
  profileData: any;
  currentUserId?: string;
  userRole?: Role;
}

export function UserProfileClient({
  profileData: initialData,
  currentUserId,
  userRole = "MEMBER",
}: UserProfileClientProps) {
  const [data, setData] = React.useState<any>(initialData);
  const [activeTab, setActiveTab] = React.useState<"tasks" | "projects" | "activity">("tasks");
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const { user, stats, assignedTasks, projects, recentActivities } = data;

  const reloadProfile = React.useCallback(async () => {
    const updated = await getUserProfile(user.id);
    if (updated) setData(updated);
  }, [user.id]);

  const canEdit = userRole === "ADMIN" || currentUserId === user.id;

  return (
    <div className="space-y-6 text-xs">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/team"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Team Directory
        </Link>

        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Header Banner */}
      <div className="metallic-card rounded-2xl p-6 border border-dark-border space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 rounded-2xl border-2 border-metallic-steel object-cover shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-dark-hover flex items-center justify-center font-bold text-2xl text-white border-2 border-metallic-steel shadow-lg">
                {user.name ? user.name.charAt(0) : "U"}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{user.name}</h1>
                <Badge roleValue={user.role} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5 text-gray-500" /> {user.email}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" /> Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {user.bio && (
          <p className="text-xs text-gray-300 italic leading-relaxed max-w-2xl pt-2 border-t border-dark-border/60">
            &quot;{user.bio}&quot;
          </p>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Assigned Active Tasks</span>
            <div className="text-xl font-bold text-white mt-0.5">{stats.activeTasksCount}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Completed Tasks</span>
            <div className="text-xl font-bold text-white mt-0.5">{stats.completedTasksCount}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Active Project Involvement</span>
            <div className="text-xl font-bold text-white mt-0.5">{stats.activeProjectsCount}</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-dark-border text-xs font-semibold">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "tasks"
              ? "border-metallic-cyan text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Assigned Tasks ({assignedTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "projects"
              ? "border-metallic-cyan text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "activity"
              ? "border-metallic-cyan text-white"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Recent Activity ({recentActivities.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tasks" && (
        <div>
          {assignedTasks && assignedTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignedTasks.map((t: any) => (
                <div
                  key={t.id}
                  className="p-4 bg-dark-card rounded-xl border border-dark-border/80 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge statusValue={t.status} />
                    <Badge priorityValue={t.priority} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{t.title}</h4>
                  {t.project && (
                    <span className="text-[10px] text-metallic-cyan font-mono block">
                      {t.project.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 italic">No assigned active tasks.</div>
          )}
        </div>
      )}

      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects && projects.length > 0 ? (
            projects.map((p: any) => (
              <div
                key={p.id}
                className="p-4 bg-dark-card rounded-xl border border-dark-border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge statusValue={p.status} />
                  <span className="text-[10px] text-gray-400">Owner: {p.owner?.name}</span>
                </div>
                <Link
                  href={`/projects/${p.id}`}
                  className="text-sm font-bold text-white hover:text-metallic-cyan transition-colors block"
                >
                  {p.name}
                </Link>
                <span className="text-[11px] text-gray-400 block font-mono">
                  {p._count?.tasks || 0} tasks • {p._count?.members || 0} members
                </span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400 italic">No project memberships found.</div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="space-y-3">
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((act: any) => (
              <div
                key={act.id}
                className="p-3 bg-dark-card rounded-xl border border-dark-border/70 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span className="font-bold text-white">{act.action.replace("_", " ")}</span>
                  <span className="font-mono">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400 italic">No recent activity logged.</div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
        onProfileUpdated={reloadProfile}
      />
    </div>
  );
}
