import React from 'react';
import { User } from '../types';
import { CONFIG } from '../config';

interface HeaderProps {
  user: User;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const TABS = ['Dashboard', 'Order Service', 'Inspection', 'Diagnostics', 'Assistant'];

export const Header: React.FC<HeaderProps> = ({ user, currentTab, onTabChange, onLogout }) => {
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
          <div className="flex items-center">
            <span className="text-sm text-medium-text mr-4 hidden sm:block">Welcome, {user.email}</span>
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
