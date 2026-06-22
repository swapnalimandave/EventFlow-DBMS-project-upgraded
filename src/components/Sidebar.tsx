import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { EventFlowLogo } from './EventFlowLogo';
import {
  LayoutDashboard,
  Calendar,
  Users,
  MapPin,
  Briefcase,
  Layers,
  ShoppingBag,
  FolderLock,
  LogOut,
  FolderDot
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onCloseMobile }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Events List', icon: FolderDot },
    { id: 'calendar', label: 'Full Calendar', icon: Calendar },
    { id: 'clients', label: 'Clients (CRM)', icon: Users },
    { id: 'venues', label: 'Venues Directory', icon: MapPin },
    { id: 'staff', label: 'Staff Registry', icon: Briefcase },
    { id: 'vendors', label: 'Vendors Hub', icon: ShoppingBag },
    { id: 'services', label: 'Vendor Services', icon: Layers },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800">
      {/* Sidebar Header Panel */}
      <div className="p-6 flex items-center justify-start border-b border-gray-100 dark:border-slate-800">
        <EventFlowLogo size="md" />
      </div>

      {/* Nav Actions */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-750 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-55 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <IconComponent className={`h-5 w-5 ${isActive ? 'text-indigo-605 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Details / Signout */}
      <div className="p-5 border-t border-gray-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5 text-red-555" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
