"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

// Types matching the backend
interface ClarificationResponse {
  questions: string[];
  isSufficient: boolean;
  summary: string;
  confidence: number;
}

interface PlanResponse {
  title: string;
  description: string;
  framework: "vanilla" | "phaser";
  mechanics: { name: string; description: string }[];
  controls: { input: string; action: string }[];
  systems: string[];
  assetDescriptions: string[];
  gameLoopDescription: string;
}

interface CodeFile {
  filename: string;
  content: string;
  type: string;
}

interface BuildResponse {
  files: CodeFile[];
  entryPoint: string;
}

export type SessionStatus =
  | "IDLE"
  | "INIT"
  | "CLARIFYING"
  | "PLANNING"
  | "BUILDING"
  | "COMPLETED"
  | "FAILED";

export interface ChatMessage {
  id: string;
  role: "user" | "system" | "agent" | "status";
  content: string;
  timestamp: Date;
  data?: ClarificationResponse | PlanResponse | BuildResponse;
}

export interface SessionSummary {
  id: string;
  prompt: string;
  status: string;
  createdAt: string;
  plan?: PlanResponse | null;
}

interface GameBuilderState {
  sessionId: string | null;
  status: SessionStatus;
  messages: ChatMessage[];
  clarification: ClarificationResponse | null;
  plan: PlanResponse | null;
  code: BuildResponse | null;
  error: string | null;
  isLoading: boolean;
  sessions: SessionSummary[];
}

