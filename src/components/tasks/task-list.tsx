"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User as UserIcon,
  Folder,
  Eye,
  Edit2,
  Trash2,
  CheckSquare,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Role } from "@/types";

interface TaskListProps {
  tasks: any[];
  currentUserId?: string;
  userRole?: Role;
  onViewTask: (task: any) => void;
  onEditTask: (task: any) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({
  tasks,
  currentUserId,
  userRole = "MEMBER",
  onViewTask,
  onEditTask,
  onDeleteTask,
}: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="metallic-card rounded-xl p-12 text-center text-gray-400 border border-dashed border-dark-border/80">
        <CheckSquare className="w-12 h-12 text-metallic-steel mx-auto mb-3 opacity-40" />
        <h3 className="text-base font-semibold text-white">No tasks found</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          No tasks match your current filter criteria or no tasks have been created yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => {
        const canEdit =
          userRole === "ADMIN" ||
          task.creatorId === currentUserId ||
          task.assigneeId === currentUserId;

        const canDelete = userRole === "ADMIN" || task.creatorId === currentUserId;

        const isOverdue =
          task.dueDate &&
          task.status !== "COMPLETED" &&
          new Date(task.dueDate) < new Date();

        return (
          <div
            key={task.id}
            className="metallic-card rounded-xl p-4 flex flex-col justify-between gap-3 border border-dark-border/80 hover:border-metallic-steel/40 transition-all group"
          >
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Badge statusValue={task.status} />
                <Badge priorityValue={task.priority} />
              </div>

              <h3
                onClick={() => onViewTask(task)}
                className="text-sm font-semibold text-white group-hover:text-metallic-chrome transition-colors cursor-pointer line-clamp-2 leading-tight"
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>

            {/* Meta Footer */}
            <div className="space-y-3 pt-2 border-t border-dark-border/60 text-xs text-gray-400">
              {/* Project & Due Date */}
              <div className="flex items-center justify-between gap-2 text-[11px]">
                {task.project ? (
                  <span className="flex items-center gap-1 text-metallic-cyan font-medium truncate">
                    <Folder className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{task.project.name}</span>
                  </span>
                ) : (
                  <span className="text-gray-500 italic">No Project</span>
                )}

                {task.dueDate && (
                  <span
                    className={`flex items-center gap-1 font-mono ${
                      isOverdue ? "text-rose-400 font-bold" : "text-gray-400"
                    }`}
                  >
                    {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />}
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </span>
                )}
              </div>

              {/* Assignee & Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                {/* Assignee Info */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-dark-hover flex items-center justify-center text-[10px] text-gray-200 font-bold border border-dark-border">
                    {task.assignee?.name ? task.assignee.name.charAt(0) : "U"}
                  </div>
                  <span className="text-xs text-gray-300 truncate">
                    {task.assignee?.name || "Unassigned"}
                  </span>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onViewTask(task)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-metallic-chrome hover:bg-dark-hover transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-dark-hover transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
