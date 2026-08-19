import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Role, TaskPriority, TaskStatus, ProjectStatus } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "admin" | "member" | "priority" | "status";
  roleValue?: Role;
  priorityValue?: TaskPriority;
  statusValue?: TaskStatus | ProjectStatus;
}

export function Badge({
  className,
  variant = "default",
  roleValue,
  priorityValue,
  statusValue,
  children,
  ...props
}: BadgeProps) {
  let badgeStyles = "px-2.5 py-0.5 text-xs font-semibold rounded-full border inline-flex items-center gap-1.5";

  if (roleValue) {
    if (roleValue === "ADMIN") {
      badgeStyles = clsx(badgeStyles, "metallic-badge-admin");
    } else {
      badgeStyles = clsx(badgeStyles, "metallic-badge-member");
    }
  } else if (priorityValue) {
    const priorityColors = {
      LOW: "bg-stone-900/60 border-stone-700/40 text-stone-300",
      MEDIUM: "bg-amber-950/60 border-amber-500/40 text-amber-300",
      HIGH: "bg-orange-950/60 border-orange-500/40 text-orange-300",
      URGENT: "bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse",
    };
    badgeStyles = clsx(badgeStyles, priorityColors[priorityValue]);
  } else if (statusValue) {
    const statusColors = {
      TO_DO: "bg-stone-800/80 border-stone-600/40 text-stone-300",
      IN_PROGRESS: "bg-amber-950/80 border-amber-500/50 text-amber-300",
      BLOCKED: "bg-rose-950/80 border-rose-500/40 text-rose-300",
      COMPLETED: "bg-emerald-950/80 border-emerald-500/40 text-emerald-300",
      PLANNING: "bg-stone-900/80 border-amber-700/40 text-amber-200/80",
      ACTIVE: "bg-orange-950/80 border-orange-500/40 text-orange-300",
      ON_HOLD: "bg-amber-950/80 border-amber-500/40 text-amber-300",
      ARCHIVED: "bg-stone-900/80 border-stone-700/40 text-stone-400",
    };
    badgeStyles = clsx(badgeStyles, statusColors[statusValue]);
  } else {
    badgeStyles = clsx(badgeStyles, "bg-dark-card border-dark-border text-gray-300");
  }

  return (
    <span className={twMerge(clsx(badgeStyles, className))} {...props}>
      {children || roleValue || priorityValue || statusValue}
    </span>
  );
}
