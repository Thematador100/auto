import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { CONFIG } from '../config';
import { notificationService } from '../services/notificationService';

interface HeaderProps {
  user: User;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onShowNotifications?: () => void;
}

const TABS = ['Dashboard', 'Inspection', 'Diagnostics', 'Assistant', 'Help'];

export const Header: React.FC<HeaderProps> = ({ user, currentTab, onTabChange, onLogout, onShowNotifications }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Update unread count periodically
    const updateUnreadCount = () => {
      const count = notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    };

    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [user.id]);

  return (
    <header className="bg-dark-card shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-primary">{CONFIG.BRANDING.companyName}</div>
            <nav className="hidden md:flex space-x-4">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === tab
                      ? 'bg-primary text-white'
                      : 'text-medium-text hover:bg-dark-bg hover:text-light-text'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            {onShowNotifications && (
              <button
                onClick={onShowNotifications}
                className="relative p-2 text-medium-text hover:text-light-text transition-colors"
                title="Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            <span className="text-sm text-medium-text hidden sm:block">
              Welcome, {user.name || user.email}
            </span>
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-medium-text hover:bg-dark-bg hover:text-light-text"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
