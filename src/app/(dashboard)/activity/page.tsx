import { getCurrentUser } from "@/lib/auth";
import { getActivities } from "@/lib/actions/activities";
import { getWorkspaceMembers } from "@/lib/actions/tasks";
import { ActivityClient } from "./activity-client";

export default async function ActivityPage() {
  await getCurrentUser();

  const activities = await getActivities({ limit: 50 });
  const members = await getWorkspaceMembers();

  return <ActivityClient initialActivities={activities} members={members} />;
}
