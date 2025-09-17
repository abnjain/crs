// src/components/layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Bell, LogOut, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function Header({ onToggleSidebar, isOpen }) {
  const { user, logout } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between border-b bg-surface px-6 shadow-sm">
        {/* Toggle Icon — ONE AND ONLY ONE ICON */}
        <div className="flex items-center gap-2">
          {/* Desktop & Mobile: Show correct icon based on state */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={onToggleSidebar}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>
        </div>

        {/* Logo & Title — hidden on mobile, shown on desktop */}
        <div className="hidden md:flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
            CRS
          </div>
          <h1 className="text-xl font-semibold text-text">College Resource System</h1>
        </div>

        {/* Right Side — Always Visible */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>

          {/* User Info — Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-text font-medium">{userName}</span>
            <p className="text-xs text-secondText capitalize">{user?.roles}</p>
          </div>

          {/* Avatar + ThemeToggle — Always visible */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || ''} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}