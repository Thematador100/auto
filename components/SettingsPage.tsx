// SettingsPage.tsx - User settings and white label configuration
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WhiteLabelConfig } from '../types';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'white-label' | 'notifications' | 'security'>('profile');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.companyName || '',
  });

  const [whiteLabelConfig, setWhiteLabelConfig] = useState<Partial<WhiteLabelConfig>>({
    companyName: user?.companyName || 'My Company',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    emailFrom: 'noreply@mycompany.com',
    supportEmail: 'support@mycompany.com',
    showBranding: true,
  });

  const [notifications, setNotifications] = useState({
    emailReports: true,
    emailInvoices: true,
    emailUpdates: false,
    smsAlerts: false,
    pushNotifications: true,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleWhiteLabelUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Save white label config
    localStorage.setItem('whiteLabel', JSON.stringify(whiteLabelConfig));
    toast.success('White label settings saved');
  };

  const handleNotificationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('notifications', JSON.stringify(notifications));
    toast.success('Notification preferences saved');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-blue-100 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="col-span-12 lg:col-span-3">
            <nav className="space-y-1">
              {[
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'white-label', label: 'White Label', icon: '🎨' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                { id: 'security', label: 'Security', icon: '🔒' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={profileData.companyName}
                          onChange={e => setProfileData({ ...profileData, companyName: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* White Label Tab */}
              {activeTab === 'white-label' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">White Label Configuration</h2>
                    <p className="text-gray-400">Customize the branding for your organization</p>
                    {user?.plan !== 'pro' && user?.plan !== 'enterprise' && (
                      <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                        <p className="text-yellow-300 text-sm">
                          ⚠️ White label features are available on Pro and Enterprise plans only.
                        </p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleWhiteLabelUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={whiteLabelConfig.companyName}
                        onChange={e => setWhiteLabelConfig({ ...whiteLabelConfig, companyName: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={whiteLabelConfig.primaryColor}
                            onChange={e => setWhiteLabelConfig({ ...whiteLabelConfig, primaryColor: e.target.value })}
                            className="w-16 h-12 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={whiteLabelConfig.primaryColor}
                            onChange={e => setWhiteLabelConfig({ ...whiteLabelConfig, primaryColor: e.target.value })}
                            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={whiteLabelConfig.secondaryColor}
                            onChange={e => setWhiteLabelConfig({ ...whiteLabelConfig, secondaryColor: e.target.value })}
                            className="w-16 h-12 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={whiteLabelConfig.secondaryColor}
                            onChange={e => setWhiteLabelConfig({ ...whiteLabelConfig, secondaryColor: e.target.value })}
                            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email From Address
                        </label>
                        <input
                          type="email"
                          value={whiteLabelConfig.emailFrom}
                          onChange={e => setWhiteLabelConfig({ ...whiteLabelConfig, emailFrom: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Support Email
                        </label>
                        <input
                          type="email"
                          value={whiteLabelConfig.supportEmail}
                          onChange={e => setWhiteLabelConfig({ ...whiteLabelConfig, supportEmail: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={whiteLabelConfig.showBranding}
                        onChange={e => setWhiteLabelConfig({ ...whiteLabelConfig, showBranding: e.target.checked })}
                        className="mr-3 w-5 h-5 text-blue-500 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                      />
                      <label className="text-gray-300">
                        Show platform branding (disable for full white label)
                      </label>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                      >
                        Save White Label Settings
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                  <form onSubmit={handleNotificationUpdate} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-slate-700">
                        <div>
                          <p className="text-white font-medium">Email Reports</p>
                          <p className="text-sm text-gray-400">Receive inspection reports via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailReports}
                          onChange={e => setNotifications({ ...notifications, emailReports: e.target.checked })}
                          className="w-5 h-5 text-blue-500 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-slate-700">
                        <div>
                          <p className="text-white font-medium">Email Invoices</p>
                          <p className="text-sm text-gray-400">Receive billing invoices and receipts</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailInvoices}
                          onChange={e => setNotifications({ ...notifications, emailInvoices: e.target.checked })}
                          className="w-5 h-5 text-blue-500 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-slate-700">
                        <div>
                          <p className="text-white font-medium">Product Updates</p>
                          <p className="text-sm text-gray-400">Get notified about new features and updates</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailUpdates}
                          onChange={e => setNotifications({ ...notifications, emailUpdates: e.target.checked })}
                          className="w-5 h-5 text-blue-500 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-slate-700">
                        <div>
                          <p className="text-white font-medium">SMS Alerts</p>
                          <p className="text-sm text-gray-400">Receive important alerts via SMS</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.smsAlerts}
                          onChange={e => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                          className="w-5 h-5 text-blue-500 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-white font-medium">Push Notifications</p>
                          <p className="text-sm text-gray-400">Receive push notifications on mobile devices</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.pushNotifications}
                          onChange={e => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                          className="w-5 h-5 text-blue-500 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                        >
                          Update Password
                        </button>
                      </form>
                    </div>

                    <div className="pt-6 border-t border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                      <p className="text-gray-400 mb-4">Add an extra layer of security to your account</p>
                      <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
