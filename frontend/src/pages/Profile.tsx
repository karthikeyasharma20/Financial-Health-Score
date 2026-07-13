import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardTitle, Button, Input } from '../components/ui/CustomUI';
import {  Shield, Mail, Key, Webhook, BellRing } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  
  // Settings switches states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [webhookAlerts, setWebhookAlerts] = useState(false);
  const [modelType, setModelType] = useState('xgboost');
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••');

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
          User Settings & Profile
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account credentials and system hooks integrations
        </p>
      </div>

      {/* Grid: Profile detail & configuration switches */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="col-span-1 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <CardTitle>Account Details</CardTitle>
            <div className="flex flex-col items-center py-6 border-b border-gray-100 dark:border-slate-800/80">
              <div className="w-16 h-16 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-2xl mb-3 border border-brand-purple/20">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100">{user?.full_name}</h3>
              <span className="text-xs text-brand-indigo font-bold bg-brand-purple/5 px-2.5 py-0.5 rounded-full mt-1.5 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>

            <div className="space-y-4 text-xs font-bold text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-gray-400 block font-semibold">EMAIL</span>
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">SECURITY ROLE</span>
                  <span>{user?.role === 'admin' ? 'Administrator' : 'Standard User'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 font-semibold border-t border-gray-100 dark:border-slate-800/80 pt-3">
            Registered: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '---'}
          </div>
        </Card>

        {/* Integration switches */}
        <Card className="col-span-1 md:col-span-2 space-y-6">
          <CardTitle>Platform Configuration</CardTitle>

          <div className="space-y-6 text-xs">
            {/* Toggle 1: Email notifications */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <BellRing className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-850 dark:text-gray-200">Email Alerts & Weekly Digests</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Receive summary reports and score change alerts directly in your inbox.</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={emailAlerts}
                onChange={() => setEmailAlerts(!emailAlerts)}
                className="w-9 h-5 bg-gray-200 checked:bg-brand-purple rounded-full appearance-none cursor-pointer relative transition-all duration-200 focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:translate-x-4 border border-gray-300 dark:border-slate-700"
              />
            </div>

            {/* Toggle 2: Webhooks */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <Webhook className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-850 dark:text-gray-200">SMS Webhook Integration</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Forward notifications as JSON webhooks to third-party endpoints (e.g. Zapier).</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={webhookAlerts}
                onChange={() => setWebhookAlerts(!webhookAlerts)}
                className="w-9 h-5 bg-gray-200 checked:bg-brand-blue rounded-full appearance-none cursor-pointer relative transition-all duration-200 focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all checked:after:translate-x-4 border border-gray-300 dark:border-slate-700"
              />
            </div>

            {/* ML API Settings */}
            <div className="border-t border-gray-100 dark:border-slate-800/80 pt-6 space-y-4">
              <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-brand-indigo" />
                <span>AI LLM Engine Keys (Simulation)</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Scoring Model Selection</label>
                  <select 
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-purple/50"
                  >
                    <option value="xgboost">XGBoost Regressor (Production)</option>
                    <option value="random_forest">Random Forest Classifier</option>
                    <option value="rule_based">Rule-Based Evaluator</option>
                  </select>
                </div>
                <div>
                  <Input 
                    label="Simulator API Key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => alert("Settings successfully updated!")}>
                Save Settings
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
