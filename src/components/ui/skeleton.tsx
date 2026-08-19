import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx("skeleton-shimmer rounded-lg bg-dark-card/80 border border-dark-border/40", className)
      )}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="metallic-card rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="mt-4 pt-3 border-t border-dark-border/60 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}
