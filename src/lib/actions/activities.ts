"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export interface ActivityFilters {
  entityType?: "ALL" | "TASK" | "PROJECT";
  actorId?: string | "ALL";
  search?: string;
  limit?: number;
}

/**
 * Fetch chronological activity stream with filtering
 */
export async function getActivities(filters: ActivityFilters = {}) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const where: any = {};

    if (filters.entityType && filters.entityType !== "ALL") {
      where.entityType = filters.entityType;
    }

    if (filters.actorId && filters.actorId !== "ALL") {
      where.actorId = filters.actorId;
    }

    if (filters.search && filters.search.trim() !== "") {
      where.OR = [
        { action: { contains: filters.search, mode: "insensitive" } },
        { details: { contains: filters.search, mode: "insensitive" } },
        { actor: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const activities = await db.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters.limit || 50,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });

    return activities;
  } catch (error) {
    console.error("Error in getActivities:", error);
    return [];
  }
}
