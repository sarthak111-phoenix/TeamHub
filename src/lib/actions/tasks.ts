"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  addTaskCommentSchema,
} from "@/lib/validation";
import { TaskStatus, TaskPriority, ServerActionResponse } from "@/types";
import { checkRateLimit } from "@/lib/rate-limit";

export interface TaskFilters {
  status?: TaskStatus | "ALL";
  priority?: TaskPriority | "ALL";
  assigneeId?: string | "ALL";
  projectId?: string | "ALL";
  search?: string;
}

/**
 * Fetch all tasks matching optional filters
 */
export async function getTasks(filters: TaskFilters = {}) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const where: any = {};

    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters.priority && filters.priority !== "ALL") {
      where.priority = filters.priority;
    }

    if (filters.assigneeId && filters.assigneeId !== "ALL") {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.projectId && filters.projectId !== "ALL") {
      where.projectId = filters.projectId;
    }

    if (filters.search && filters.search.trim() !== "") {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const tasks = await db.task.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { updatedAt: "desc" },
      ],
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true, clerkId: true, createdAt: true, updatedAt: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true, clerkId: true, createdAt: true, updatedAt: true },
        },
        project: {
          select: { id: true, name: true },
        },
        _count: {
          select: { updates: true, comments: true },
        },
      },
    });

    return tasks;
  } catch (error) {
    console.error("Error in getTasks:", error);
    return [];
  }
}

/**
 * Fetch full task details including updates and comments
 */
export async function getTaskDetails(taskId: string) {
  try {
    const user = await requireAuth();
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true, clerkId: true, createdAt: true, updatedAt: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true, clerkId: true, createdAt: true, updatedAt: true },
        },
        project: {
          select: { id: true, name: true },
        },
        updates: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true, role: true },
            },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true, role: true },
            },
          },
        },
      },
    });

    return task;
  } catch (error) {
    console.error("Error in getTaskDetails:", error);
    return null;
  }
}

/**
 * Create a new Task
 */
export async function createTask(input: unknown): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();

    // Rate Limit Check (20 tasks per minute per user)
    const rl = checkRateLimit(`create_task:${user.id}`, 20, 60000);
    if (!rl.success) {
      return { success: false, error: "Rate limit exceeded. Please wait a minute before creating more tasks." };
    }

    // Server-side Zod validation
    const parsed = createTaskSchema.parse(input);

    // Validate assignee exists if provided
    if (parsed.assigneeId) {
      const assigneeExists = await db.user.findUnique({ where: { id: parsed.assigneeId } });
      if (!assigneeExists) {
        return { success: false, error: "Invalid assignee selected." };
      }
    }

    // Validate project exists if provided
    if (parsed.projectId) {
      const projectExists = await db.project.findUnique({ where: { id: parsed.projectId } });
      if (!projectExists) {
        return { success: false, error: "Invalid project selected." };
      }
    }

    const dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null;
    const completedAt = parsed.status === "COMPLETED" ? new Date() : null;

    const task = await db.task.create({
      data: {
        title: parsed.title.trim(),
        description: parsed.description ? parsed.description.trim() : null,
        priority: parsed.priority,
        status: parsed.status,
        creatorId: user.id,
        assigneeId: parsed.assigneeId || null,
        projectId: parsed.projectId || null,
        dueDate,
        completedAt,
      },
    });

    // Create Activity Record (Server authenticated actor)
    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "TASK",
        entityId: task.id,
        action: "TASK_CREATED",
        details: JSON.stringify({
          title: task.title,
          status: task.status,
          priority: task.priority,
        }),
      },
    });

    // Create Notification for Assignee if assigned to another user
    if (parsed.assigneeId && parsed.assigneeId !== user.id) {
      await db.notification.create({
        data: {
          recipientId: parsed.assigneeId,
          type: "TASK_ASSIGNED",
          title: "New Task Assigned",
          message: `${user.name} assigned task "${task.title}" to you.`,
          link: "/tasks",
        },
      });
    }

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/activity");

    return { success: true, data: task };
  } catch (error: any) {
    console.error("Error in createTask:", error);
    return { success: false, error: error?.message || "Failed to create task." };
  }
}

/**
 * Update an existing task
 */
