import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

interface PlatformStats {
  totalUsers: number;
  proUsers: number;
  diyUsers: number;
  totalInspections: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

interface UserRecord {
  id: string;
  email: string;
  user_type: string;
  company_name: string;
  plan: string;
  inspection_credits: number;
  subscription_status: string;
  created_at: string;
}

/**
 * Phase 2C: Enterprise Admin Dashboard
 * Platform owner can manage all users, view stats, and oversee operations
 */
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'inspections'>('overview');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pro' | 'diy'>('all');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  // Fetch platform statistics
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/admin/users?type=${filterType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, filterType]);

  // Filter users by search query
  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">🛡️ Admin Panel</h1>
            <span className="text-medium-text text-sm">Platform Management</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-light-text">{user.email}</div>
              <div className="text-xs text-medium-text">Administrator</div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-medium-text hover:text-light-text'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-medium-text hover:text-light-text'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('inspections')}
              className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === 'inspections'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-medium-text hover:text-light-text'
              }`}
            >
              Inspections
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold text-light-text mb-6">Platform Overview</h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-medium-text">Loading statistics...</div>
              </div>
            ) : stats ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Total Users */}
                  <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-medium-text text-sm">Total Users</span>
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="text-3xl font-bold text-light-text">{stats.totalUsers}</div>
                    <div className="text-xs text-medium-text mt-2">
                      {stats.proUsers} Pro • {stats.diyUsers} DIY
                    </div>
                  </div>

                  {/* Total Inspections */}
                  <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-medium-text text-sm">Total Inspections</span>
                      <span className="text-2xl">📋</span>
                    </div>
                    <div className="text-3xl font-bold text-light-text">{stats.totalInspections}</div>
                    <div className="text-xs text-medium-text mt-2">All-time platform total</div>
                  </div>

                  {/* Active Subscriptions */}
                  <div className="bg-dark-card border border-dark-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-medium-text text-sm">Active Subscriptions</span>
                      <span className="text-2xl">💳</span>
                    </div>
                    <div className="text-3xl font-bold text-light-text">{stats.activeSubscriptions}</div>
                    <div className="text-xs text-medium-text mt-2">Pro plan subscribers</div>
                  </div>
                </div>

                {/* Revenue Card */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90 mb-2">Total Revenue (Estimated)</div>
                      <div className="text-4xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                      <div className="text-sm opacity-75 mt-2">Based on current subscriptions & purchases</div>
                    </div>
                    <div className="text-6xl opacity-20">💰</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-light-text mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="bg-dark-card border border-dark-border hover:border-primary rounded-lg p-4 text-left transition-colors"
                    >
                      <div className="text-primary font-semibold mb-1">Manage Users</div>
                      <div className="text-sm text-medium-text">View and manage all platform users</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('inspections')}
                      className="bg-dark-card border border-dark-border hover:border-primary rounded-lg p-4 text-left transition-colors"
                    >
                      <div className="text-primary font-semibold mb-1">View Inspections</div>
                      <div className="text-sm text-medium-text">Monitor all inspection activity</div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-red-400">Failed to load statistics</div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-light-text">User Management</h2>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors text-sm font-semibold"
              >
                Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm text-medium-text mb-2">Search Users</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Email or company name..."
                    className="w-full bg-dark-bg border border-dark-border text-light-text rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm text-medium-text mb-2">Filter by Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full bg-dark-bg border border-dark-border text-light-text rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  >
                    <option value="all">All Users</option>
                    <option value="pro">Pro Inspectors Only</option>
                    <option value="diy">DIY Users Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-medium-text">Loading users...</div>
              </div>
            ) : (
              <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-dark-bg">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-medium-text">User</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-medium-text">Type</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-medium-text">Plan</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-medium-text">Credits</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-medium-text">Status</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-medium-text">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-dark-bg transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-light-text font-medium">{u.email}</div>
                          {u.company_name && (
                            <div className="text-sm text-medium-text">{u.company_name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            u.user_type === 'pro' ? 'bg-blue-900/50 text-blue-300' : 'bg-green-900/50 text-green-300'
                          }`}>
                            {u.user_type?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-medium-text">{u.plan || 'N/A'}</td>
                        <td className="px-6 py-4 text-medium-text">
                          {u.inspection_credits === -1 ? '∞ Unlimited' : u.inspection_credits}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            u.subscription_status === 'active' || u.subscription_status === 'trial'
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-yellow-900/50 text-yellow-300'
                          }`}>
                            {u.subscription_status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-medium-text text-sm">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-medium-text">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Inspections Tab */}
        {activeTab === 'inspections' && (
          <div>
            <h2 className="text-2xl font-bold text-light-text mb-6">All Inspections</h2>
            <div className="bg-dark-card border border-dark-border rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">🚧</div>
              <div className="text-light-text font-semibold mb-2">Coming Soon</div>
              <div className="text-medium-text">
                View and manage all platform inspections across all users
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
