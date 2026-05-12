import { useState, useCallback, useEffect } from 'react';
import { AuthContext, type User, type UserRole, normalizeRoles, getPrimaryRole } from './AuthContext';
import { authService } from '../services';

interface AuthProviderProps {
  children: React.ReactNode;
}

function toUser(res: {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    roles?: string[];
    messagingBanned?: boolean;
    messagingOptIn?: boolean;
    isActive?: boolean;
  };
}): User {
  const roles = normalizeRoles(res.user.role, res.user.roles);
  return {
    id: res.user.id,
    email: res.user.email,
    name: res.user.name,
    role: getPrimaryRole(roles),
    roles,
    messagingBanned: res.user.messagingBanned,
    messagingOptIn: res.user.messagingOptIn,
    isActive: res.user.isActive,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void authService.csrf().catch(() => undefined);
    authService
      .getMe()
      .then((res) => setUser(toUser(res)))
      .catch(() => {
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      setUser(toUser(res));
      void authService.csrf().catch(() => undefined);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    void authService.logout().catch(() => undefined);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const res = await authService.getMe();
    setUser(toUser(res));
  }, []);

  const register = useCallback(
    async (data: { email: string; password: string; name: string; role?: UserRole }) => {
      setIsLoading(true);
      try {
        const res = await authService.register({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role === 'admin' ? undefined : (data.role as 'faculty' | 'alumni'),
        });
        if (res.pendingApproval || !res.token) {
          setUser(null);
          return { pendingApproval: true };
        }
        setUser(toUser({ user: res.user }));
        void authService.csrf().catch(() => undefined);
        return { pendingApproval: false };
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshMe,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
