"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Bot, User, Info } from "lucide-react";
import { useGameBuilder, type ChatMessage } from "@/context/GameBuilderContext";
import ProgressIndicator from "./ProgressIndicator";
import { cn } from "@/lib/utils";

export default function ChatInterface() {
  const {
    status,
    messages,
    isLoading,
    startNewGame,
    answerClarification,
    resetGame,
  } = useGameBuilder();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (status === "CLARIFYING" && !isLoading) {
      inputRef.current?.focus();
    }
  }, [status, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput("");

    if (status === "IDLE") {
      await startNewGame(trimmed);
    } else if (status === "CLARIFYING") {
      await answerClarification(trimmed);
    }
  };

  const canSendMessage = status === "IDLE" || status === "CLARIFYING";

  const getPlaceholder = () => {
    if (isLoading) return "Processing...";
    if (status === "IDLE") return "Describe your game idea...";
    if (status === "CLARIFYING") return "Answer the questions above...";
    if (status === "COMPLETED") return "Game complete! Start a new game.";
    return "Waiting...";
  };

  const renderMessage = (msg: ChatMessage) => {
    switch (msg.role) {
      case "user":
        return (
          <div key={msg.id} className="flex items-start gap-3 justify-end">
            <div className="max-w-[80%] bg-primary/15 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-3">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>
        );

      case "agent":
        return (
          <div key={msg.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="max-w-[80%] bg-secondary border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>
        );

      case "status":
        return (
          <div key={msg.id} className="flex items-center gap-2 justify-center py-2">
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{msg.content}</span>
          </div>
        );

      case "system":
        return (
          <div
            key={msg.id}
            className="flex items-center gap-2 justify-center py-2"
          >
            <span className="text-xs text-destructive">{msg.content}</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold text-foreground">Chat</h2>
        {status !== "IDLE" && (
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
          >
            <Plus className="w-3.5 h-3.5" />
            New Game
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && status === "IDLE" && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              What game shall we build?
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Describe your game idea and our AI agents will clarify requirements,
              plan the architecture, and generate playable code.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {[
                "Build a snake game",
                "Create a space shooter",
                "Make a puzzle platformer",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(renderMessage)}

        {/* Loading indicator */}
        {isLoading && (
          <ProgressIndicator status={status} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={!canSendMessage || isLoading}
            className={cn(
              "flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors"
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || !canSendMessage || isLoading}
            className={cn(
              "p-2.5 rounded-xl transition-colors shrink-0",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
