"use client";

import { Loader2, Sparkles, Wrench, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionStatus } from "@/context/GameBuilderContext";

interface ProgressIndicatorProps {
  status: SessionStatus;
}

const statusConfig: Record<
  string,
  { icon: typeof Loader2; label: string; sublabel: string; color: string }
> = {
  INIT: {
    icon: Brain,
    label: "Analyzing",
    sublabel: "Understanding your game idea...",
    color: "text-blue-400",
  },
  CLARIFYING: {
    icon: Brain,
    label: "Clarifying",
    sublabel: "Agent is reviewing your answers...",
    color: "text-blue-400",
  },
  PLANNING: {
    icon: Sparkles,
    label: "Planning",
    sublabel: "Designing game architecture & mechanics...",
    color: "text-amber-400",
  },
  BUILDING: {
    icon: Wrench,
    label: "Building",
    sublabel: "Generating HTML, CSS & JavaScript code...",
    color: "text-emerald-400",
  },
};

export default function ProgressIndicator({ status }: ProgressIndicatorProps) {
  const config = statusConfig[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          "bg-primary/10 border border-primary/20"
        )}
      >
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn("w-4 h-4", config.color)} />
          <span className={cn("text-sm font-medium", config.color)}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground animate-pulse-glow">
          {config.sublabel}
        </p>
        {/* Progress dots */}
        <div className="flex gap-1 mt-2">
          {["INIT", "PLANNING", "BUILDING", "COMPLETED"].map((step, i) => {
            const stepOrder = ["INIT", "CLARIFYING", "PLANNING", "BUILDING", "COMPLETED"];
            const currentIdx = stepOrder.indexOf(status);
            const stepIdx = stepOrder.indexOf(step);
            const isActive = stepIdx <= currentIdx;
            return (
              <div
                key={step}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === 0 ? "w-8" : "w-12",
                  isActive ? "bg-primary" : "bg-border"
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
