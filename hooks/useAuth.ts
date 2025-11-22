import { useState, useEffect } from 'react';
import { User } from '../types';
import { supabaseService } from '../services/supabaseService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    supabaseService.auth.getCurrentUser().then(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabaseService.auth.onAuthStateChange((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const result = await supabaseService.auth.signUp(email, password);
    setLoading(false);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await supabaseService.auth.signIn(email, password);
    setLoading(false);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    const result = await supabaseService.auth.signInWithOAuth(provider);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await supabaseService.auth.signOut();
    setLoading(false);
    if (result.success) {
      setUser(null);
    }
    return result;
  };

  // Legacy methods for backward compatibility
  const login = () => signIn('demo@autopro.com', 'demo123');
  const logout = () => signOut();

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    login,
    logout
  };
};
