import { useState } from 'react';
import { User } from '../types';

// Mock user for demonstration purposes. In a real app, this would come from an auth service.
const MOCK_USER: User = {
  id: 'user-123',
  email: 'inspector@auto.pro',
  plan: 'pro',
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(MOCK_USER);

  // In a real app, login would involve an API call.
  const login = () => {
    setUser(MOCK_USER);
  };

  // Logout clears the user state.
  const logout = () => {
    setUser(null);
  };

  return { user, login, logout };
};
