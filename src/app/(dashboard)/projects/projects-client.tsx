"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectList } from "@/components/projects/project-list";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { getProjects, archiveProject, restoreProject } from "@/lib/actions/projects";
import { ProjectStatus, Role } from "@/types";
import { FolderKanban, Plus, Clock, CheckCircle2, PauseCircle, Archive, LayoutGrid } from "lucide-react";

interface ProjectsClientProps {
  initialProjects: any[];
  members: any[];
  currentUserId?: string;
  userRole?: Role;
}

export function ProjectsClient({
  initialProjects,
  members,
  currentUserId,
  userRole = "MEMBER",
}: ProjectsClientProps) {
  const [projects, setProjects] = React.useState<any[]>(initialProjects);

  // Filters State
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<ProjectStatus | "ALL">("ALL");

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [projectToEdit, setProjectToEdit] = React.useState<any | null>(null);

  const refreshProjects = React.useCallback(async () => {
    const updated = await getProjects({
      search,
      status,
    });
    setProjects(updated);
  }, [search, status]);

  React.useEffect(() => {
    refreshProjects();
  }, [search, status, refreshProjects]);

  const handleResetFilters = () => {
    setSearch("");
    setStatus("ALL");
  };

  const handleArchive = async (projectId: string) => {
    if (!confirm("Are you sure you want to archive this project?")) return;
    const res = await archiveProject(projectId);
    if (res.success) {
      refreshProjects();
    } else {
      alert(res.error || "Failed to archive project.");
    }
  };

  const handleRestore = async (projectId: string) => {
    const res = await restoreProject(projectId);
    if (res.success) {
      refreshProjects();
    } else {
      alert(res.error || "Failed to restore project.");
    }
  };

  // Metrics breakdown
  const planningCount = projects.filter((p) => p.status === "PLANNING").length;
  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;
  const onHoldCount = projects.filter((p) => p.status === "ON_HOLD").length;
  const completedCount = projects.filter((p) => p.status === "COMPLETED").length;
  const archivedCount = projects.filter((p) => p.status === "ARCHIVED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-metallic-cyan" />
            Project Workspaces
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Organize multi-task initiatives, monitor milestone progress, and manage project team members.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="shadow-metallic-glow"
        >
          <Plus className="w-4 h-4" /> Create Project
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">Planning</span>
            <span className="text-xl font-bold text-slate-200">{planningCount}</span>
          </div>
          <LayoutGrid className="w-5 h-5 text-slate-400 opacity-60" />
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">Active</span>
            <span className="text-xl font-bold text-cyan-400">{activeCount}</span>
          </div>
          <Clock className="w-5 h-5 text-cyan-400 opacity-60" />
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">On Hold</span>
            <span className="text-xl font-bold text-amber-400">{onHoldCount}</span>
          </div>
          <PauseCircle className="w-5 h-5 text-amber-400 opacity-60" />
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">Completed</span>
            <span className="text-xl font-bold text-emerald-400">{completedCount}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400 opacity-60" />
        </Card>

        <Card className="p-3.5 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">Archived</span>
            <span className="text-xl font-bold text-gray-400">{archivedCount}</span>
          </div>
          <Archive className="w-5 h-5 text-gray-400 opacity-60" />
        </Card>
      </div>

      {/* Filter Controls */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onReset={handleResetFilters}
      />

      {/* Project Cards Grid */}
      <ProjectList
        projects={projects}
        currentUserId={currentUserId}
        userRole={userRole}
        onEditProject={(project) => setProjectToEdit(project)}
        onArchiveProject={handleArchive}
        onRestoreProject={handleRestore}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        members={members}
        onProjectCreated={refreshProjects}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={!!projectToEdit}
        onClose={() => setProjectToEdit(null)}
        project={projectToEdit}
        members={members}
        onProjectUpdated={refreshProjects}
      />
    </div>
  );
}
