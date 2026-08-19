import * as React from "react";
import Image from "next/image";
import { clsx } from "clsx";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  tagline?: string;
  className?: string;
}

export function Logo({
  size = "md",
  showText = true,
  tagline = "CORPORATE GROUP",
  className,
}: LogoProps) {
  const sizeMap = {
    sm: { container: "w-8 h-8", image: 32, title: "text-sm", tag: "text-[9px]" },
    md: { container: "w-10 h-10", image: 40, title: "text-base", tag: "text-[10px]" },
    lg: { container: "w-12 h-12", image: 48, title: "text-lg", tag: "text-[11px]" },
    xl: { container: "w-16 h-16", image: 64, title: "text-2xl", tag: "text-xs" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={clsx("flex items-center gap-3 select-none", className)}>
      <div
        className={clsx(
          "relative rounded-xl overflow-hidden flex items-center justify-center p-0.5 bg-gradient-to-br from-amber-500/30 via-orange-600/40 to-amber-700/20 border border-amber-500/40 shadow-metallic-glow flex-shrink-0 group hover:border-amber-400 transition-all",
          currentSize.container
        )}
      >
        <Image
          src="/logo.png"
          alt="PS Phoenix Logo"
          width={currentSize.image}
          height={currentSize.image}
          className="object-contain w-full h-full drop-shadow-md group-hover:scale-105 transition-transform duration-200"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={clsx(
                "font-extrabold tracking-tight text-white uppercase font-mono bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent",
                currentSize.title
              )}
            >
              PS PHOENIX
            </span>
          </div>
          {tagline && (
            <span
              className={clsx(
                "uppercase font-mono text-amber-500/90 tracking-widest block font-medium",
                currentSize.tag
              )}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
