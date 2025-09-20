// src/components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Home, Book, GraduationCap, LogOut, Briefcase, Bell, Users, BarChart3, FileText, AlertTriangle, ChevronLeft, ChevronRight, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useState } from 'react';

const navItems = {
  Student: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/student' },
    { label: 'My Courses', icon: GraduationCap, path: '/dashboard/student/courses' },
    { label: 'Library', icon: Book, path: '/dashboard/student/library' },
    { label: 'Placement', icon: Briefcase, path: '/dashboard/student/placement' },
    { label: 'Notices', icon: Bell, path: '/dashboard/student/notices' },
    { label: 'ID Card', icon: GraduationCap, path: '/dashboard/student/idcard' },
    { label: 'Library', icon: Book, path: '/library' },
  ],
  Teacher: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/teacher' },
    { label: 'My Subjects', icon: GraduationCap, path: '/dashboard/teacher/subjects' },
    { label: 'Attendance', icon: Book, path: '/dashboard/teacher/attendance' },
    { label: 'Marks', icon: GraduationCap, path: '/dashboard/teacher/marks' },
    { label: 'Research', icon: Book, path: '/dashboard/teacher/research' },
    { label: 'Profile', icon: GraduationCap, path: '/dashboard/teacher/profile' },
    { label: 'Library', icon: Book, path: '/library/teacher' },
  ],
  Admin: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/admin' },
    { label: 'Manage Students', icon: Users, path: '/dashboard/admin/students' },
    { label: 'Manage Teachers', icon: Users, path: '/dashboard/admin/teachers' },
    { label: 'Analytics', icon: BarChart3, path: '/dashboard/admin/analytics' },
    { label: 'Documents', icon: FileText, path: '/dashboard/admin/docs' },
    { label: 'Library', icon: Book, path: '/library' },
  ],
  Staff: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/staff' },
    { label: 'Notices', icon: Bell, path: '/dashboard/staff/notices' },
    { label: 'Reports', icon: BarChart3, path: '/dashboard/staff/reports' },
    { label: 'Library', icon: Book, path: '/library' },
  ],
  SuperAdmin: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/superadmin' },
    { label: 'Users', icon: Users, path: '/dashboard/superadmin/users' },
    { label: 'System Logs', icon: FileText, path: '/dashboard/superadmin/logs' },
    { label: 'Settings', icon: GraduationCap, path: '/dashboard/superadmin/settings' },
    { label: 'Library', icon: Book, path: '/library' },
  ],
};

export function Sidebar({ userRole, isOpen, onToggle }) {
  const { logout } = useAuth();
  const location = useLocation();
  const items = navItems[userRole] || [];
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(); // Uses existing logout method from AuthContext
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutDialogOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 flex flex-col border-r bg-surface transition-all duration-300
          ${isOpen ? "w-64" : "w-20"} 
          lg:flex
        `}
      >
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 pt-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Tooltip delayDuration={200} disableHoverableContent>
                    <TooltipTrigger asChild>
                      <Link to={item.path}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start gap-3 rounded-md ${!isOpen ? "justify-center p-2" : ""
                            }`}
                        >
                          <Icon className="h-4 w-4" />
                          {isOpen && <span className="text-sm">{item.label}</span>}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    {!isOpen && <TooltipContent side="right">{item.label}</TooltipContent>}
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <Tooltip delayDuration={200} disableHoverableContent>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors ${!isOpen ? "justify-center p-2" : ""
                  }`}
                onClick={() => setIsLogoutDialogOpen(true)}
              >
                <LogOut className="h-4 w-4" />
                {isOpen && <span className="text-sm font-medium">Logout</span>}
              </Button>
            </TooltipTrigger>
            {!isOpen && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </div>
      </div>


      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 flex flex-col bg-surface w-64 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="flex-1 overflow-y-auto p-4 pt-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link to={item.path} onClick={onToggle}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 rounded-md"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout in Mobile */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        </div>
      </div>

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
