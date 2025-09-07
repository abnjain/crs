// src/components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Home, Book, GraduationCap, Briefcase, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navItems = {
  Student: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/student' },
    { label: 'My Courses', icon: GraduationCap, path: '/dashboard/student/courses' },
    { label: 'Library', icon: Book, path: '/dashboard/student/library' },
    { label: 'Placement', icon: Briefcase, path: '/dashboard/student/placement' },
    { label: 'Notices', icon: Bell, path: '/dashboard/student/notices' },
  ],
  Teacher: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/teacher' },
    { label: 'My Subjects', icon: GraduationCap, path: '/dashboard/teacher/subjects' },
    { label: 'Attendance', icon: Book, path: '/dashboard/teacher/attendance' },
    { label: 'Marks', icon: GraduationCap, path: '/dashboard/teacher/marks' },
  ],
  Admin: [
    { label: 'Dashboard', icon: Home, path: '/dashboard/admin' },
    { label: 'Manage Students', icon: GraduationCap, path: '/dashboard/admin/students' },
    { label: 'Manage Teachers', icon: GraduationCap, path: '/dashboard/admin/teachers' },
    { label: 'Analytics', icon: Book, path: '/dashboard/admin/analytics' },
  ]
};

export function Sidebar({ userRole }) {
  const { logout } = useAuth();
  const location = useLocation();
  const items = navItems[userRole] || navItems.Student;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-surface">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">CRS</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start gap-2 text-red-500" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}