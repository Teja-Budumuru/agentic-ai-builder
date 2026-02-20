"use client";

import { useEffect } from "react";
import {
  Plus,
  Gamepad2,
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  useGameBuilder,
  type SessionSummary,
} from "@/context/GameBuilderContext";
import { cn } from "@/lib/utils";

interface SessionHistoryProps {
  isOpen: boolean;
}

const statusIcons: Record<string, typeof CheckCircle2> = {
  COMPLETED: CheckCircle2,
  FAILED: XCircle,
  BUILDING: Loader2,
  PLANNING: Loader2,
  CLARIFYING: Clock,
  INIT: Clock,
};

const statusColors: Record<string, string> = {
  COMPLETED: "text-success",
  FAILED: "text-destructive",
  BUILDING: "text-amber-400",
  PLANNING: "text-amber-400",
  CLARIFYING: "text-blue-400",
  INIT: "text-muted-foreground",
};

export default function SessionHistory({ isOpen }: SessionHistoryProps) {
  const { sessions, loadSessions, loadSession, resetGame, sessionId } =
    useGameBuilder();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const getSessionTitle = (session: SessionSummary) => {
    if (session.plan?.title) return session.plan.title;
    return session.prompt.length > 40
      ? session.prompt.slice(0, 40) + "..."
      : session.prompt;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="w-64 border-r border-border bg-card/30 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">History</h2>
          <button
            onClick={resetGame}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Gamepad2 className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No games yet</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => {
              const StatusIcon = statusIcons[session.status] || Clock;
              const statusColor =
                statusColors[session.status] || "text-muted-foreground";
              const isActive = session.id === sessionId;

              return (
                <button
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-colors group",
                    isActive
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-secondary border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <StatusIcon
                      className={cn(
                        "w-4 h-4 shrink-0 mt-0.5",
                        statusColor,
                        ["BUILDING", "PLANNING"].includes(session.status) &&
                          "animate-spin"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-xs font-medium truncate",
                          isActive ? "text-foreground" : "text-foreground/80"
                        )}
                      >
                        {getSessionTitle(session)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDate(session.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
