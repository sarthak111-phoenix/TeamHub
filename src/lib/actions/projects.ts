"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  removeProjectMemberSchema,
  addProjectCommentSchema,
} from "@/lib/validation";
import { ProjectStatus, ServerActionResponse } from "@/types";

export interface ProjectFilters {
  status?: ProjectStatus | "ALL";
  search?: string;
}

/**
 * Fetch all projects with optional filters
 */
export async function getProjects(filters: ProjectFilters = {}) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const where: any = {};

    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters.search && filters.search.trim() !== "") {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const projects = await db.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatarUrl: true },
            },
          },
        },
        tasks: {
          select: { id: true, status: true },
        },
        _count: {
          select: { tasks: true, members: true },
        },
      },
    });

    return projects;
  } catch (error) {
    console.error("Error in getProjects:", error);
    return [];
  }
}

/**
 * Fetch full single project details
 */
export async function getProjectDetails(projectId: string) {
  try {
    await requireAuth();

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatarUrl: true },
            },
          },
        },
        tasks: {
          orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
          include: {
            assignee: {
              select: { id: true, name: true, avatarUrl: true },
            },
            creator: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true, role: true },
            },
          },
        },
      },
    });

    return project;
  } catch (error) {
    console.error("Error in getProjectDetails:", error);
    return null;
  }
}

/**
 * Create a new Project
 */
export async function createProject(input: unknown): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();

    // Server Zod validation
    const parsed = createProjectSchema.parse(input);

    const startDate = parsed.startDate ? new Date(parsed.startDate) : null;
    const targetDate = parsed.targetDate ? new Date(parsed.targetDate) : null;

    const project = await db.project.create({
      data: {
        name: parsed.name.trim(),
        description: parsed.description ? parsed.description.trim() : null,
        status: parsed.status,
        ownerId: user.id,
        startDate,
        targetDate,
      },
    });

    // Add Owner to ProjectMember table
    const memberSet = new Set<string>();
    memberSet.add(user.id);

    if (parsed.memberIds && parsed.memberIds.length > 0) {
      parsed.memberIds.forEach((id) => memberSet.add(id));
    }

    const memberData = Array.from(memberSet).map((userId) => ({
      projectId: project.id,
      userId,
    }));

    await db.projectMember.createMany({
      data: memberData,
      skipDuplicates: true,
    });

    // Log Activity
    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "PROJECT",
        entityId: project.id,
        action: "PROJECT_CREATED",
        details: JSON.stringify({ name: project.name, status: project.status }),
      },
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath("/activity");

    return { success: true, data: project };
  } catch (error: any) {
    console.error("Error in createProject:", error);
    return { success: false, error: error?.message || "Failed to create project." };
  }
}

/**
 * Update project details
 */
