'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type CountryCode = 'INDIA' | 'AMERICA';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  country: CountryCode;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  can: (action: PermissionAction) => boolean;
}

export type PermissionAction = 'checkout' | 'cancelOrder' | 'managePayments' | 'viewAll';

// RBAC permission map
const PERMISSIONS: Record<PermissionAction, Role[]> = {
  checkout:        ['ADMIN', 'MANAGER'],
  cancelOrder:     ['ADMIN', 'MANAGER'],
  managePayments:  ['ADMIN'],
  viewAll:         ['ADMIN'],
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Restore session from cookies on mount
    const savedToken = Cookies.get('slooze_token');
    const savedUser = Cookies.get('slooze_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        Cookies.remove('slooze_token');
        Cookies.remove('slooze_user');
      }
    }
  }, []);

  const login = (token: string, user: AuthUser) => {
    Cookies.set('slooze_token', token, { expires: 7, sameSite: 'strict' });
    Cookies.set('slooze_user', JSON.stringify(user), { expires: 7, sameSite: 'strict' });
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    Cookies.remove('slooze_token');
    Cookies.remove('slooze_user');
    setToken(null);
    setUser(null);
  };

  const can = (action: PermissionAction): boolean => {
    if (!user) return false;
    return PERMISSIONS[action].includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!user, can }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