export async function updateTask(input: unknown): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();

    // Server-side Zod validation
    const parsed = updateTaskSchema.parse(input);

    const existingTask = await db.task.findUnique({ where: { id: parsed.id } });
    if (!existingTask) {
      return { success: false, error: "Task not found." };
    }

    // Authorization check: Admin OR creator OR current assignee
    const isAllowed =
      user.role === "ADMIN" ||
      existingTask.creatorId === user.id ||
      existingTask.assigneeId === user.id;

    if (!isAllowed) {
      return { success: false, error: "Forbidden: You do not have permission to edit this task." };
    }

    // Validate assignee if changed
    if (parsed.assigneeId && parsed.assigneeId !== existingTask.assigneeId) {
      const assigneeExists = await db.user.findUnique({ where: { id: parsed.assigneeId } });
      if (!assigneeExists) {
        return { success: false, error: "Invalid assignee selected." };
      }
    }

    const dueDate = parsed.dueDate ? new Date(parsed.dueDate) : null;
    const isNowCompleted = parsed.status === "COMPLETED";
    const completedAt = isNowCompleted
      ? existingTask.completedAt || new Date()
      : null;

    const updatedTask = await db.task.update({
      where: { id: parsed.id },
      data: {
        title: parsed.title.trim(),
        description: parsed.description ? parsed.description.trim() : null,
        priority: parsed.priority,
        status: parsed.status,
        assigneeId: parsed.assigneeId || null,
        projectId: parsed.projectId || null,
        dueDate,
        completedAt,
      },
    });

    // Activity tracking
    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "TASK",
        entityId: updatedTask.id,
        action: "TASK_UPDATED",
        details: JSON.stringify({
          title: updatedTask.title,
          status: updatedTask.status,
          priority: updatedTask.priority,
        }),
      },
    });

    // Notify new assignee if reassigned
    if (parsed.assigneeId && parsed.assigneeId !== existingTask.assigneeId && parsed.assigneeId !== user.id) {
      await db.notification.create({
        data: {
          recipientId: parsed.assigneeId,
          type: "TASK_REASSIGNED",
          title: "Task Reassigned to You",
          message: `${user.name} assigned task "${updatedTask.title}" to you.`,
          link: "/tasks",
        },
      });
    }

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/activity");

    return { success: true, data: updatedTask };
  } catch (error: any) {
    console.error("Error in updateTask:", error);
    return { success: false, error: error?.message || "Failed to update task." };
  }
}

/**
 * Quick status update with optional progress note
 */
export async function updateTaskStatus(input: unknown): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();

    const parsed = updateTaskStatusSchema.parse(input);

    const existingTask = await db.task.findUnique({ where: { id: parsed.taskId } });
    if (!existingTask) {
      return { success: false, error: "Task not found." };
    }

    // Permission check
    const isAllowed =
      user.role === "ADMIN" ||
      existingTask.creatorId === user.id ||
      existingTask.assigneeId === user.id;

    if (!isAllowed) {
      return { success: false, error: "Forbidden: You cannot change status for this task." };
    }

    const isNowCompleted = parsed.status === "COMPLETED";
    const completedAt = isNowCompleted ? new Date() : null;

    const task = await db.task.update({
      where: { id: parsed.taskId },
      data: {
        status: parsed.status,
        completedAt,
      },
    });

    // Log progress note if provided
    if (parsed.note && parsed.note.trim() !== "") {
      await db.taskUpdate.create({
        data: {
          taskId: task.id,
          authorId: user.id,
          note: parsed.note.trim(),
          statusChange: parsed.status,
        },
      });
    }

    // Activity tracking
    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "TASK",
        entityId: task.id,
        action: "TASK_STATUS_CHANGED",
        details: JSON.stringify({
          title: task.title,
          from: existingTask.status,
          to: task.status,
          note: parsed.note || null,
        }),
      },
    });

    // Notify creator if assignee completed task
    if (isNowCompleted && existingTask.creatorId !== user.id) {
      await db.notification.create({
        data: {
          recipientId: existingTask.creatorId,
          type: "TASK_STATUS_CHANGED",
          title: "Task Completed",
          message: `${user.name} completed task "${task.title}".`,
          link: "/tasks",
        },
      });
    }

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/activity");

    return { success: true, data: task };
  } catch (error: any) {
    console.error("Error in updateTaskStatus:", error);
    return { success: false, error: error?.message || "Failed to update task status." };
  }
}

/**
 * Delete a task (Admin or Task Creator only)
 */
export async function deleteTask(taskId: string): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();

    const existingTask = await db.task.findUnique({ where: { id: taskId } });
    if (!existingTask) {
      return { success: false, error: "Task not found." };
    }

    if (user.role !== "ADMIN" && existingTask.creatorId !== user.id) {
      return { success: false, error: "Forbidden: Only admins or task creators can delete tasks." };
    }

    await db.task.delete({ where: { id: taskId } });

    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "TASK",
        entityId: taskId,
        action: "TASK_DELETED",
        details: JSON.stringify({ title: existingTask.title }),
      },
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/activity");

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteTask:", error);
    return { success: false, error: error?.message || "Failed to delete task." };
  }
}

/**
 * Post a comment on a Task
 */
export async function addTaskComment(input: unknown): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();
    const parsed = addTaskCommentSchema.parse(input);

    const task = await db.task.findUnique({ where: { id: parsed.taskId } });
    if (!task) {
      return { success: false, error: "Task not found." };
    }

    const comment = await db.comment.create({
      data: {
        taskId: parsed.taskId,
        authorId: user.id,
        content: parsed.content.trim(),
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, role: true },
        },
      },
    });

    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "TASK",
        entityId: task.id,
        action: "TASK_COMMENTED",
        details: JSON.stringify({ title: task.title, content: comment.content }),
      },
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");

    return { success: true, data: comment };
  } catch (error: any) {
    console.error("Error in addTaskComment:", error);
    return { success: false, error: error?.message || "Failed to add comment." };
  }
}

/**
 * Fetch all registered members for task assignment dropdowns
 */
export async function getWorkspaceMembers() {
  try {
    return await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    return [];
  }
}

/**
 * Fetch all active projects for project association dropdowns
 */
export async function getWorkspaceProjects() {
  try {
    return await db.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching workspace projects:", error);
    return [];
  }
}
