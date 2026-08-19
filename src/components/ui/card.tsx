import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx(
          "metallic-card rounded-xl p-5 text-gray-100 transition-all duration-300",
          className
        )
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge(clsx("flex flex-col gap-1 mb-4", className))} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={twMerge(clsx("text-lg font-semibold text-white tracking-tight", className))}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={twMerge(clsx("text-xs text-gray-400 leading-relaxed", className))} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge(clsx("", className))} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(clsx("mt-4 pt-3 border-t border-dark-border/60 flex items-center justify-between", className))}
      {...props}
    />
  );
}
