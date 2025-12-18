import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AdminStats {
  users: {
    total: number;
    byType: Record<string, number>;
  };
  inspections: {
    total: number;
  };
}

interface AdminUser {
  id: string;
  email: string;
  user_type: string;
  plan: string;
  license_status: string;
  company_name?: string;
  created_at: string;
}

const SUPABASE_URL = 'https://yupijhwsiqejapufdwhk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cGlqaHdzaXFlamFwdWZkd2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTg3ODksImV4cCI6MjA3OTMzNDc4OX0.MQ1NIAf7i6IDafS0avwYoo2O4DDQ4hLdnlS1nHW_2A4';

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'licenses' | 'territories'>('dashboard');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load stats
            const statsResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin/stats`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Content-Type': 'application/json',
                },
            });

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            // Load users
            const usersResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin/users`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Content-Type': 'application/json',
                },
            });

            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData.users || []);
            }

        } catch (err) {
            console.error('Error loading admin data:', err);
            setError('Failed to load admin data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-light-text">Dashboard Overview</h2>
            
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-medium-text">Loading dashboard data...</p>
                </div>
            ) : error ? (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                    <p className="text-red-400">{error}</p>
                    <button 
                        onClick={loadDashboardData}
                        className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
                            <h3 className="text-sm font-medium text-medium-text">Total Users</h3>
                            <p className="text-3xl font-bold text-light-text mt-2">{stats?.users.total || 0}</p>
                        </div>
                        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
                            <h3 className="text-sm font-medium text-medium-text">Active Inspectors</h3>
                            <p className="text-3xl font-bold text-primary mt-2">{stats?.users.byType?.inspector || 0}</p>
                        </div>
                        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
                            <h3 className="text-sm font-medium text-medium-text">Total Inspections</h3>
                            <p className="text-3xl font-bold text-light-text mt-2">{stats?.inspections.total || 0}</p>
                        </div>
                    </div>

                    {/* User Types Breakdown */}
                    <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
                        <h3 className="text-lg font-semibold text-light-text mb-4">Users by Type</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(stats?.users.byType || {}).map(([type, count]) => (
                                <div key={type} className="text-center">
                                    <p className="text-2xl font-bold text-primary">{count}</p>
                                    <p className="text-sm text-medium-text capitalize">{type}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-light-text">User Management</h2>
                <button className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg">
                    Add New User
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
            ) : (
                <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-dark-bg">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase">License</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-dark-bg">
                                        <td className="px-6 py-4 text-sm text-light-text">{user.email}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-2 py-1 rounded bg-primary/20 text-primary capitalize">
                                                {user.user_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-medium-text capitalize">{user.plan}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded ${
                                                user.license_status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                user.license_status === 'trial' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {user.license_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-medium-text">{user.company_name || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-medium-text">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const renderLicenses = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-light-text">License Tracking</h2>
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
                <p className="text-medium-text">License payment tracking coming soon...</p>
                <p className="text-sm text-medium-text mt-2">$2,997 upfront + $297/month</p>
            </div>
        </div>
    );

    const renderTerritories = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-light-text">Territory Management</h2>
            <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
                <p className="text-medium-text">Geographic exclusivity zones coming soon...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-dark-border">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'dashboard'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-medium-text hover:text-light-text'
                    }`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'users'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-medium-text hover:text-light-text'
                    }`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('licenses')}
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'licenses'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-medium-text hover:text-light-text'
                    }`}
                >
                    Licenses
                </button>
                <button
                    onClick={() => setActiveTab('territories')}
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'territories'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-medium-text hover:text-light-text'
                    }`}
                >
                    Territories
                </button>
            </div>

            {/* Content */}
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'licenses' && renderLicenses()}
            {activeTab === 'territories' && renderTerritories()}
        </div>
    );
};
