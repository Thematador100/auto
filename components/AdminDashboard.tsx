// AdminDashboard.tsx - Comprehensive admin panel
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, AdminDashboardStats, UserPlan } from '../types';
import { getAllUsers, updateUser, deleteUser } from '../services/authService';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'settings'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalInspections: 0,
    revenue: 0,
    revenueGrowth: 0,
    newUsersThisMonth: 0,
    usersByPlan: {},
    recentActivity: [],
  });

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadStats();
    }
  }, [isAdmin]);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const loadStats = () => {
    const allUsers = getAllUsers();
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const usersByPlan = allUsers.reduce((acc, user) => {
      acc[user.plan] = (acc[user.plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const newUsersThisMonth = allUsers.filter(
      u => new Date(u.createdAt) > monthAgo
    ).length;

    // Generate demo activity data
    const recentActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        inspections: Math.floor(Math.random() * 50) + 10,
        reports: Math.floor(Math.random() * 40) + 5,
      };
    }).reverse();

    setStats({
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.isActive).length,
      totalInspections: 1247, // Demo data
      revenue: 12450,
      revenueGrowth: 12.5,
      newUsersThisMonth,
      usersByPlan,
      recentActivity,
    });
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await updateUser(userId, updates);
      loadUsers();
      toast.success('User updated successfully');
      setShowUserModal(false);
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      deleteUser(userId);
      loadUsers();
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to view this page</p>
        </div>
      </div>
    );
  }

  const usersByPlanData = Object.entries(stats.usersByPlan).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-blue-100 mt-1">Manage your platform</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Active Users"
                value={stats.activeUsers}
                icon="✓"
                color="green"
              />
              <StatCard
                title="Total Inspections"
                value={stats.totalInspections}
                icon="🔍"
                color="purple"
              />
              <StatCard
                title="Revenue"
                value={`$${stats.revenue.toLocaleString()}`}
                icon="💰"
                growth={stats.revenueGrowth}
                color="yellow"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Chart */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.recentActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="inspections" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="reports" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Users by Plan */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Users by Plan</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={usersByPlanData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {usersByPlanData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
                + Add User
              </button>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{u.name}</div>
                            <div className="text-sm text-gray-400">{u.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          u.plan === 'enterprise' ? 'bg-purple-900 text-purple-200' :
                          u.plan === 'pro' ? 'bg-blue-900 text-blue-200' :
                          u.plan === 'basic' ? 'bg-green-900 text-green-200' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {u.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          u.isActive ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowUserModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Analytics & Reports</h2>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Inspection Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  />
                  <Legend />
                  <Bar dataKey="inspections" fill="#3b82f6" />
                  <Bar dataKey="reports" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">System Settings</h2>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Platform Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    defaultValue="AI Auto Pro"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    defaultValue="support@autoinspect.com"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setShowUserModal(false)}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  color: string;
  growth?: number;
}> = ({ title, value, icon, color, growth }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {growth !== undefined && (
        <div className={`text-sm mt-2 ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}% from last month
        </div>
      )}
    </div>
  );
};

// User Edit Modal Component
const UserEditModal: React.FC<{
  user: User;
  onClose: () => void;
  onUpdate: (userId: string, updates: Partial<User>) => void;
}> = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    isActive: user.isActive,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(user.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">Edit User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
            >
              <option value="admin">Admin</option>
              <option value="inspector">Inspector</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Plan</label>
            <select
              value={formData.plan}
              onChange={e => setFormData({ ...formData, plan: e.target.value as UserPlan })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2 w-4 h-4"
            />
            <label className="text-sm text-gray-300">Active</label>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
