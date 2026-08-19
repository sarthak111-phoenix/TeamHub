import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
      primary:
        "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-metallic-glow hover:brightness-110 border border-amber-400/50 active:from-amber-600 active:to-orange-700",
      secondary:
        "bg-dark-card text-amber-100 border border-amber-500/30 hover:bg-dark-hover hover:border-amber-400/60 hover:text-white shadow-sm",
      outline:
        "bg-transparent text-gray-300 border border-dark-border hover:border-amber-500/60 hover:text-amber-400",
      ghost:
        "bg-transparent text-gray-400 hover:text-amber-400 hover:bg-dark-hover/50",
      danger:
        "bg-red-600/80 text-white border border-red-500/40 hover:bg-red-600 hover:border-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-5 py-2.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
