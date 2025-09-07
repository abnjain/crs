// src/components/layout/DashboardLayout.jsx
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '../shared/ThemeToggle';
import { Sidebar } from './Sidebar';

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user?.roles} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-surface px-6">
          <h1 className="text-xl font-bold">College Repository System</h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
