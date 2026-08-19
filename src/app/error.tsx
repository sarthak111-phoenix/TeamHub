"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Flame, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] bg-[#070605] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="metallic-card border border-amber-500/30 rounded-2xl p-8 max-w-md w-full flex flex-col items-center gap-4 bg-dark-card/90 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Flame className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Application Exception</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          A server-side connection or configuration error occurred. Please check database & auth configuration or try again.
        </p>
        {error.digest && (
          <code className="text-[10px] font-mono bg-black/60 px-3 py-1.5 rounded border border-amber-500/20 text-amber-300/80">
            Digest ID: {error.digest}
          </code>
        )}
        <Button
          onClick={() => reset()}
          className="mt-2 w-full gap-2 text-xs font-mono uppercase tracking-wider"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </Button>
      </div>
    </div>
  );
}
