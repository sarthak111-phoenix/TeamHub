"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export interface HistoryFilters {
  type?: "ALL" | "TASKS" | "PROJECTS";
  search?: string;
}

export interface CompletedHistoryItem {
  id: string;
  type: "TASK" | "PROJECT";
  title: string;
  description?: string | null;
  completedAt: Date;
  completedBy?: string | null;
  projectTitle?: string | null;
  status: string;
  priority?: string | null;
}

/**
 * Fetch permanent completed work archive (completed tasks and projects)
 */
export async function getCompletedHistory(filters: HistoryFilters = {}) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const search = filters.search?.trim().toLowerCase() || "";
    const type = filters.type || "ALL";

    let tasksHistory: CompletedHistoryItem[] = [];
    let projectsHistory: CompletedHistoryItem[] = [];

    // Fetch Completed Tasks
    if (type === "ALL" || type === "TASKS") {
      const taskWhere: any = { status: "COMPLETED" };
      if (search) {
        taskWhere.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const tasks = await db.task.findMany({
        where: taskWhere,
        orderBy: { updatedAt: "desc" },
        include: {
          assignee: { select: { name: true } },
          creator: { select: { name: true } },
          project: { select: { name: true } },
        },
      });

      tasksHistory = tasks.map((t) => ({
        id: t.id,
        type: "TASK" as const,
        title: t.title,
        description: t.description,
        completedAt: t.completedAt || t.updatedAt,
        completedBy: t.assignee?.name || t.creator?.name || "Team Member",
        projectTitle: t.project?.name || null,
        status: t.status,
        priority: t.priority,
      }));
    }

    // Fetch Completed or Archived Projects
    if (type === "ALL" || type === "PROJECTS") {
      const projectWhere: any = {
        status: { in: ["COMPLETED", "ARCHIVED"] },
      };
      if (search) {
        projectWhere.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const projects = await db.project.findMany({
        where: projectWhere,
        orderBy: { updatedAt: "desc" },
        include: {
          owner: { select: { name: true } },
        },
      });

      projectsHistory = projects.map((p) => ({
        id: p.id,
        type: "PROJECT" as const,
        title: p.name,
        description: p.description,
        completedAt: p.updatedAt,
        completedBy: p.owner?.name || "Project Owner",
        projectTitle: null,
        status: p.status,
      }));
    }

    // Combine and sort by completion timestamp descending
    const combined = [...tasksHistory, ...projectsHistory].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    return combined;
  } catch (error) {
    console.error("Error in getCompletedHistory:", error);
    return [];
  }
}
