import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { motion } from 'framer-motion';

export const Layout: React.FC = () => {
  const { token, loading } = useAuth();

  // If session authentication is checking, show a loading placeholder
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading your secure dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is unauthenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-dark flex">
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main dashboard content container */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar />
        
        {/* Main Content Area */}
        <motion.main 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex-1 p-8 overflow-y-auto"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};
