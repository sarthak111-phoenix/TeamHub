"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { updateUserProfileSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { ServerActionResponse } from "@/types";

/**
 * Fetch complete user profile data with metrics, tasks, projects, and activities
 */
export async function getUserProfile(userId: string) {
  try {
    await requireAuth();

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    // Parallel queries for user stats and items
    const [
      activeTasksCount,
      completedTasksCount,
      activeProjectsCount,
      assignedTasks,
      projectMemberships,
      recentActivities,
    ] = await Promise.all([
      db.task.count({ where: { assigneeId: userId, status: { not: "COMPLETED" } } }),
      db.task.count({ where: { assigneeId: userId, status: "COMPLETED" } }),
      db.projectMember.count({
        where: { userId, project: { status: "ACTIVE" } },
      }),
      db.task.findMany({
        where: { assigneeId: userId, status: { not: "COMPLETED" } },
        orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
        take: 10,
        include: {
          project: { select: { id: true, name: true } },
        },
      }),
      db.projectMember.findMany({
        where: { userId },
        include: {
          project: {
            include: {
              owner: { select: { name: true } },
              _count: { select: { tasks: true, members: true } },
            },
          },
        },
      }),
      db.activity.findMany({
        where: { actorId: userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return {
      user,
      stats: {
        activeTasksCount,
        completedTasksCount,
        activeProjectsCount,
      },
      assignedTasks,
      projects: projectMemberships.map((pm) => pm.project),
      recentActivities,
    };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

/**
 * Update user profile details
 */
export async function updateUserProfile(input: unknown): Promise<ServerActionResponse> {
  try {
    const authUser = await requireAuth();

    // Rate limit profile updates (10 per minute per user)
    const rl = checkRateLimit(`profile_update:${authUser.id}`, 10, 60000);
    if (!rl.success) {
      return { success: false, error: "Too many profile update requests. Please wait a minute." };
    }

    const parsed = updateUserProfileSchema.parse(input);

    // Validate avatarUrl protocol if provided to prevent malicious script injection
    if (parsed.avatarUrl) {
      const url = parsed.avatarUrl.trim().toLowerCase();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return { success: false, error: "Invalid image URL: Only http:// and https:// links are allowed." };
      }
    }

    const targetUser = await db.user.findUnique({ where: { id: parsed.userId } });
    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    // Permission check: User can edit their own profile, or Admin can edit any
    if (authUser.role !== "ADMIN" && authUser.id !== parsed.userId) {
      return { success: false, error: "Forbidden: You can only edit your own profile." };
    }

    const updatedUser = await db.user.update({
      where: { id: parsed.userId },
      data: {
        name: parsed.name.trim(),
        bio: parsed.bio ? parsed.bio.trim() : null,
        avatarUrl: parsed.avatarUrl ? parsed.avatarUrl.trim() : null,
      },
    });

    // Log Activity
    await db.activity.create({
      data: {
        actorId: authUser.id,
        entityType: "USER",
        entityId: updatedUser.id,
        action: "PROFILE_UPDATED",
        details: JSON.stringify({ name: updatedUser.name }),
      },
    });

    revalidatePath("/team");
    revalidatePath(`/team/${updatedUser.id}`);
    revalidatePath("/dashboard");

    return { success: true, data: updatedUser };
  } catch (error: any) {
    console.error("Error in updateUserProfile:", error);
    return { success: false, error: error?.message || "Failed to update profile." };
  }
}
