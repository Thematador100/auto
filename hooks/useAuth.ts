/**
 * Real Supabase Authentication Hook
 * NO MOCKS - Real authentication with Supabase
 */

import { useState, useEffect } from 'react';
import { supabase, db, Profile } from '../services/supabase';
import { User as AuthUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  plan: 'pro' | 'basic';
  full_name?: string;
  role?: 'inspector' | 'admin' | 'manager';
  profile?: Profile;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile from database
  const loadUserProfile = async (authUser: AuthUser) => {
    try {
      const profile = await db.getProfile();

      if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          plan: profile.subscription_plan,
          full_name: profile.full_name || undefined,
          role: profile.role,
          profile,
        });
      } else {
        // Profile doesn't exist yet (shouldn't happen with trigger)
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          plan: 'basic',
        });
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Log activity
      if (data.user) {
        await db.logActivity('user_signup', 'user', data.user.id);
      }

      return { success: true, user: data.user };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Log activity
      if (data.user) {
        await db.logActivity('user_signin', 'user', data.user.id);
      }

      return { success: true, user: data.user };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);

      // Log activity before signing out
      await db.logActivity('user_signout');

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      await db.logActivity('password_updated');
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null);
      const updatedProfile = await db.updateProfile(updates);

      // Update local user state
      if (user && updatedProfile) {
        setUser({
          ...user,
          plan: updatedProfile.subscription_plan,
          full_name: updatedProfile.full_name || undefined,
          role: updatedProfile.role,
          profile: updatedProfile,
        });
      }

      await db.logActivity('profile_updated');
      return { success: true, profile: updatedProfile };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Legacy login function for compatibility
  const login = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  // Legacy logout function for compatibility
  const logout = async () => {
    return await signOut();
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    login, // Legacy
    logout, // Legacy
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated: !!user,
    isPro: user?.plan === 'pro',
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
  };
};
