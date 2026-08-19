"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export interface SearchResultItem {
  id: string;
  type: "TASK" | "PROJECT" | "MEMBER" | "ACTIVITY";
  title: string;
  subtitle?: string | null;
  link: string;
  badge?: string | null;
}

export interface GroupedSearchResults {
  tasks: SearchResultItem[];
  projects: SearchResultItem[];
  members: SearchResultItem[];
  activities: SearchResultItem[];
  totalCount: number;
}

/**
 * Execute authorized multi-entity global search across tasks, projects, members, and activities
 */
export async function globalSearch(query: string): Promise<GroupedSearchResults> {
  const emptyResult: GroupedSearchResults = {
    tasks: [],
    projects: [],
    members: [],
    activities: [],
    totalCount: 0,
  };

  try {
    const user = await getCurrentUser();
    if (!user) return emptyResult;

    // Rate Limit Check (60 searches per minute per user)
    const rl = checkRateLimit(`search:${user.id}`, 60, 60000);
    if (!rl.success) {
      console.warn(`Rate limit exceeded for user ${user.id} on globalSearch`);
      return emptyResult;
    }

    const searchTerm = query?.trim();
    if (!searchTerm || searchTerm.length < 2) {
      return emptyResult;
    }

    // Parallel database queries with limits
    const [tasks, projects, members, activities] = await Promise.all([
      // Tasks search
      db.task.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { project: { select: { name: true } } },
      }),

      // Projects search
      db.project.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { owner: { select: { name: true } } },
      }),

      // Team members search
      db.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            { bio: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { name: "asc" },
      }),

      // Activity logs search
      db.activity.findMany({
        where: {
          OR: [
            { action: { contains: searchTerm, mode: "insensitive" } },
            { details: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true } } },
      }),
    ]);

    const formattedTasks: SearchResultItem[] = tasks.map((t) => ({
      id: t.id,
      type: "TASK",
      title: t.title,
      subtitle: t.project ? `Project: ${t.project.name}` : "Standalone Task",
      link: "/tasks",
      badge: t.priority,
    }));

    const formattedProjects: SearchResultItem[] = projects.map((p) => ({
      id: p.id,
      type: "PROJECT",
      title: p.name,
      subtitle: `Owner: ${p.owner?.name || "System"}`,
      link: `/projects/${p.id}`,
      badge: p.status,
    }));

    const formattedMembers: SearchResultItem[] = members.map((m) => ({
      id: m.id,
      type: "MEMBER",
      title: m.name,
      subtitle: m.email,
      link: `/team/${m.id}`,
      badge: m.role,
    }));

    const formattedActivities: SearchResultItem[] = activities.map((a) => ({
      id: a.id,
      type: "ACTIVITY",
      title: a.action.replace("_", " "),
      subtitle: `By ${a.actor?.name || "System"}`,
      link: "/activity",
      badge: a.entityType,
    }));

    const totalCount =
      formattedTasks.length +
      formattedProjects.length +
      formattedMembers.length +
      formattedActivities.length;

    return {
      tasks: formattedTasks,
      projects: formattedProjects,
      members: formattedMembers,
      activities: formattedActivities,
      totalCount,
    };
  } catch (error) {
    console.error("Error in globalSearch:", error);
    return emptyResult;
  }
}
