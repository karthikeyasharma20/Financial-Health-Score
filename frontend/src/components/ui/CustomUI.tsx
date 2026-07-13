import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Card Component ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}
export const Card: React.FC<CardProps> = ({ children, className = '', glow = false, ...props }) => {
  return (
    <div 
      className={`bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-md transition-all duration-300 ${glow ? 'glow-card' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-lg font-bold text-gray-800 dark:text-gray-100 ${className}`} {...props}>
      {children}
    </h3>
  );
};

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:brightness-110 shadow-lg shadow-brand-indigo/20',
    secondary: 'bg-gray-100 dark:bg-slate-800 text-gray-850 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200/50 dark:border-slate-700/50',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
    ghost: 'bg-transparent text-gray-650 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/80'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base'
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Input Component ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  error, 
  className = '', 
  type = 'text', 
  ...props 
}, ref) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 dark:focus:ring-brand-purple/50 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500/35' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

// --- Badge Component ---
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'purple';
}
export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info' }) => {
  const styles = {
    success: 'bg-green-550/10 text-green-600 dark:text-green-400',
    warning: 'bg-amber-550/10 text-amber-600 dark:text-amber-400',
    error: 'bg-red-550/10 text-red-600 dark:text-red-400',
    info: 'bg-brand-blue/10 text-brand-blue dark:text-brand-blue/80',
    purple: 'bg-brand-purple/10 text-brand-purple dark:text-brand-purple/80'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- Modal/Dialog Component ---
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Content container */}
          <motion.div 
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-150 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {title}
              </h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            {/* Body */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
