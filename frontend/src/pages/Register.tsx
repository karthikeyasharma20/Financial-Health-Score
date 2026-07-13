import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Input, Button } from '../components/ui/CustomUI';
import { Lock, Mail, User, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all registration fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(email, password, fullName);
      navigate('/dashboard');
    } catch (err: any) {
      const serverMessage = err.response?.data?.detail;
      const errorMessage = typeof serverMessage === 'string' 
        ? serverMessage 
        : (err.message || 'Registration failed. Please check if the backend is running.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-brand-dark px-4 relative overflow-hidden">
      {/* Background Neon Glowing Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-blue/10 dark:bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-purple/10 dark:bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-indigo/35 mx-auto mb-4">
            🏦
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Register to set up your ledger and track your score
          </p>
        </div>

        <Card className="shadow-2xl border-gray-250/50 dark:border-slate-800/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2.5 text-xs text-red-500 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="relative">
              <User className="absolute left-4 top-10 text-gray-400 w-4 h-4" />
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-11"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-10 text-gray-400 w-4 h-4" />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-10 text-gray-400 w-4 h-4" />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3.5 mt-2"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-indigo font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
