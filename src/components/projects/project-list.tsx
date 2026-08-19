"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User as UserIcon,
  Users,
  CheckSquare,
  FolderKanban,
  Edit2,
  Archive,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { Role } from "@/types";

interface ProjectListProps {
  projects: any[];
  currentUserId?: string;
  userRole?: Role;
  onEditProject: (project: any) => void;
  onArchiveProject: (projectId: string) => void;
  onRestoreProject: (projectId: string) => void;
}

export function ProjectList({
  projects,
  currentUserId,
  userRole = "MEMBER",
  onEditProject,
  onArchiveProject,
  onRestoreProject,
}: ProjectListProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="metallic-card rounded-xl p-12 text-center text-gray-400 border border-dashed border-dark-border/80">
        <FolderKanban className="w-12 h-12 text-metallic-cyan mx-auto mb-3 opacity-40" />
        <h3 className="text-base font-semibold text-white">No projects found</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          No projects match your search or lifecycle filter. Create a new project to start organizing tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project) => {
        const canManage = userRole === "ADMIN" || project.ownerId === currentUserId;

        const totalTasks = project.tasks?.length || project._count?.tasks || 0;
        const completedTasks =
          project.tasks?.filter((t: any) => t.status === "COMPLETED").length || 0;
        const progressPercentage =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const memberCount = project.members?.length || project._count?.members || 1;

        const isArchived = project.status === "ARCHIVED";

        return (
          <div
            key={project.id}
            className={`metallic-card rounded-xl p-5 flex flex-col justify-between gap-4 border transition-all group ${
              isArchived
                ? "border-dark-border opacity-70 bg-dark-surface/40"
                : "border-dark-border/80 hover:border-metallic-cyan/40"
            }`}
          >
            {/* Top Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge statusValue={project.status} />
                <span className="text-[10px] text-gray-500 font-mono">
                  Owner: {project.owner?.name || "System"}
                </span>
              </div>

              <div>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-base font-bold text-white group-hover:text-metallic-cyan transition-colors line-clamp-1"
                >
                  {project.name}
                </Link>
                {project.description ? (
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                    {project.description}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 italic mt-1">No description provided.</p>
                )}
              </div>
            </div>

            {/* Task Completion Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-dark-border/60">
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-metallic-steel" />
                  <span>Tasks: {completedTasks} / {totalTasks}</span>
                </span>
                <span className="font-mono text-gray-300">{progressPercentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-dark-surface rounded-full overflow-hidden border border-dark-border/50">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Bottom Meta & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-dark-border/60 text-xs text-gray-400">
              {/* Member count & Target date */}
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-gray-300">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>{memberCount} members</span>
                </span>

                {project.targetDate && (
                  <span className="flex items-center gap-1 font-mono text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(project.targetDate).toLocaleDateString()}</span>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <Link
                  href={`/projects/${project.id}`}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
                  title="Open Project Dashboard"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {canManage && (
                  <button
                    onClick={() => onEditProject(project)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-metallic-chrome hover:bg-dark-hover transition-colors"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {canManage &&
                  (isArchived ? (
                    <button
                      onClick={() => onRestoreProject(project.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-dark-hover transition-colors"
                      title="Restore Project"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onArchiveProject(project.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-dark-hover transition-colors"
                      title="Archive Project"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
