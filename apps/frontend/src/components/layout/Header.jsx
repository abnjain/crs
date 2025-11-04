// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Bell, LogOut, PanelLeftOpen, PanelLeftClose, ArrowLeftToLine, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ConfirmationDialog from '../shared/ConfirmationDialog';

export function Header({ onToggleSidebar, isOpen, onBack = null }) {
  const { user, logout } = useAuth();
  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const photo = user?.profilePhoto && (user.profilePhoto.startsWith('data:image/') || user.profilePhoto.startsWith('http'))
    ? user.profilePhoto
    : '';
  const role = user?.roles ? user.roles[user.roles.length - 1] : 'No Role';
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(); // Uses existing logout method from AuthContext
      navigate('/login', { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutDialogOpen(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between  border-b bg-surface px-6 shadow-sm">
        {/* Toggle Icon — ONE AND ONLY ONE ICON */}
        <div className="flex items-center gap-2">
          {/* Desktop & Mobile: Show correct icon based on state */}
          {onBack ?
            (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={onBack}
              >
                <ArrowLeftToLine className="h-5 w-5" />
              </Button>
            ) :
            (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={onToggleSidebar}
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
              </Button>
            )
          }
          <Tooltip delayDuration={200} disableHoverableContent>
            <TooltipTrigger>
              <Button variant="destructive" size="icon" className="h-8 w-8 rounded-md" onClick={() => setIsLogoutDialogOpen(true)}>
                <LogOut className="h-5 w-5" />
              </Button>
              <TooltipContent side="bottom">Logout</TooltipContent>
            </TooltipTrigger>
          </Tooltip>
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
            <p className="text-xs text-secondText capitalize">{role}</p>
          </div>

          {/* Avatar + ThemeToggle — Always visible */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={photo} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <ThemeToggle />
          </div>
        </div>
      </header>
      {/* Confirmation Dialog for Logout */}
      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        description="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        isLoading={isLoggingOut}
        variant="destructive"
        icon={<AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />}
      />
    </>
  );
}