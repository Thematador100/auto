import React, { useState, useMemo } from 'react';
import { AdminUser, SystemStats, ActivityLog, CompletedReport } from '../types';

// Mock data for demonstration
const generateMockUsers = (): AdminUser[] => {
    return [
        {
            id: 'user-001',
            email: 'john.smith@example.com',
            plan: 'pro',
            joinDate: '2024-01-15',
            lastActive: '2025-12-11',
            reportsCompleted: 47,
            status: 'active',
        },
        {
            id: 'user-002',
            email: 'sarah.johnson@example.com',
            plan: 'pro',
            joinDate: '2024-03-22',
            lastActive: '2025-12-12',
            reportsCompleted: 32,
            status: 'active',
        },
        {
            id: 'user-003',
            email: 'mike.wilson@example.com',
            plan: 'basic',
            joinDate: '2024-06-10',
            lastActive: '2025-11-28',
            reportsCompleted: 8,
            status: 'active',
        },
        {
            id: 'user-004',
            email: 'emily.davis@example.com',
            plan: 'pro',
            joinDate: '2024-02-05',
            lastActive: '2025-10-15',
            reportsCompleted: 15,
            status: 'inactive',
        },
        {
            id: 'user-005',
            email: 'robert.brown@example.com',
            plan: 'basic',
            joinDate: '2024-08-18',
            lastActive: '2025-12-10',
            reportsCompleted: 5,
            status: 'active',
        },
    ];
};

const generateMockStats = (): SystemStats => {
    return {
        totalUsers: 124,
        activeUsers: 98,
        totalReports: 1456,
        reportsThisMonth: 87,
        revenue: 24680,
        revenueThisMonth: 2940,
    };
};

const generateMockActivityLogs = (): ActivityLog[] => {
    return [
        {
            id: 'log-001',
            timestamp: '2025-12-12 14:23:15',
            userId: 'user-002',
            userEmail: 'sarah.johnson@example.com',
            action: 'Report Generated',
            details: 'Completed inspection for VIN: 1HGCM82633A123456',
        },
        {
            id: 'log-002',
            timestamp: '2025-12-12 13:45:30',
            userId: 'user-001',
            userEmail: 'john.smith@example.com',
            action: 'User Login',
            details: 'Successful login from IP: 192.168.1.1',
        },
        {
            id: 'log-003',
            timestamp: '2025-12-12 12:10:22',
            userId: 'user-005',
            userEmail: 'robert.brown@example.com',
            action: 'Report Generated',
            details: 'Completed inspection for VIN: JH4KA7532NC000123',
        },
        {
            id: 'log-004',
            timestamp: '2025-12-12 11:05:18',
            userId: 'user-003',
            userEmail: 'mike.wilson@example.com',
            action: 'Plan Upgraded',
            details: 'Upgraded from Basic to Pro plan',
        },
        {
            id: 'log-005',
            timestamp: '2025-12-12 10:30:45',
            userId: 'user-002',
            userEmail: 'sarah.johnson@example.com',
            action: 'Diagnostics Run',
            details: 'OBD-II scan performed, 2 codes found',
        },
    ];
};

