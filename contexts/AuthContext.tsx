// AuthContext.tsx - React context for authentication
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthCredentials, SignUpData } from '../types';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials: AuthCredentials) => {
    try {
      const { user } = await authService.login(credentials);
      setUser(user);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      const { user } = await authService.signUp(data);
      setUser(user);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign up failed');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = await authService.updateProfile(user.id, updates);
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signUp,
    logout,
    updateProfile,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
