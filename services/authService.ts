// authService.ts - Real authentication service with local storage
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, AuthCredentials, SignUpData, AuthResponse } from '../types';

const JWT_SECRET = 'your-secret-key-change-in-production'; // In production, use environment variable
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Simulated database using localStorage
const DB_USERS_KEY = 'db_users';
const DB_COMPANIES_KEY = 'db_companies';

// Initialize with demo accounts
const initializeDatabase = () => {
  const users = localStorage.getItem(DB_USERS_KEY);
  if (!users) {
    // Create demo admin account
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    const inspectorPasswordHash = bcrypt.hashSync('inspector123', 10);

    const demoUsers = [
      {
        id: 'admin-001',
        email: 'admin@autoinspect.com',
        passwordHash: adminPasswordHash,
        name: 'Admin User',
        role: 'admin' as const,
        plan: 'enterprise' as const,
        companyId: 'company-001',
        companyName: 'Auto Inspect Pro',
        createdAt: new Date().toISOString(),
        isActive: true,
        subscriptionStatus: 'active' as const,
      },
      {
        id: 'inspector-001',
        email: 'inspector@autoinspect.com',
        passwordHash: inspectorPasswordHash,
        name: 'John Inspector',
        role: 'inspector' as const,
        plan: 'pro' as const,
        companyId: 'company-001',
        companyName: 'Auto Inspect Pro',
        createdAt: new Date().toISOString(),
        isActive: true,
        subscriptionStatus: 'active' as const,
      },
    ];

    localStorage.setItem(DB_USERS_KEY, JSON.stringify(demoUsers));
  }
};

// Get all users from localStorage
const getUsers = (): any[] => {
  const users = localStorage.getItem(DB_USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to localStorage
const saveUsers = (users: any[]) => {
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
};

// Generate JWT token
const generateToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Sign up new user
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  initializeDatabase();
  const users = getUsers();

  // Check if user already exists
  const existingUser = users.find((u: any) => u.email === data.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 10);

  // Create new user
  const newUser: any = {
    id: `user-${Date.now()}`,
    email: data.email,
    passwordHash,
    name: data.name,
    role: 'inspector' as const,
    plan: 'free' as const,
    companyName: data.companyName,
    createdAt: new Date().toISOString(),
    isActive: true,
    subscriptionStatus: 'trialing' as const,
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
  };

  users.push(newUser);
  saveUsers(users);

  // Remove password hash from response
  const { passwordHash: _, ...userWithoutPassword } = newUser;
  const user = userWithoutPassword as User;

  const token = generateToken(user);

  // Save to localStorage
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return { user, token };
};

// Login user
export const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  initializeDatabase();
  const users = getUsers();

  // Find user by email
  const userRecord = users.find((u: any) => u.email === credentials.email);
  if (!userRecord) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(credentials.password, userRecord.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  if (!userRecord.isActive) {
    throw new Error('Account is deactivated');
  }

  // Update last login
  userRecord.lastLogin = new Date().toISOString();
  saveUsers(users);

  // Remove password hash from response
  const { passwordHash: _, ...userWithoutPassword } = userRecord;
  const user = userWithoutPassword as User;

  const token = generateToken(user);

  // Save to localStorage
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return { user, token };
};

// Logout user
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);

  if (!token || !userStr) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    logout();
    return null;
  }

  return JSON.parse(userStr);
};

// Update user profile
export const updateProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  const users = getUsers();
  const userIndex = users.findIndex((u: any) => u.id === userId);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update user
  users[userIndex] = { ...users[userIndex], ...updates };
  saveUsers(users);

  const { passwordHash: _, ...userWithoutPassword } = users[userIndex];
  const updatedUser = userWithoutPassword as User;

  // Update localStorage
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

  return updatedUser;
};

// Change password
export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  const users = getUsers();
  const userRecord = users.find((u: any) => u.id === userId);

  if (!userRecord) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, userRecord.passwordHash);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  userRecord.passwordHash = await bcrypt.hash(newPassword, 10);
  saveUsers(users);
};

// Request password reset (sends email in real implementation)
export const requestPasswordReset = async (email: string): Promise<void> => {
  const users = getUsers();
  const user = users.find((u: any) => u.email === email);

  if (!user) {
    // Don't reveal if user exists
    return;
  }

  // In real implementation, send email with reset token
  console.log('Password reset requested for:', email);
  // For demo, we'll just log it
};

// Reset password with token
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  // In real implementation, verify token and reset password
  console.log('Password reset with token:', token);
  // For demo purposes, this is a placeholder
};

// Get all users (admin only)
export const getAllUsers = (): User[] => {
  const users = getUsers();
  return users.map((u: any) => {
    const { passwordHash: _, ...userWithoutPassword } = u;
    return userWithoutPassword as User;
  });
};

// Delete user (admin only)
export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const filteredUsers = users.filter((u: any) => u.id !== userId);
  saveUsers(filteredUsers);
};

// Update user (admin only)
export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  const users = getUsers();
  const userIndex = users.findIndex((u: any) => u.id === userId);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex] = { ...users[userIndex], ...updates };
  saveUsers(users);

  const { passwordHash: _, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword as User;
};