export async function updateProject(input: unknown): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();
    const parsed = updateProjectSchema.parse(input);

    const existingProject = await db.project.findUnique({ where: { id: parsed.id } });
    if (!existingProject) {
      return { success: false, error: "Project not found." };
    }

    // Permission check: Admin or Project Owner
    if (user.role !== "ADMIN" && existingProject.ownerId !== user.id) {
      return { success: false, error: "Forbidden: Only admins or the project owner can edit this project." };
    }

    const startDate = parsed.startDate ? new Date(parsed.startDate) : null;
    const targetDate = parsed.targetDate ? new Date(parsed.targetDate) : null;

    const updatedProject = await db.project.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name.trim(),
        description: parsed.description ? parsed.description.trim() : null,
        status: parsed.status,
        startDate,
        targetDate,
      },
    });

    // Sync member list if provided
    if (parsed.memberIds) {
      const memberSet = new Set<string>();
      memberSet.add(existingProject.ownerId); // Owner always remains member
      parsed.memberIds.forEach((id) => memberSet.add(id));

      // Remove non-selected members
      await db.projectMember.deleteMany({
        where: {
          projectId: updatedProject.id,
          userId: { notIn: Array.from(memberSet) },
        },
      });

      // Add newly selected members
      const memberData = Array.from(memberSet).map((userId) => ({
        projectId: updatedProject.id,
        userId,
      }));

      await db.projectMember.createMany({
        data: memberData,
        skipDuplicates: true,
      });
    }

    // Activity tracking
    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "PROJECT",
        entityId: updatedProject.id,
        action: "PROJECT_UPDATED",
        details: JSON.stringify({ name: updatedProject.name, status: updatedProject.status }),
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${updatedProject.id}`);
    revalidatePath("/dashboard");

    return { success: true, data: updatedProject };
  } catch (error: any) {
    console.error("Error in updateProject:", error);
    return { success: false, error: error?.message || "Failed to update project." };
  }
}

/**
 * Archive a Project
 */
export async function archiveProject(projectId: string): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();

    const existingProject = await db.project.findUnique({ where: { id: projectId } });
    if (!existingProject) {
      return { success: false, error: "Project not found." };
    }

    if (user.role !== "ADMIN" && existingProject.ownerId !== user.id) {
      return { success: false, error: "Forbidden: Only admins or project owners can archive projects." };
    }

    const archivedProject = await db.project.update({
      where: { id: projectId },
      data: { status: "ARCHIVED" },
    });

    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "PROJECT",
        entityId: projectId,
        action: "PROJECT_ARCHIVED",
        details: JSON.stringify({ name: existingProject.name }),
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);

    return { success: true, data: archivedProject };
  } catch (error: any) {
    console.error("Error in archiveProject:", error);
    return { success: false, error: error?.message || "Failed to archive project." };
  }
}

/**
 * Restore an Archived Project
 */
export async function restoreProject(projectId: string): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();

    const existingProject = await db.project.findUnique({ where: { id: projectId } });
    if (!existingProject) {
      return { success: false, error: "Project not found." };
    }

    if (user.role !== "ADMIN" && existingProject.ownerId !== user.id) {
      return { success: false, error: "Forbidden: Only admins or project owners can restore projects." };
    }

    const restoredProject = await db.project.update({
      where: { id: projectId },
      data: { status: "ACTIVE" },
    });

    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "PROJECT",
        entityId: projectId,
        action: "PROJECT_RESTORED",
        details: JSON.stringify({ name: existingProject.name }),
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);

    return { success: true, data: restoredProject };
  } catch (error: any) {
    console.error("Error in restoreProject:", error);
    return { success: false, error: error?.message || "Failed to restore project." };
  }
}

/**
 * Add a member to a project
 */
export async function addProjectMember(input: unknown): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();
    const parsed = addProjectMemberSchema.parse(input);

    const project = await db.project.findUnique({ where: { id: parsed.projectId } });
    if (!project) {
      return { success: false, error: "Project not found." };
    }

    if (user.role !== "ADMIN" && project.ownerId !== user.id) {
      return { success: false, error: "Forbidden: Only admins or project owners can add members." };
    }

    const targetUser = await db.user.findUnique({ where: { id: parsed.userId } });
    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    const membership = await db.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: parsed.projectId,
          userId: parsed.userId,
        },
      },
      update: {},
      create: {
        projectId: parsed.projectId,
        userId: parsed.userId,
      },
    });

    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "PROJECT",
        entityId: project.id,
        action: "PROJECT_MEMBER_ADDED",
        details: JSON.stringify({ projectName: project.name, memberName: targetUser.name }),
      },
    });

    // Notify target user
    if (parsed.userId !== user.id) {
      await db.notification.create({
        data: {
          recipientId: parsed.userId,
          type: "PROJECT_UPDATE",
          title: "Added to Project",
          message: `${user.name} added you to project "${project.name}".`,
          link: `/projects/${project.id}`,
        },
      });
    }

    revalidatePath("/projects");
    revalidatePath(`/projects/${parsed.projectId}`);

    return { success: true, data: membership };
  } catch (error: any) {
    console.error("Error in addProjectMember:", error);
    return { success: false, error: error?.message || "Failed to add member." };
  }
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(input: unknown): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();
    const parsed = removeProjectMemberSchema.parse(input);

    const project = await db.project.findUnique({ where: { id: parsed.projectId } });
    if (!project) {
      return { success: false, error: "Project not found." };
    }

    if (user.role !== "ADMIN" && project.ownerId !== user.id) {
      return { success: false, error: "Forbidden: Only admins or project owners can remove members." };
    }

    if (parsed.userId === project.ownerId) {
      return { success: false, error: "Cannot remove the project owner." };
    }

    await db.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: parsed.projectId,
          userId: parsed.userId,
        },
      },
    });

    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "PROJECT",
        entityId: project.id,
        action: "PROJECT_MEMBER_REMOVED",
        details: JSON.stringify({ projectName: project.name }),
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${parsed.projectId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error in removeProjectMember:", error);
    return { success: false, error: error?.message || "Failed to remove member." };
  }
}

/**
 * Post a comment on a Project
 */
export async function addProjectComment(input: unknown): Promise<ServerActionResponse> {
  try {
    const user = await requireAuth();
    const parsed = addProjectCommentSchema.parse(input);

    const project = await db.project.findUnique({ where: { id: parsed.projectId } });
    if (!project) {
      return { success: false, error: "Project not found." };
    }

    const comment = await db.comment.create({
      data: {
        projectId: parsed.projectId,
        authorId: user.id,
        content: parsed.content.trim(),
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, role: true },
        },
      },
    });

    await db.activity.create({
      data: {
        actorId: user.id,
        entityType: "PROJECT",
        entityId: project.id,
        action: "PROJECT_COMMENTED",
        details: JSON.stringify({ projectName: project.name, content: comment.content }),
      },
    });

    revalidatePath(`/projects/${parsed.projectId}`);

    return { success: true, data: comment };
  } catch (error: any) {
    console.error("Error in addProjectComment:", error);
    return { success: false, error: error?.message || "Failed to add comment." };
  }
}
