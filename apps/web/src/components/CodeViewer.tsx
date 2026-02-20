"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Copy, Check, FileCode2, FileText, Palette } from "lucide-react";
import { useGameBuilder } from "@/context/GameBuilderContext";
import { cn } from "@/lib/utils";
import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

export default function CodeViewer() {
  const { code, plan, status } = useGameBuilder();
  const [activeTab, setActiveTab] = useState("index.html");
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [activeTab, code]);

  const handleDownloadZip = async () => {
    if (!code) return;

    const JSZip = (await import("jszip")).default;

    const zip = new JSZip();
    code.files.forEach((file) => {
      zip.file(file.filename, file.content);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const filename = plan?.title
      ? `${plan.title.replace(/[^a-zA-Z0-9]/g, "_")}.zip`
      : "game.zip";

    // Native download — avoids file-saver saveBlob issues in modern browsers
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const file = code?.files.find((f) => f.filename === activeTab);
    if (!file) return;

    await navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguage = (filename: string) => {
    if (filename.endsWith(".html")) return "markup";
    if (filename.endsWith(".css")) return "css";
    if (filename.endsWith(".js")) return "javascript";
    return "markup";
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith(".html")) return FileCode2;
    if (filename.endsWith(".css")) return Palette;
    if (filename.endsWith(".js")) return FileText;
    return FileCode2;
  };

  const activeFile = code?.files.find((f) => f.filename === activeTab);

  // Empty state
  if (status !== "COMPLETED" || !code) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-4 py-3 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Code</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
              <FileCode2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              No code yet
            </h3>
            <p className="text-xs text-muted-foreground/70">
              Start a conversation to generate game code
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs */}
      <div className="border-b border-border shrink-0">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-1">
            {code.files.map((file) => {
              const Icon = getFileIcon(file.filename);
              return (
                <button
                  key={file.filename}
                  onClick={() => setActiveTab(file.filename)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    activeTab === file.filename
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {file.filename}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownloadZip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Download ZIP
            </button>
          </div>
        </div>
      </div>

      {/* Code display */}
      <div className="flex-1 overflow-auto">
        {activeFile && (
          <pre className="!m-0 !rounded-none !bg-[#0d0d12] min-h-full">
            <code
              ref={codeRef}
              className={`language-${getLanguage(activeFile.filename)}`}
            >
              {activeFile.content}
            </code>
          </pre>
        )}
      </div>

      {/* Footer info */}
      {plan && (
        <div className="px-4 py-2 border-t border-border bg-card/50 shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {plan.title} — {plan.framework === "phaser" ? "Phaser 3" : "Vanilla JS"}
            </span>
            <span>{code.files.length} files</span>
          </div>
        </div>
      )}
    </div>
  );
}
