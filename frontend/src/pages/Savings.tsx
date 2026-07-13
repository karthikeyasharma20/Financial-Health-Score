import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardTitle, Button, Input, Badge } from '../components/ui/CustomUI';
import { PiggyBank, ArrowDownRight, Edit2, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export const Savings: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [budgetLimit, setBudgetLimit] = useState(() => {
    const saved = localStorage.getItem('monthly_budget');
    return saved ? parseFloat(saved) : 3500;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budgetLimit.toString());

  // Simulation slider states
  const [incomeSim, setIncomeSim] = useState(5000);
  const [expenseSim, setExpenseSim] = useState(3000);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
        if (res.data.summary) {
          setIncomeSim(res.data.summary.total_assets > 0 ? 5500 : 5000); // Sensible starting sims
        }
      } catch (err) {
        console.error("Failed to load savings analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleSaveBudget = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      setBudgetLimit(val);
      localStorage.setItem('monthly_budget', val.toString());
      setIsEditingBudget(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
      </div>
    );
  }

  const { summary, spending_by_category } = data;
  
  // Calculate total monthly expenses
  const currentMonthExpenses = Object.values(spending_by_category).reduce((a: any, b: any) => a + b, 0) as number;
  const budgetProgress = (currentMonthExpenses / budgetLimit) * 100;
  const savingsAmount = incomeSim - expenseSim;
  const savingsRateSim = (savingsAmount / incomeSim) * 100;

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
          Savings & Budget Planner
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Optimize your cash flow velocity and track spending constraints
        </p>
      </div>

      {/* Grid: Budget planner & Savings metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget Limit Tracker */}
        <Card className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <CardTitle>Monthly Budget Vault</CardTitle>
            <div className="flex items-center gap-2">
              {isEditingBudget ? (
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={tempBudget}
                    onChange={(e) => setTempBudget(e.target.value)}
                    className="w-28 mb-0 px-2 py-1.5 text-xs h-8"
                  />
                  <Button size="sm" onClick={handleSaveBudget} className="h-8">
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button 
                  onClick={() => { setTempBudget(budgetLimit.toString()); setIsEditingBudget(true); }}
                  className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-brand-purple rounded-xl transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
              <span>Expenses: ₹{currentMonthExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              <span>Limit: ₹{budgetLimit.toLocaleString()}</span>
            </div>
            
            {/* Visual Progress bar */}
            <div className="w-full h-4 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-500 ${budgetProgress > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-brand-blue to-brand-purple'}`} 
                style={{ width: `${Math.min(100, budgetProgress)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-gray-400 font-semibold">
              <span>{budgetProgress.toFixed(0)}% of limit consumed</span>
              {budgetProgress > 90 ? (
                <span className="text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Close to budget threshold!
                </span>
              ) : (
                <span className="text-green-500">Safe budget headroom available</span>
              )}
            </div>
          </div>
        </Card>

        {/* Savings Card summary */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Total Savings Reserve
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center">
              <PiggyBank className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight mt-4">
              ₹{summary.total_savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1 font-semibold">Accumulated goal balances</p>
          </div>
        </Card>
      </div>

      {/* Interactive Savings Simulator */}
      <Card className="space-y-6">
        <div>
          <CardTitle>AI Savings Rate Simulator</CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Slide values to evaluate how income variance adjusts your financial rating
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-bold">
          {/* Income Slider */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Income</span>
              <span className="text-brand-blue">₹{incomeSim.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="1500" 
              max="20000" 
              step="100" 
              value={incomeSim}
              onChange={(e) => setIncomeSim(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-blue"
            />
          </div>

          {/* Expense Slider */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Expense</span>
              <span className="text-brand-purple">₹{expenseSim.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="15000" 
              step="100" 
              value={expenseSim}
              onChange={(e) => setExpenseSim(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-purple"
            />
          </div>
        </div>

        {/* Calculation Result Callout */}
        <div className="p-5 bg-gray-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-850/50 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold">
          <div>
            <span className="text-gray-400 uppercase tracking-wider block mb-1">Simulated Net Savings</span>
            <span className={`text-xl font-black ${savingsAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {savingsAmount >= 0 ? '+' : '-'}₹{Math.abs(savingsAmount).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-gray-400 uppercase tracking-wider block mb-1">Simulated Savings Rate</span>
            <span className={`text-xl font-black ${savingsRateSim >= 30 ? 'text-green-500' : (savingsRateSim >= 10 ? 'text-amber-500' : 'text-red-500')}`}>
              {savingsRateSim.toFixed(1)}%
            </span>
          </div>

          <div>
            <span className="text-gray-400 uppercase tracking-wider block mb-1">Score Rating Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              {savingsRateSim >= 30 ? (
                <Badge variant="success">Optimal (250 pts)</Badge>
              ) : (
                <Badge variant="warning">Suboptimal</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
