import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title cannot exceed 120 characters"),
  description: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TO_DO", "IN_PROGRESS", "BLOCKED", "COMPLETED"]).default("TO_DO"),
  assigneeId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
  title: z.string().min(1, "Title is required").max(120, "Title cannot exceed 120 characters"),
  description: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TO_DO", "IN_PROGRESS", "BLOCKED", "COMPLETED"]),
  assigneeId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1, "Task ID required"),
  status: z.enum(["TO_DO", "IN_PROGRESS", "BLOCKED", "COMPLETED"]),
  note: z.string().optional().nullable(),
});

export const addTaskCommentSchema = z.object({
  taskId: z.string().min(1, "Task ID required"),
  content: z.string().min(1, "Comment content cannot be empty").max(1000, "Comment too long"),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(80, "Name cannot exceed 80 characters"),
  description: z.string().optional().nullable(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).default("PLANNING"),
  startDate: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  memberIds: z.array(z.string()).optional(),
});

export const updateProjectSchema = z.object({
  id: z.string().min(1, "Project ID required"),
  name: z.string().min(1, "Project name is required").max(80, "Name cannot exceed 80 characters"),
  description: z.string().optional().nullable(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]),
  startDate: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  memberIds: z.array(z.string()).optional(),
});

export const addProjectMemberSchema = z.object({
  projectId: z.string().min(1, "Project ID required"),
  userId: z.string().min(1, "User ID required"),
});

export const removeProjectMemberSchema = z.object({
  projectId: z.string().min(1, "Project ID required"),
  userId: z.string().min(1, "User ID required"),
});

export const addProjectCommentSchema = z.object({
  projectId: z.string().min(1, "Project ID required"),
  content: z.string().min(1, "Comment content cannot be empty").max(1000, "Comment too long"),
});

export const updateUserProfileSchema = z.object({
  userId: z.string().min(1, "User ID required"),
  name: z.string().min(1, "Name is required").max(60, "Name cannot exceed 60 characters"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().nullable(),
  avatarUrl: z.string().url("Must be a valid image URL").optional().or(z.literal("")).nullable(),
});