interface GameBuilderContextType extends GameBuilderState {
  startNewGame: (prompt: string) => Promise<void>;
  answerClarification: (answer: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  resetGame: () => void;
}

const GameBuilderContext = createContext<GameBuilderContextType | null>(null);

export function useGameBuilder() {
  const ctx = useContext(GameBuilderContext);
  if (!ctx) throw new Error("useGameBuilder must be used within GameBuilderProvider");
  return ctx;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function GameBuilderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameBuilderState>({
    sessionId: null,
    status: "IDLE",
    messages: [],
    clarification: null,
    plan: null,
    code: null,
    error: null,
    isLoading: false,
    sessions: [],
  });

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPollingRef = useRef(false);
  // Stable ref so polling callbacks can refresh sessions without circular deps
  const loadSessionsRef = useRef<() => Promise<void>>(async () => {});

  const addMessage = useCallback(
    (role: ChatMessage["role"], content: string, data?: ChatMessage["data"]) => {
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { id: generateId(), role, content, timestamp: new Date(), data },
        ],
      }));
    },
    []
  );

  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const callChatApi = useCallback(
    async (body: { sessionId?: string; message?: string; prompt?: string }) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }

      return res.json();
    },
    []
  );

  const processResponse = useCallback(
    (result: { type: string; data: unknown; sessionId: string }) => {
      const { type, data, sessionId } = result;

      setState((prev) => ({ ...prev, sessionId, isLoading: false }));

      switch (type) {
        case "INIT":
        case "CLARIFYING": {
          const clarification = data as ClarificationResponse;
          if (clarification.isSufficient) {
            setState((prev) => ({
              ...prev,
              status: "PLANNING",
              clarification,
            }));
            addMessage("status", "Requirements clarified! Planning your game...");
            // Auto-poll for planning
            pollNext(sessionId);
          } else {
            setState((prev) => ({
              ...prev,
              status: "CLARIFYING",
              clarification,
            }));
            const questionsText = clarification.questions
              .map((q, i) => `${i + 1}. ${q}`)
              .join("\n");
            addMessage(
              "agent",
              `I need a few clarifications to build your game:\n\n${questionsText}`,
              clarification
            );
          }
          break;
        }

        case "PLANNING": {
          const plan = data as PlanResponse;
          setState((prev) => ({
            ...prev,
            status: "BUILDING",
            plan,
          }));
          addMessage(
            "status",
            `Plan ready: "${plan.title}" — Now generating code...`
          );
          // Auto-poll for building
          pollNext(sessionId);
          break;
        }

        case "CODING": {
          const code = data as BuildResponse;
          setState((prev) => ({
            ...prev,
            status: "COMPLETED",
            code,
          }));
          addMessage(
            "agent",
            `Your game is ready! ${code.files.length} files generated. Check the Code tab to view and download.`,
            code
          );
          stopPolling();
          break;
        }

        case "COMPLETED": {
          const code = data as BuildResponse;
          setState((prev) => ({
            ...prev,
            status: "COMPLETED",
            code,
          }));
          stopPolling();
          break;
        }

        case "ERROR": {
          setState((prev) => ({
            ...prev,
            status: "FAILED",
            error: data as string,
          }));
          addMessage("system", `Error: ${data}`);
          stopPolling();
          break;
        }
      }
    },
    [addMessage, stopPolling]
  );

  const pollNext = useCallback(
    (sessionId: string) => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      const doPoll = async () => {
        if (!isPollingRef.current) return;
        try {
          setState((prev) => ({ ...prev, isLoading: true }));
          const result = await callChatApi({ sessionId });
          // Reset BEFORE processResponse so chained pollNext calls inside it succeed
          isPollingRef.current = false;
          pollingRef.current = null;
          processResponse(result);
          // Refresh sidebar after every poll cycle (status may have changed)
          void loadSessionsRef.current();
        } catch (err) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            status: "FAILED",
            error: err instanceof Error ? err.message : "Unknown error",
          }));
          addMessage(
            "system",
            `Error: ${err instanceof Error ? err.message : "Unknown error"}`
          );
          stopPolling();
        }
      };

      // 2-second delay to allow the backend to process
      pollingRef.current = setTimeout(doPoll, 2000);
    },
    [callChatApi, processResponse, addMessage, stopPolling]
  );

  const startNewGame = useCallback(
    async (prompt: string) => {
      stopPolling();
      setState((prev) => ({
        ...prev,
        sessionId: null,
        status: "INIT",
        messages: [],
        clarification: null,
        plan: null,
        code: null,
        error: null,
        isLoading: true,
      }));

      addMessage("user", prompt);
      addMessage("status", "Analyzing your game idea...");

      try {
        const result = await callChatApi({ prompt });
        processResponse(result);
        // Refresh sidebar to show the newly created session
        void loadSessionsRef.current();
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          status: "FAILED",
          error: err instanceof Error ? err.message : "Unknown error",
        }));
        addMessage(
          "system",
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    },
    [callChatApi, processResponse, addMessage, stopPolling]
  );

  const answerClarification = useCallback(
    async (answer: string) => {
      if (!state.sessionId) return;

      addMessage("user", answer);
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const result = await callChatApi({
          sessionId: state.sessionId,
          message: answer,
        });
        processResponse(result);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          status: "FAILED",
          error: err instanceof Error ? err.message : "Unknown error",
        }));
        addMessage(
          "system",
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    },
    [state.sessionId, callChatApi, processResponse, addMessage]
  );

  const loadSession = useCallback(
    async (sessionId: string) => {
      stopPolling();
      setState((prev) => ({
        ...prev,
        sessionId,
        status: "INIT",
        messages: [],
        clarification: null,
        plan: null,
        code: null,
        error: null,
        isLoading: true,
      }));

      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (!res.ok) throw new Error("Failed to load session");
        const session = await res.json();

        const messages: ChatMessage[] = [];
        messages.push({
          id: generateId(),
          role: "user",
          content: session.prompt,
          timestamp: new Date(session.createdAt),
        });

        if (session.clarification) {
          const clar = session.clarification as ClarificationResponse;
          if (clar.questions?.length) {
            messages.push({
              id: generateId(),
              role: "agent",
              content: clar.questions.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n"),
              timestamp: new Date(session.createdAt),
              data: clar,
            });
          }
        }

        if (session.plan) {
          const plan = session.plan as PlanResponse;
          messages.push({
            id: generateId(),
            role: "status",
            content: `Plan: "${plan.title}"`,
            timestamp: new Date(session.createdAt),
          });
        }

        let status: SessionStatus = session.status as SessionStatus;
        if (status === "BUILDING") status = "BUILDING";

        if (session.code && session.status === "COMPLETED") {
          messages.push({
            id: generateId(),
            role: "agent",
            content: `Game completed! ${(session.code as BuildResponse).files.length} files generated.`,
            timestamp: new Date(session.createdAt),
            data: session.code as BuildResponse,
          });
        }

        setState((prev) => ({
          ...prev,
          sessionId,
          status: status === "INIT" ? "IDLE" : status,
          messages,
          clarification: (session.clarification as ClarificationResponse) || null,
          plan: (session.plan as PlanResponse) || null,
          code: session.status === "COMPLETED" ? (session.code as BuildResponse) : null,
          error: session.error || null,
          isLoading: false,
        }));

        // If session is in-progress, resume polling
        if (["PLANNING", "BUILDING"].includes(session.status)) {
          pollNext(sessionId);
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    },
    [stopPolling, pollNext]
  );

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      if (!res.ok) return;
      const data = await res.json();
      setState((prev) => ({ ...prev, sessions: data }));
    } catch {
      // silently fail
    }
  }, []);

  // Keep ref current so polling callbacks always call latest loadSessions
  loadSessionsRef.current = loadSessions;

  const resetGame = useCallback(() => {
    stopPolling();
    setState((prev) => ({
      ...prev,
      sessionId: null,
      status: "IDLE",
      messages: [],
      clarification: null,
      plan: null,
      code: null,
      error: null,
      isLoading: false,
    }));
  }, [stopPolling]);

  return (
    <GameBuilderContext.Provider
      value={{
        ...state,
        startNewGame,
        answerClarification,
        loadSession,
        loadSessions,
        resetGame,
      }}
    >
      {children}
    </GameBuilderContext.Provider>
  );
}
