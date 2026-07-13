import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ArrowLeftRight, 
  PiggyBank, 
  BarChart3, 
  Target, 
  Lightbulb, 
  User, 
  ShieldAlert, 
  LogOut 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/score', label: 'Financial Score', icon: TrendingUp },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/savings', label: 'Savings', icon: PiggyBank },
    { to: '/investments', label: 'Investments', icon: BarChart3 },
    { to: '/goals', label: 'Goals Tracking', icon: Target },
    { to: '/recommendations', label: 'AI Recommendations', icon: Lightbulb },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  // Include admin panel if user is admin
  if (user?.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-150 dark:border-slate-800/80 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-gray-150 dark:border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white text-lg font-bold shadow-md">
          🏦
        </div>
        <div>
          <h1 className="font-extrabold text-sm text-gray-800 dark:text-gray-100 tracking-tight leading-4">
            FINANCIAL
          </h1>
          <span className="text-[11px] font-bold text-brand-purple tracking-widest block uppercase">
            Health Platform
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 text-brand-indigo dark:text-gray-100 border-l-4 border-brand-purple' 
                    : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-800/50 hover:text-gray-700 dark:hover:text-gray-200'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile block */}
      <div className="p-4 border-t border-gray-150 dark:border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-brand-purple">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="truncate">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
              {user?.full_name || 'Guest User'}
            </h4>
            <span className="text-[11px] text-gray-400 block truncate">
              {user?.email || 'guest@example.com'}
            </span>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
