"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { AddMemberModal } from "@/components/projects/add-member-modal";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import {
  getProjectDetails,
  archiveProject,
  restoreProject,
  removeProjectMember,
  addProjectComment,
  updateProject,
} from "@/lib/actions/projects";
import { ProjectStatus, Role } from "@/types";
import {
  FolderKanban,
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Users,
  CheckSquare,
  MessageSquare,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  UserMinus,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface ProjectDetailClientProps {
  project: any;
  members: any[];
  currentUserId?: string;
  userRole?: Role;
}

export function ProjectDetailClient({
  project: initialProject,
  members,
  currentUserId,
  userRole = "MEMBER",
}: ProjectDetailClientProps) {
  const router = useRouter();
  const [project, setProject] = React.useState<any>(initialProject);

  const [activeTab, setActiveTab] = React.useState<"tasks" | "members" | "comments">("tasks");

  // Modals state
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = React.useState(false);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  // Comment state
  const [commentText, setCommentText] = React.useState("");
  const [isPostingComment, setIsPostingComment] = React.useState(false);

  const reloadProject = React.useCallback(async () => {
    const updated = await getProjectDetails(project.id);
    if (updated) setProject(updated);
  }, [project.id]);

  const canManage = userRole === "ADMIN" || project.ownerId === currentUserId;

  const handleStatusTransition = async (newStatus: ProjectStatus) => {
    const res = await updateProject({
      id: project.id,
      name: project.name,
      description: project.description,
      status: newStatus,
      startDate: project.startDate,
      targetDate: project.targetDate,
    });
    if (res.success) {
      reloadProject();
    } else {
      alert(res.error || "Failed to update project lifecycle state.");
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this project?")) return;
    const res = await archiveProject(project.id);
    if (res.success) reloadProject();
  };

  const handleRestore = async () => {
    const res = await restoreProject(project.id);
    if (res.success) reloadProject();
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Remove this member from the project?")) return;
    const res = await removeProjectMember({
      projectId: project.id,
      userId,
    });
    if (res.success) {
      reloadProject();
    } else {
      alert(res.error || "Failed to remove member.");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsPostingComment(true);
    const res = await addProjectComment({
      projectId: project.id,
      content: commentText.trim(),
    });
    setIsPostingComment(false);

    if (res.success) {
      setCommentText("");
      reloadProject();
    } else {
      alert(res.error || "Failed to post comment.");
    }
  };

  // Metrics
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((t: any) => t.status === "COMPLETED").length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const memberUserIds = project.members?.map((m: any) => m.userId) || [];

  return (
    <div className="space-y-6 text-xs">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects Workspace
        </Link>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
              <Edit2 className="w-3.5 h-3.5" /> Edit Project
            </Button>
          )}

          {canManage &&
            (project.status === "ARCHIVED" ? (
              <Button variant="secondary" size="sm" onClick={handleRestore}>
                <RotateCcw className="w-3.5 h-3.5" /> Restore
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={handleArchive}>
                <Archive className="w-3.5 h-3.5" /> Archive
              </Button>
            ))}
        </div>
      </div>

      {/* Project Banner Card */}
      <div className="metallic-card rounded-2xl p-6 border border-dark-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge statusValue={project.status} />
              <span className="text-[11px] text-gray-400 font-mono">
                Owner: {project.owner?.name || "System"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">{project.name}</h1>
          </div>

          {/* Quick Lifecycle Transition */}
          {canManage && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-dark-surface rounded-xl border border-dark-border">
              <span className="text-[10px] text-gray-400 font-semibold px-2 uppercase">Lifecycle:</span>
              {(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"] as ProjectStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusTransition(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    project.status === st
                      ? "bg-metallic-steel text-white shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-dark-hover"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {project.description && (
          <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">{project.description}</p>
        )}

        {/* Progress Bar & Timelines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-dark-border/60">
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between text-gray-300 font-medium">
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-metallic-cyan" />
                <span>Completion Progress: {completedTasks} / {totalTasks} Tasks</span>
              </span>
              <span className="font-mono">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-dark-surface rounded-full overflow-hidden border border-dark-border/50">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 text-gray-400">
            {project.startDate && (
              <div>
                <span className="text-[10px] text-gray-500 block">START DATE</span>
                <span className="font-mono text-gray-200">
                  {new Date(project.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {project.targetDate && (
              <div>
                <span className="text-[10px] text-gray-500 block">TARGET DATE</span>
                <span className="font-mono text-gray-200">
                  {new Date(project.targetDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-dark-border">
        <div className="flex text-xs font-semibold">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "tasks"
                ? "border-metallic-cyan text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Linked Tasks ({totalTasks})</span>
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "members"
                ? "border-metallic-cyan text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Members ({project.members?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("comments")}
            className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "comments"
                ? "border-metallic-cyan text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discussion ({project.comments?.length || 0})</span>
          </button>
        </div>

        {activeTab === "tasks" && (
          <Button variant="primary" size="sm" onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Add Task to Project
          </Button>
        )}

        {activeTab === "members" && canManage && (
          <Button variant="outline" size="sm" onClick={() => setIsAddMemberOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Add Member
          </Button>
        )}
      </div>

      {/* Tab 1: Linked Tasks */}
      {activeTab === "tasks" && (
        <div>
          {project.tasks && project.tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {project.tasks.map((t: any) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className="p-4 bg-dark-card rounded-xl border border-dark-border/80 hover:border-metallic-cyan/40 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge statusValue={t.status} />
                    <Badge priorityValue={t.priority} />
                  </div>

                  <h4 className="text-sm font-semibold text-white group-hover:text-metallic-cyan transition-colors">
                    {t.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-dark-border/60 text-gray-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-gray-500" />
                      <span>{t.assignee?.name || "Unassigned"}</span>
                    </span>

                    {t.dueDate && (
                      <span className="font-mono">
                        Due {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 border border-dashed border-dark-border rounded-xl">
              <CheckSquare className="w-10 h-10 text-gray-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-gray-300">No tasks linked to this project</p>
              <p className="text-xs text-gray-400 mt-1">
                Click &quot;Add Task to Project&quot; above to assign work to this workspace.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Team Members */}
      {activeTab === "members" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {project.members && project.members.length > 0 ? (
            project.members.map((m: any) => {
              const u = m.user;
              const isOwner = u.id === project.ownerId;
              return (
                <div
                  key={m.id}
                  className="p-4 bg-dark-card rounded-xl border border-dark-border flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-dark-hover flex items-center justify-center font-bold text-white border border-dark-border">
                      {u.name ? u.name.charAt(0) : "U"}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-white block truncate">{u.name}</span>
                      <span className="text-[10px] text-gray-400 truncate block">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-500/40">
                        Owner
                      </span>
                    ) : (
                      canManage && (
                        <button
                          onClick={() => handleRemoveMember(u.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-dark-hover rounded"
                          title="Remove Member"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-gray-400">No members assigned.</div>
          )}
        </div>
      )}

      {/* Tab 3: Discussion & Activity */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          <form onSubmit={handlePostComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Post a project update or discussion note..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-dark-surface border border-dark-border rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-metallic-cyan"
            />
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isPostingComment}
              disabled={!commentText.trim()}
            >
              <Send className="w-3.5 h-3.5" /> Post
            </Button>
          </form>

          <div className="space-y-3">
            {project.comments && project.comments.length > 0 ? (
              project.comments.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3.5 bg-dark-card rounded-xl border border-dark-border/70 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-semibold text-gray-200">
                      {c.author?.name || "Member"}
                    </span>
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-normal">{c.content}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 italic">
                No discussion comments recorded for this project yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <EditProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project}
        members={members}
        onProjectUpdated={reloadProject}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        projectId={project.id}
        existingMemberUserIds={memberUserIds}
        members={members}
        onMemberAdded={reloadProject}
      />

      {/* Pre-fill project id when creating task */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        members={members}
        projects={[{ id: project.id, name: project.name }]}
        onTaskCreated={reloadProject}
      />

      <TaskDetailModal
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
        onTaskUpdated={reloadProject}
      />
    </div>
  );
}
