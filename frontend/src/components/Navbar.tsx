import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, Sun, Moon, Search, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds for live updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-150 dark:border-slate-800/80 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      {/* Search Bar Container */}
      <div className="relative w-96 hidden md:block">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4.5 h-4.5" />
        </span>
        <input
          type="text"
          placeholder="Search transactions, goals, assets..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 dark:focus:ring-brand-purple/50 focus:border-transparent transition-all"
        />
      </div>

      {/* Action Buttons Panel */}
      <div className="flex items-center gap-5 ml-auto">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-purple text-[9px] font-extrabold text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Overlay barrier */}
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden"
                >
                  <div className="px-5 py-3.5 border-b border-gray-150 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">Alerts & Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/80">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-4 flex gap-3 transition-colors ${!n.is_read ? 'bg-brand-blue/5 dark:bg-brand-purple/5' : 'hover:bg-gray-50 dark:hover:bg-slate-850/50'}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate">{n.title}</h5>
                              {!n.is_read && (
                                <button 
                                  onClick={() => markAsRead(n.id)}
                                  className="text-gray-400 hover:text-brand-purple transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-4">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-gray-400">
                        No notifications found.
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
