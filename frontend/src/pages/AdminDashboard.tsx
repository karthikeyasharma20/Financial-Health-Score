import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardTitle, Button} from '../components/ui/CustomUI';
import { ShieldCheck, Cpu, RefreshCw, BarChart2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureImportance {
  feature: string;
  importance: number;
}

export const AdminDashboard: React.FC = () => {
  const [importances, setImportances] = useState<FeatureImportance[]>([]);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchImportances = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ml/feature-importance');
      setImportances(res.data);
    } catch (err) {
      console.error("Failed to load feature importances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImportances();
  }, []);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      setSuccessMsg('');
      const res = await api.post('/ml/train-model');
      setSuccessMsg(res.data.message || 'Retraining successfully queued in the background!');
      
      // Wait a few seconds to let training finish, then refresh importances
      setTimeout(async () => {
        const importRes = await api.get('/ml/feature-importance');
        setImportances(importRes.data);
        setRetraining(false);
      }, 5000);
    } catch (err) {
      console.error("Retraining trigger failed:", err);
      setRetraining(false);
    }
  };

  const getFeatureLabel = (f: string) => {
    const labels: any = {
      savings_rate: 'Savings Rate (Income - Expense)',
      debt_ratio: 'Debt-to-Income (DTI)',
      credit_utilization: 'Credit Card Utilization',
      investment_amount: 'Monthly Investment Velocity',
      emergency_fund_months: 'Emergency Cushion Months',
      income_stability: 'Income Stability Index',
      repayment_history: 'Loan Repayment Ratings',
      income: 'Raw Monthly Income',
      monthly_expenses: 'Raw Monthly Expenses'
    };
    return labels[f] || f;
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-550/10 text-red-500 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
            Administrator Console
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Control model pipelines and audit XGBoost prediction parameters
          </p>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retraining model panel */}
        <Card className="col-span-1 h-fit flex flex-col justify-between">
          <div>
            <CardTitle className="mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-purple" />
              <span>Model Controller</span>
            </CardTitle>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-5 mb-6">
              Retrain the XGBoost Regressor model. The training script will run on 10,000 synthetic profiles to recompute weights, scaling limits, and update the serialized assets in-memory.
            </p>
          </div>

          <div className="space-y-4">
            {successMsg && (
              <div className="p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl flex items-start gap-2.5 text-xs text-green-600 dark:text-green-400 font-bold leading-5">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <Button 
              onClick={handleRetrain} 
              disabled={retraining}
              className="w-full py-3 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
              <span>{retraining ? 'Retraining model...' : 'Retrain XGBoost Model'}</span>
            </Button>
          </div>
        </Card>

        {/* Feature importances display bar chart */}
        <Card className="lg:col-span-2">
          <CardTitle className="mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-brand-blue" />
            <span>XGBoost Feature Importance Ratios</span>
          </CardTitle>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
            </div>
          ) : importances.length > 0 ? (
            <div className="space-y-5 text-xs">
              {importances.map((item, index) => {
                // Determine scale percentage for drawing horizontal bar
                const percent = item.importance * 100;
                return (
                  <div key={index} className="space-y-1.5 font-bold">
                    <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                      <span>{getFeatureLabel(item.feature)}</span>
                      <span className="text-brand-purple">{(item.importance * 100).toFixed(2)}%</span>
                    </div>
                    {/* Horizontal Bar Chart representation */}
                    <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-10">No models imported yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
};
