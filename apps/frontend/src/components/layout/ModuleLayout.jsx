// src/components/layout/ModuleLayout.jsx
import React from "react";
import { Header } from "./Header";

export function ModuleLayout({ children }) {
  const handleBack = () => window.history.length > 1 ? window.history.back() : window.location.href = '/dashboard';

  // No sidebar for modules, but keep header toggle if needed in future
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onBack={handleBack} isOpen={false} />
      <main className="mt-16 pt-6 pb-16 flex-1 overflow-y-auto px-6 bg-background">
        {children}
      </main>
    </div>
  );
}