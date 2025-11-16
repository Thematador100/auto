import React, { useState } from 'react';
import WhiteLabelSettings from './WhiteLabelSettings';

type AdminTab = 'overview' | 'white-label' | 'users' | 'analytics';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'white-label', label: 'White Label & Payments' },
    { id: 'users', label: 'User Management' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
        <h2 className="text-3xl font-bold text-light-text mb-2">Admin Panel</h2>
        <p className="text-medium-text">
          Manage your application settings, white label configuration, and monitor system performance.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-border">
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-medium-text hover:text-light-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h3 className="text-2xl font-bold text-light-text mb-4">System Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-bg p-4 rounded-md border border-dark-border">
                <p className="text-medium-text text-sm">Total Reports</p>
                <p className="text-3xl font-bold text-light-text mt-2">0</p>
              </div>
              <div className="bg-dark-bg p-4 rounded-md border border-dark-border">
                <p className="text-medium-text text-sm">Active Users</p>
                <p className="text-3xl font-bold text-light-text mt-2">1</p>
              </div>
              <div className="bg-dark-bg p-4 rounded-md border border-dark-border">
                <p className="text-medium-text text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-light-text mt-2">$0.00</p>
              </div>
            </div>
            <div className="mt-6 bg-blue-900/20 border border-blue-500 rounded-md p-4">
              <p className="text-blue-400 text-sm">
                <strong>Welcome to the Admin Panel!</strong> Use the tabs above to configure your white label settings,
                manage users, and view analytics. Start by setting up your Stripe integration in the "White Label &
                Payments" tab.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'white-label' && <WhiteLabelSettings />}

        {activeTab === 'users' && (
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h3 className="text-2xl font-bold text-light-text mb-4">User Management</h3>
            <p className="text-medium-text mb-4">
              Manage user accounts, permissions, and subscription plans.
            </p>
            <div className="bg-dark-bg p-8 rounded-md text-center border-2 border-dashed border-dark-border">
              <p className="text-medium-text">User management features coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h3 className="text-2xl font-bold text-light-text mb-4">Analytics & Reporting</h3>
            <p className="text-medium-text mb-4">
              View detailed analytics about inspections, payments, and user activity.
            </p>
            <div className="bg-dark-bg p-8 rounded-md text-center border-2 border-dashed border-dark-border">
              <p className="text-medium-text">Analytics dashboard coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
