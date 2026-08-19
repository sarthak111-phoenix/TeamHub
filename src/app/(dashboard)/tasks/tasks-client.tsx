"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskList } from "@/components/tasks/task-list";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { EditTaskModal } from "@/components/tasks/edit-task-modal";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { deleteTask, getTasks } from "@/lib/actions/tasks";
import { TaskStatus, TaskPriority, Role } from "@/types";
import { CheckSquare, Plus, AlertCircle, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

interface TasksClientProps {
  initialTasks: any[];
  members: any[];
  projects: any[];
  currentUserId?: string;
  userRole?: Role;
}

export function TasksClient({
  initialTasks,
  members,
  projects,
  currentUserId,
  userRole = "MEMBER",
}: TasksClientProps) {
  const [tasks, setTasks] = React.useState<any[]>(initialTasks);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Filters State
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus | "ALL">("ALL");
  const [priority, setPriority] = React.useState<TaskPriority | "ALL">("ALL");
  const [assigneeId, setAssigneeId] = React.useState<string | "ALL">("ALL");

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [taskToEdit, setTaskToEdit] = React.useState<any | null>(null);
  const [taskDetailId, setTaskDetailId] = React.useState<string | null>(null);

  const refreshTasks = React.useCallback(async () => {
    setIsRefreshing(true);
    const updated = await getTasks({
      search,
      status,
      priority,
      assigneeId,
    });
    setTasks(updated);
    setIsRefreshing(false);
  }, [search, status, priority, assigneeId]);

  React.useEffect(() => {
    refreshTasks();
  }, [search, status, priority, assigneeId, refreshTasks]);

  const handleResetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setPriority("ALL");
    setAssigneeId("ALL");
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    const res = await deleteTask(taskId);
    if (res.success) {
      refreshTasks();
    } else {
      alert(res.error || "Failed to delete task.");
    }
  };

  // Metrics breakdown
  const todoCount = tasks.filter((t) => t.status === "TO_DO").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const blockedCount = tasks.filter((t) => t.status === "BLOCKED").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const urgentCount = tasks.filter((t) => t.priority === "URGENT" && t.status !== "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-metallic-steel" />
            Task Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Assign work, log progress updates, manage priority, and monitor status transitions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="shadow-metallic-glow"
        >
          <Plus className="w-4 h-4" /> Create Task
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">To Do</span>
            <span className="text-xl font-bold text-slate-200">{todoCount}</span>
          </div>
          <Clock className="w-5 h-5 text-slate-400 opacity-60" />
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">In Progress</span>
            <span className="text-xl font-bold text-amber-400">{inProgressCount}</span>
          </div>
          <Clock className="w-5 h-5 text-amber-400 opacity-60" />
        </Card>

        <Card className="p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">Blocked</span>
            <span className="text-xl font-bold text-rose-400">{blockedCount}</span>
          </div>
          <AlertCircle className="w-5 h-5 text-rose-400 opacity-60" />
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
            <span className="text-[11px] text-rose-400 block font-medium">Urgent</span>
            <span className="text-xl font-bold text-rose-400">{urgentCount}</span>
          </div>
          <AlertTriangle className="w-5 h-5 text-rose-400 opacity-60 animate-pulse" />
        </Card>
      </div>

      {/* Filter Controls */}
      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        assigneeId={assigneeId}
        onAssigneeChange={setAssigneeId}
        members={members}
        onReset={handleResetFilters}
      />

      {/* Task List */}
      <TaskList
        tasks={tasks}
        currentUserId={currentUserId}
        userRole={userRole}
        onViewTask={(task) => setTaskDetailId(task.id)}
        onEditTask={(task) => setTaskToEdit(task)}
        onDeleteTask={handleDeleteTask}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        members={members}
        projects={projects}
        onTaskCreated={refreshTasks}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        task={taskToEdit}
        members={members}
        projects={projects}
        onTaskUpdated={refreshTasks}
      />

      {/* Task Details Drawer/Modal */}
      <TaskDetailModal
        isOpen={!!taskDetailId}
        onClose={() => setTaskDetailId(null)}
        taskId={taskDetailId}
        onTaskUpdated={refreshTasks}
      />
    </div>
  );
}