type AdminTab = 'overview' | 'users' | 'reports' | 'activity' | 'settings';

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlanFilter, setSelectedPlanFilter] = useState<'all' | 'pro' | 'basic'>('all');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

    const users = useMemo(() => generateMockUsers(), []);
    const stats = useMemo(() => generateMockStats(), []);
    const activityLogs = useMemo(() => generateMockActivityLogs(), []);

    // Filter users based on search and filters
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = selectedPlanFilter === 'all' || user.plan === selectedPlanFilter;
        const matchesStatus = selectedStatusFilter === 'all' || user.status === selectedStatusFilter;
        return matchesSearch && matchesPlan && matchesStatus;
    });

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Stats Cards */}
                <div className="bg-dark-bg p-6 rounded-lg border border-dark-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-medium-text">Total Users</p>
                            <p className="text-3xl font-bold text-light-text mt-2">{stats.totalUsers}</p>
                            <p className="text-xs text-green-500 mt-1">
                                {stats.activeUsers} active
                            </p>
                        </div>
                        <div className="text-4xl">👥</div>
                    </div>
                </div>

                <div className="bg-dark-bg p-6 rounded-lg border border-dark-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-medium-text">Total Reports</p>
                            <p className="text-3xl font-bold text-light-text mt-2">{stats.totalReports}</p>
                            <p className="text-xs text-green-500 mt-1">
                                +{stats.reportsThisMonth} this month
                            </p>
                        </div>
                        <div className="text-4xl">📊</div>
                    </div>
                </div>

                <div className="bg-dark-bg p-6 rounded-lg border border-dark-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-medium-text">Revenue</p>
                            <p className="text-3xl font-bold text-light-text mt-2">
                                ${stats.revenue.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-500 mt-1">
                                +${stats.revenueThisMonth.toLocaleString()} this month
                            </p>
                        </div>
                        <div className="text-4xl">💰</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-dark-bg p-6 rounded-lg border border-dark-border">
                <h3 className="text-lg font-semibold text-light-text mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                        Add User
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors">
                        Export Data
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors">
                        View Analytics
                    </button>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors">
                        System Settings
                    </button>
                </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="bg-dark-bg p-6 rounded-lg border border-dark-border">
                <h3 className="text-lg font-semibold text-light-text mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {activityLogs.slice(0, 3).map(log => (
                        <div key={log.id} className="flex items-start space-x-3 p-3 bg-dark-card rounded border border-dark-border">
                            <div className="flex-shrink-0 text-2xl">
                                {log.action.includes('Login') ? '🔐' :
                                 log.action.includes('Report') ? '📄' :
                                 log.action.includes('Upgrade') ? '⬆️' : '🔧'}
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-medium text-light-text">{log.action}</p>
                                <p className="text-xs text-medium-text">{log.userEmail}</p>
                                <p className="text-xs text-medium-text mt-1">{log.details}</p>
                            </div>
                            <div className="text-xs text-medium-text">{log.timestamp}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Search by email or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-dark-card border border-dark-border rounded text-light-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={selectedPlanFilter}
                        onChange={(e) => setSelectedPlanFilter(e.target.value as any)}
                        className="px-4 py-2 bg-dark-card border border-dark-border rounded text-light-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Plans</option>
                        <option value="pro">Pro</option>
                        <option value="basic">Basic</option>
                    </select>
                    <select
                        value={selectedStatusFilter}
                        onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                        className="px-4 py-2 bg-dark-card border border-dark-border rounded text-light-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-dark-bg rounded-lg border border-dark-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-dark-card">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">
                                    User ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">
                                    Reports
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">
                                    Last Active
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-dark-card transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text">
                                        {user.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                                            user.plan === 'pro'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-600 text-white'
                                        }`}>
                                            {user.plan.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                                            user.status === 'active'
                                                ? 'bg-green-600 text-white'
                                                : user.status === 'inactive'
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-red-600 text-white'
                                        }`}>
                                            {user.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text">
                                        {user.reportsCompleted}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">
                                        {user.lastActive}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button className="text-blue-500 hover:text-blue-400 mr-3">
                                            Edit
                                        </button>
                                        <button className="text-red-500 hover:text-red-400">
                                            Suspend
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-medium-text">
                        No users found matching your criteria
                    </div>
                )}
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="bg-dark-bg p-6 rounded-lg border border-dark-border">
            <h3 className="text-lg font-semibold text-light-text mb-4">Reports Management</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-dark-card p-4 rounded border border-dark-border">
                        <p className="text-sm text-medium-text">Reports Today</p>
                        <p className="text-2xl font-bold text-light-text mt-1">12</p>
                    </div>
                    <div className="bg-dark-card p-4 rounded border border-dark-border">
                        <p className="text-sm text-medium-text">Reports This Week</p>
                        <p className="text-2xl font-bold text-light-text mt-1">47</p>
                    </div>
                    <div className="bg-dark-card p-4 rounded border border-dark-border">
                        <p className="text-sm text-medium-text">Average Per Day</p>
                        <p className="text-2xl font-bold text-light-text mt-1">6.7</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-md font-semibold text-light-text mb-3">Report Breakdown by Vehicle Type</h4>
                    <div className="space-y-2">
                        {[
                            { type: 'Standard', count: 892, percentage: 61 },
                            { type: 'EV', count: 234, percentage: 16 },
                            { type: 'Commercial', count: 156, percentage: 11 },
                            { type: 'RV', count: 89, percentage: 6 },
                            { type: 'Classic', count: 52, percentage: 4 },
                            { type: 'Motorcycle', count: 33, percentage: 2 },
                        ].map(item => (
                            <div key={item.type} className="bg-dark-card p-3 rounded border border-dark-border">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-light-text">{item.type}</span>
                                    <span className="text-sm text-medium-text">{item.count} reports</span>
                                </div>
                                <div className="w-full bg-dark-bg rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderActivity = () => (
        <div className="bg-dark-bg p-6 rounded-lg border border-dark-border">
            <h3 className="text-lg font-semibold text-light-text mb-4">Activity Logs</h3>
            <div className="space-y-3">
                {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-4 p-4 bg-dark-card rounded border border-dark-border hover:border-blue-500 transition-colors">
                        <div className="flex-shrink-0 text-3xl">
                            {log.action.includes('Login') ? '🔐' :
                             log.action.includes('Report') ? '📄' :
                             log.action.includes('Upgrade') ? '⬆️' :
                             log.action.includes('Diagnostics') ? '🔧' : '📋'}
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-light-text">{log.action}</p>
                                    <p className="text-xs text-medium-text mt-1">
                                        User: {log.userEmail} ({log.userId})
                                    </p>
                                    <p className="text-sm text-light-text mt-2">{log.details}</p>
                                </div>
                                <span className="text-xs text-medium-text whitespace-nowrap ml-4">
                                    {log.timestamp}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6">
            <div className="bg-dark-bg p-6 rounded-lg border border-dark-border">
                <h3 className="text-lg font-semibold text-light-text mb-4">System Configuration</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-2">
                            Application Name
                        </label>
                        <input
                            type="text"
                            defaultValue="Auto Inspection Pro"
                            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded text-light-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-2">
                            Support Email
                        </label>
                        <input
                            type="email"
                            defaultValue="support@autoinspection.pro"
                            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded text-light-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-2">
                            Max Reports Per Month (Basic Plan)
                        </label>
                        <input
                            type="number"
                            defaultValue="10"
                            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded text-light-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-2">
                            Max Reports Per Month (Pro Plan)
                        </label>
                        <input
                            type="number"
                            defaultValue="Unlimited"
                            className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded text-light-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-dark-bg p-6 rounded-lg border border-dark-border">
                <h3 className="text-lg font-semibold text-light-text mb-4">Maintenance Actions</h3>
                <div className="space-y-3">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                        Backup Database
                    </button>
                    <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition-colors">
                        Clear Cache
                    </button>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors">
                        Export User Data
                    </button>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors">
                        Reset System Logs
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-light-text">Admin Panel</h2>
                <p className="text-medium-text mt-2">
                    Manage users, view analytics, and configure system settings
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-dark-border mb-6">
                <div className="flex space-x-1 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: '📊' },
                        { id: 'users', label: 'Users', icon: '👥' },
                        { id: 'reports', label: 'Reports', icon: '📄' },
                        { id: 'activity', label: 'Activity', icon: '📋' },
                        { id: 'settings', label: 'Settings', icon: '⚙️' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as AdminTab)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-500'
                                    : 'border-transparent text-medium-text hover:text-light-text hover:border-gray-600'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'reports' && renderReports()}
                {activeTab === 'activity' && renderActivity()}
                {activeTab === 'settings' && renderSettings()}
            </div>
        </div>
    );
};
