import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Bell, Search, X, Check } from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  searchFilter: string;
  setSearchFilter: (v: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, searchFilter, setSearchFilter }) => {
  const { theme, setTheme, notifications, clearNotification, user } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const unreadCount = notifications.length;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors">
      
      {/* Left Search / Hamburger combo */}
      <div className="flex items-center gap-3 w-1/2 max-w-sm">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-slate-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-550">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search events, clients, staff..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-100 dark:bg-slate-800/80 border border-transparent rounded-xl text-sm font-sans text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-gray-305 dark:focus:border-slate-700 focus:ring-0 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications Tray */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all relative cursor-pointer"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div id="notifications-modal" className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2.5 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <span className="font-sans font-bold text-xs text-slate-900 dark:text-white">Active Alerts ({unreadCount})</span>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-sans">
                    No new alerts to show.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-4 flex gap-3 text-left">
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-bold text-xs text-slate-900 dark:text-white truncate">{notif.title}</p>
                        <p className="font-sans text-xxs text-slate-500 dark:text-slate-400 mt-1 leading-normal">{notif.message}</p>
                      </div>
                      <button
                        onClick={() => clearNotification(notif.id)}
                        className="h-6 w-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 text-slate-400 shrink-0 transition"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <span className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-1">
          <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-sans font-black text-xs uppercase shadow-inner">
            {user?.email ? user.email.substring(0, 2) : 'EM'}
          </div>
          <div className="text-left hidden md:block">
            <p className="font-sans font-bold text-xs text-slate-800 dark:text-white truncate max-w-[120px]">
              {user?.email || 'Event Organizer'}
            </p>
            <p className="font-sans text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Administrator
            </p>
          </div>
        </div>
      </div>

    </header>
  );
};
