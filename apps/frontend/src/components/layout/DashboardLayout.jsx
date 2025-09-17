// src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';

export function DashboardLayout({ children }) {
  const { user } = useAuth();
  const role = user?.roles || 'Student';
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header onToggleSidebar={handleToggleSidebar} isOpen={sidebarOpen} />
        <Sidebar userRole={role} isOpen={sidebarOpen} onToggle={handleToggleSidebar} />
        <main
          className={`mt-16 pt-6 pb-16 flex-1 overflow-y-auto px-6 bg-background transition-all duration-300
            ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"} ml-0
          `}
        >
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
