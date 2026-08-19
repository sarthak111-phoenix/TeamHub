import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/lib/actions/projects";
import { getWorkspaceMembers } from "@/lib/actions/tasks";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  const projects = await getProjects();
  const members = await getWorkspaceMembers();

  return (
    <ProjectsClient
      initialProjects={projects}
      members={members}
      currentUserId={user?.id}
      userRole={user?.role || "MEMBER"}
    />
  );
}
