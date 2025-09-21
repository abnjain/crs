// src/components/layout/ModuleLayout.jsx
import React from "react";
import { Header } from "./Header";

export function ModuleLayout({ children, onToggleSidebar, isOpen }) {
  // No sidebar for modules, but keep header toggle if needed in future
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onToggleSidebar={onToggleSidebar} isOpen={isOpen} />
      <main className="mt-16 pt-6 pb-16 flex-1 overflow-y-auto px-6 bg-background">
        {children}
      </main>
    </div>
  );
}