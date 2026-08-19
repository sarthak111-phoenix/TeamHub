"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateTask } from "@/lib/actions/tasks";
import { TaskPriority, TaskStatus } from "@/types";
import { Calendar, User as UserIcon, Folder, AlertCircle } from "lucide-react";

interface MemberOption {
  id: string;
  name: string;
  email: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface TaskToEdit {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId?: string | null;
  projectId?: string | null;
  dueDate?: Date | string | null;
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskToEdit | null;
  members: MemberOption[];
  projects: ProjectOption[];
  onTaskUpdated?: () => void;
}

export function EditTaskModal({
  isOpen,
  onClose,
  task,
  members,
  projects,
  onTaskUpdated,
}: EditTaskModalProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = React.useState<TaskStatus>("TO_DO");
  const [assigneeId, setAssigneeId] = React.useState<string>("");
  const [projectId, setProjectId] = React.useState<string>("");
  const [dueDate, setDueDate] = React.useState<string>("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "MEDIUM");
      setStatus(task.status || "TO_DO");
      setAssigneeId(task.assigneeId || "");
      setProjectId(task.projectId || "");
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        setDueDate(d.toISOString().split("T")[0]);
      } else {
        setDueDate("");
      }
      setError(null);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await updateTask({
      id: task.id,
      title,
      description,
      priority,
      status,
      assigneeId: assigneeId || null,
      projectId: projectId || null,
      dueDate: dueDate || null,
    });

    setIsLoading(false);

    if (res.success) {
      onClose();
      if (onTaskUpdated) onTaskUpdated();
    } else {
      setError(res.error || "Failed to update task");
    }
  };

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task"
      description="Modify task details, priority, assignee, or status."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Task Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-gray-300 uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-dark-surface text-gray-100 placeholder-gray-500 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-300 uppercase tracking-wider">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 bg-dark-surface text-gray-100 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-300 uppercase tracking-wider">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 bg-dark-surface text-gray-100 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
            >
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
              <UserIcon className="w-3 h-3 text-gray-400" /> Assignee
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 bg-dark-surface text-gray-100 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
              <Folder className="w-3 h-3 text-gray-400" /> Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-dark-surface text-gray-100 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
            >
              <option value="">No Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" /> Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-dark-surface text-gray-100 rounded-lg border border-dark-border text-xs focus:outline-none focus:border-metallic-steel"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
