import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              "w-full px-3.5 py-2 bg-dark-surface text-gray-100 placeholder-gray-500 rounded-lg border border-dark-border text-sm transition-all focus:outline-none focus:border-metallic-steel focus:ring-1 focus:ring-metallic-steel/40 disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/40",
              className
            )
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-gray-400">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
