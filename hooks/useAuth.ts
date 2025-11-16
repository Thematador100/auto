import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ai-auto-pro-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('ai-auto-pro-user');
      }
    }
    setLoading(false);
  }, []);

  // Login function - accepts email, password, and role
  const login = async (email: string, password: string, role: 'inspector' | 'customer' | 'admin' = 'inspector') => {
    // TODO: Replace with actual API call to backend authentication service
    // For now, we create a user based on the email provided
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      plan: 'pro',
      name: email.split('@')[0],
      role,
    };

    setUser(newUser);
    localStorage.setItem('ai-auto-pro-user', JSON.stringify(newUser));

    return newUser;
  };

  // Logout clears the user state and local storage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('ai-auto-pro-user');
  };

  return { user, login, logout, loading };
};
