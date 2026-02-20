"use client";

import { useState } from "react";
import { GameBuilderProvider } from "@/context/GameBuilderContext";
import Navbar from "@/components/Navbar";
import SessionHistory from "@/components/SessionHistory";
import ChatInterface from "@/components/ChatInterface";
import CodeViewer from "@/components/CodeViewer";

export default function BuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <GameBuilderProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Session History Sidebar */}
          <SessionHistory isOpen={sidebarOpen} />

          {/* Main content area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Chat Panel */}
            <div className="w-full lg:w-[40%] border-r border-border flex flex-col overflow-hidden">
              <ChatInterface />
            </div>

            {/* Code Panel - hidden on mobile, shown on lg+ */}
            <div className="hidden lg:flex lg:w-[60%] flex-col overflow-hidden">
              <CodeViewer />
            </div>
          </div>
        </div>
      </div>
    </GameBuilderProvider>
  );
}
