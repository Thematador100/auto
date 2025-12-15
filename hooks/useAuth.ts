import { useState, useEffect } from 'react';
import { User } from '../types';

/**
 * Phase 2C: Real authentication hook with API integration
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Parse stored user
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = (token: string, userData: any) => {
    // Store in localStorage (already handled by LoginPage/SignupPage)
    // Just update state
    setUser({
      id: userData.id,
      email: userData.email,
      plan: userData.plan,
      userType: userData.userType,
      companyName: userData.companyName,
      inspectionCredits: userData.inspectionCredits,
      subscriptionStatus: userData.subscriptionStatus,
    });
  };

  // Logout function
  const logout = () => {
    // Clear all storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    // Clear state
    setUser(null);
  };

  return { user, login, logout, isLoading };
};
