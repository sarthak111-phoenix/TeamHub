import { auth, currentUser as getClerkUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Role } from "@/types";

/**
 * Returns the currently authenticated user from DB, creating a fallback DB record if missing.
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    let dbUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      const clerkUser = await getClerkUser();
      if (!clerkUser) return null;

      const primaryEmail =
        clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || "";

      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "Team Member";
      
      // First registered user becomes ADMIN by default, subsequent users are MEMBERs
      const userCount = await db.user.count();
      const assignedRole: Role = userCount === 0 ? "ADMIN" : "MEMBER";

      dbUser = await db.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail,
          name,
          avatarUrl: clerkUser.imageUrl,
          role: assignedRole,
        },
      });
    }

    return dbUser;
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.message?.includes("DYNAMIC_SERVER_USAGE") || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[getCurrentUser] Error fetching user:", error);
    return null;
  }
}

/**
 * Server-side guard enforcing authentication. Throws if unauthenticated.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required.");
  }
  return user;
}

/**
 * Server-side guard enforcing ADMIN role. Throws if user is not an admin.
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin privileges required.");
  }
  return user;
}
