import React, { useState } from 'react';
import { User } from '../types';
import { CONFIG } from '../config';

interface HeaderProps {
  user: User;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, currentTab, onTabChange, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainTabs = ['Dashboard', 'Inspection', 'Diagnostics', 'Assistant'];
  const adminTabs = user.role === 'admin' ? ['Admin'] : [];
  const userTabs = ['Pricing', 'Settings'];

  const allTabs = [...mainTabs, ...adminTabs];

  return (
    <header className="bg-slate-800 shadow-lg border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">{CONFIG.BRANDING.companyName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {allTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentTab === tab
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Plan Badge */}
            <div className="hidden md:block">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.plan === 'enterprise' ? 'bg-purple-900 text-purple-200' :
                user.plan === 'pro' ? 'bg-blue-900 text-blue-200' :
                user.plan === 'basic' ? 'bg-green-900 text-green-200' :
                'bg-gray-700 text-gray-300'
              }`}>
                {user.plan.toUpperCase()}
              </span>
            </div>

            {/* User Dropdown */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Settings & Logout Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => onTabChange('Pricing')}
                className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                title="Pricing"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => onTabChange('Settings')}
                className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-slate-700">
            {allTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  onTabChange(tab);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                  currentTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
            {userTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  onTabChange(tab);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition"
              >
                {tab}
              </button>
            ))}
            <button
              onClick={onLogout}
              className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
