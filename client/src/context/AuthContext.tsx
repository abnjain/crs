import { createContext, useContext } from 'react';

export type UserRole = 'guest' | 'alumni' | 'faculty' | 'hod' | 'admin' | 'superadmin';

/** Role hierarchy: higher index = higher priority */
export const ROLE_HIERARCHY: UserRole[] = ['guest', 'alumni', 'faculty', 'hod', 'admin', 'superadmin'];

export interface User {
  id: string;
  email: string;
  name: string;
  /** Primary role for display; computed from roles */
  role: UserRole;
  /** All roles the user has (supports multiple roles, e.g. superadmin + hod) */
  roles: UserRole[];
  messagingBanned?: boolean;
  messagingOptIn?: boolean;
  isActive?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }) => Promise<{ pendingApproval: boolean }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/** Get highest-priority role from roles array */
export function getPrimaryRole(roles: UserRole[]): UserRole {
  if (!roles?.length) return 'alumni';
  let highest: UserRole = roles[0];
  for (const r of roles) {
    if (ROLE_HIERARCHY.indexOf(r) > ROLE_HIERARCHY.indexOf(highest)) {
      highest = r;
    }
  }
  return highest;
}

/** Normalize API response: role (string) or roles (string[]) → UserRole[] */
export function normalizeRoles(role?: string, roles?: string[]): UserRole[] {
  if (roles?.length) {
    return roles.filter((r): r is UserRole => ROLE_HIERARCHY.includes(r as UserRole));
  }
  if (role && ROLE_HIERARCHY.includes(role as UserRole)) {
    return [role as UserRole];
  }
  return ['alumni'];
}
