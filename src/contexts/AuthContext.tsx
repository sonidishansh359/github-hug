import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types/auth';

interface StoredUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (role: UserRole) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  selectedRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'foodswift_auth';
const USERS_STORAGE_KEY = 'foodswift_users';

const generateToken = () => {
  return 'token_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getStoredUsers = (): StoredUser[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveStoredUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuthState({
          user: parsed.user,
          token: parsed.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getStoredUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const newUser: StoredUser = {
      email: email.toLowerCase(),
      password,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);

    const user: User = {
      id: `${role}-${Date.now()}`,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };

    const token = generateToken();
    const authData = { user, token };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    setAuthState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });

    return { success: true };
  };

  const login = async (email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getStoredUsers();
    const foundUser = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      // For demo: allow login with any credentials if no users exist
      if (users.length === 0) {
        const user: User = {
          id: `${role}-${Date.now()}`,
          email,
          name: role === 'user' ? 'Demo Customer' : role === 'owner' ? 'Demo Owner' : 'Demo Driver',
          role,
        };
        const token = generateToken();
        const authData = { user, token };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        setAuthState({ user, token, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password' };
    }

    if (foundUser.role !== role) {
      return { success: false, error: `This account is registered as ${foundUser.role === 'user' ? 'Customer' : foundUser.role === 'owner' ? 'Restaurant Owner' : 'Delivery Partner'}` };
    }

    const user: User = {
      id: `${foundUser.role}-${Date.now()}`,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      phone: foundUser.phone,
    };

    const token = generateToken();
    const authData = { user, token };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    setAuthState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });

    return { success: true };
  };

  const googleLogin = async (role: UserRole): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const fakeGoogleUser: User = {
      id: `google-${role}-${Date.now()}`,
      email: `google.user.${Date.now()}@gmail.com`,
      name: 'Google User',
      role,
      avatar: 'https://lh3.googleusercontent.com/a/default-user',
    };

    const token = generateToken();
    const authData = { user: fakeGoogleUser, token };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    setAuthState({
      user: fakeGoogleUser,
      token,
      isAuthenticated: true,
      isLoading: false,
    });

    return true;
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = getStoredUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      // Don't reveal if email exists for security
      return { success: true };
    }

    // In real app, would send email. For demo, just return success
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setSelectedRole(null);
  };

  const setRole = (role: UserRole) => {
    setSelectedRole(role);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        googleLogin,
        resetPassword,
        logout,
        setRole,
        selectedRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}