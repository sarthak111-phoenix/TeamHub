import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProjectDetails } from "@/lib/actions/projects";
import { getWorkspaceMembers } from "@/lib/actions/tasks";
import { ProjectDetailClient } from "./project-detail-client";

interface PageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  const project = await getProjectDetails(params.projectId);
  const members = await getWorkspaceMembers();

  if (!project) {
    notFound();
  }

  return (
    <ProjectDetailClient
      project={project}
      members={members}
      currentUserId={user?.id}
      userRole={user?.role || "MEMBER"}
    />
  );
}
