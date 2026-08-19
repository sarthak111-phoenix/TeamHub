import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TeamClient } from "./team-client";

export default async function TeamPage() {
  const currentUser = await getCurrentUser();

  const members = await db.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          assignedTasks: true,
          projectMemberships: true,
        },
      },
    },
  });

  return (
    <TeamClient
      initialMembers={members}
      currentUserId={currentUser?.id}
      userRole={currentUser?.role || "MEMBER"}
    />
  );
}
