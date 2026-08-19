import { getCurrentUser } from "@/lib/auth";
import { getTasks, getWorkspaceMembers, getWorkspaceProjects } from "@/lib/actions/tasks";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
  const user = await getCurrentUser();
  const tasks = await getTasks();
  const members = await getWorkspaceMembers();
  const projects = await getWorkspaceProjects();

  return (
    <TasksClient
      initialTasks={tasks}
      members={members}
      projects={projects}
      currentUserId={user?.id}
      userRole={user?.role || "MEMBER"}
    />
  );
}
