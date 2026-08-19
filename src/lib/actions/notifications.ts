"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth, getCurrentUser } from "@/lib/auth";
import { ServerActionResponse } from "@/types";

/**
 * Fetch notifications for authenticated user
 */
export async function getNotifications(limit = 30) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const notifications = await db.notification.findMany({
      where: { recipientId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return notifications;
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return [];
  }
}

/**
 * Get count of unread notifications
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    return await db.notification.count({
      where: { recipientId: user.id, isRead: false },
    });
  } catch (error) {
    console.error("Error in getUnreadNotificationCount:", error);
    return 0;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();

    const existing = await db.notification.findUnique({ where: { id: notificationId } });
    if (!existing) {
      return { success: false, error: "Notification not found." };
    }

    if (existing.recipientId !== user.id) {
      return { success: false, error: "Forbidden: Notification ownership mismatch." };
    }

    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/projects");

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error in markNotificationAsRead:", error);
    return { success: false, error: error?.message || "Failed to mark notification as read." };
  }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsRead(): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();

    await db.notification.updateMany({
      where: { recipientId: user.id, isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/projects");

    return { success: true };
  } catch (error: any) {
    console.error("Error in markAllNotificationsAsRead:", error);
    return { success: false, error: error?.message || "Failed to mark all notifications as read." };
  }
}
