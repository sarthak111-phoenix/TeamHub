export type Role = "ADMIN" | "MEMBER";

export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";

export type TaskStatus = "TO_DO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_REASSIGNED"
  | "TASK_STATUS_CHANGED"
  | "DEADLINE_APPROACHING"
  | "PROJECT_UPDATE"
  | "MENTION";

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  creatorId: string;
  assigneeId?: string | null;
  projectId?: string | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignee?: UserProfile | null;
  creator?: UserProfile;
  project?: {
    id: string;
    name: string;
  } | null;
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  ownerId: string;
  startDate?: Date | null;
  targetDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  owner?: UserProfile;
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface ActivityItem {
  id: string;
  actorId: string;
  entityType: "TASK" | "PROJECT" | "USER";
  entityId: string;
  action: string;
  details?: string | null;
  createdAt: Date;
  actor?: UserProfile;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string | null;
  createdAt: Date;
}

export interface ServerActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
