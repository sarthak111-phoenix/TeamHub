"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateTaskStatus, addTaskComment, getTaskDetails } from "@/lib/actions/tasks";
import { TaskStatus } from "@/types";
import {
  Calendar,
  User as UserIcon,
  Folder,
  MessageSquare,
  History,
  CheckCircle2,
  Send,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export function TaskDetailModal({
  taskId,
  isOpen,
  onClose,
  onTaskUpdated,
}: TaskDetailModalProps) {
  const [task, setTask] = React.useState<any>(null);
  const [isLoadingTask, setIsLoadingTask] = React.useState(false);

  // Status transition state
  const [statusNote, setStatusNote] = React.useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [statusError, setStatusError] = React.useState<string | null>(null);

  // Comment state
  const [activeTab, setActiveTab] = React.useState<"updates" | "comments">("comments");
  const [commentText, setCommentText] = React.useState("");
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);

  const loadTask = React.useCallback(async () => {
    if (!taskId) return;
    setIsLoadingTask(true);
    const data = await getTaskDetails(taskId);
    setTask(data);
    setIsLoadingTask(false);
  }, [taskId]);

  React.useEffect(() => {
    if (isOpen && taskId) {
      loadTask();
      setStatusNote("");
      setCommentText("");
      setStatusError(null);
    }
  }, [isOpen, taskId, loadTask]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!taskId) return;
    setIsUpdatingStatus(true);
    setStatusError(null);

    const res = await updateTaskStatus({
      taskId,
      status: newStatus,
      note: statusNote.trim() ? statusNote.trim() : null,
    });

    setIsUpdatingStatus(false);

    if (res.success) {
      setStatusNote("");
      await loadTask();
      if (onTaskUpdated) onTaskUpdated();
    } else {
      setStatusError(res.error || "Failed to update task status.");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !commentText.trim()) return;

    setIsSubmittingComment(true);

    const res = await addTaskComment({
      taskId,
      content: commentText.trim(),
    });

    setIsSubmittingComment(false);

    if (res.success) {
      setCommentText("");
      await loadTask();
      if (onTaskUpdated) onTaskUpdated();
    }
  };

  if (!isOpen || !taskId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task?.title || "Loading Task Details..."}
      description={task?.project ? `Project: ${task.project.name}` : "Standalone Task"}
    >
      {isLoadingTask && !task ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading task details...</div>
      ) : task ? (
        <div className="space-y-5 text-xs text-gray-200">
          {/* Status & Priority Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-dark-surface rounded-xl border border-dark-border">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-[11px]">STATUS:</span>
              <Badge statusValue={task.status} />
              <span className="text-gray-400 text-[11px] ml-2">PRIORITY:</span>
              <Badge priorityValue={task.priority} />
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-1 text-[11px] text-gray-300">
                <Calendar className="w-3.5 h-3.5 text-metallic-cyan" />
                <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description ? (
            <div className="p-3 bg-dark-card rounded-xl border border-dark-border/80">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                Description
              </span>
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No description provided for this task.</p>
          )}

          {/* Ownership & Assignee Meta */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-2.5 bg-dark-surface rounded-lg border border-dark-border flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-metallic-steel" />
              <div>
                <span className="text-gray-400 block text-[10px]">ASSIGNED TO</span>
                <span className="font-semibold text-white">
                  {task.assignee?.name || "Unassigned"}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-dark-surface rounded-lg border border-dark-border flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <span className="text-gray-400 block text-[10px]">CREATED BY</span>
                <span className="font-semibold text-white">{task.creator?.name || "System"}</span>
              </div>
            </div>
          </div>

          {/* Status Change Controls */}
          <div className="p-3.5 bg-dark-surface/60 rounded-xl border border-dark-border space-y-3">
            <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">
              Quick Status Transition
            </span>

            {statusError && (
              <div className="p-2 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[11px]">
                {statusError}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(["TO_DO", "IN_PROGRESS", "BLOCKED", "COMPLETED"] as TaskStatus[]).map((st) => (
                <Button
                  key={st}
                  variant={task.status === st ? "primary" : "secondary"}
                  size="sm"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(st)}
                  className="text-xs py-1 px-2.5"
                >
                  {st.replace("_", " ")}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Optional progress note for this status change..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-dark-surface text-gray-200 border border-dark-border rounded-lg text-xs focus:outline-none focus:border-metallic-steel"
              />
            </div>
          </div>

          {/* Activity / Comments Tab Control */}
          <div className="space-y-3 pt-2">
            <div className="flex border-b border-dark-border text-xs">
              <button
                onClick={() => setActiveTab("comments")}
                className={`pb-2 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "comments"
                    ? "border-metallic-steel text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comments ({task.comments?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab("updates")}
                className={`pb-2 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "updates"
                    ? "border-metallic-steel text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Progress Log ({task.updates?.length || 0})</span>
              </button>
            </div>

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div className="space-y-3">
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment or update..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-metallic-steel"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isSubmittingComment}
                    disabled={!commentText.trim()}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((c: any) => (
                      <div
                        key={c.id}
                        className="p-3 bg-dark-card rounded-lg border border-dark-border/60 space-y-1"
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
                    <div className="py-6 text-center text-gray-400 text-xs italic">
                      No comments yet. Post the first update above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Updates Log Tab */}
            {activeTab === "updates" && (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {task.updates && task.updates.length > 0 ? (
                  task.updates.map((u: any) => (
                    <div
                      key={u.id}
                      className="p-3 bg-dark-card rounded-lg border border-dark-border/60 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-semibold text-gray-200">
                          {u.author?.name || "Member"}
                        </span>
                        <span>{new Date(u.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-300">{u.note}</p>
                      {u.statusChange && (
                        <div className="inline-block mt-1">
                          <Badge statusValue={u.statusChange} />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-gray-400 text-xs italic">
                    No status log notes recorded yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-rose-400">Failed to load task.</div>
      )}
    </Modal>
  );
}
