import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardTitle, Badge } from '../components/ui/CustomUI';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  Target 
} from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashRes, scoreRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/financial-score')
        ]);
        setData(dashRes.data);
        setScore(scoreRes.data.score);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
      </div>
    );
  }

  const { summary, spending_by_category, monthly_cash_flow, goals, recent_transactions } = data;

  // Chart 1: Income vs Expenses (Bar Chart)
  const barData = {
    labels: monthly_cash_flow.map((x: any) => x.month),
    datasets: [
      {
        label: 'Income',
        data: monthly_cash_flow.map((x: any) => x.income),
        backgroundColor: '#2F80ED',
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: monthly_cash_flow.map((x: any) => x.expense),
        backgroundColor: '#7F00FF',
        borderRadius: 6,
      }
    ]
  };

  // Chart 2: Category Breakdown (Doughnut Chart)
  const categories = Object.keys(spending_by_category);
  const spendingAmounts = Object.values(spending_by_category);
  
  const doughnutData = {
    labels: categories,
    datasets: [
      {
        data: spendingAmounts,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF'
        ],
        borderWidth: 1,
      }
    ]
  };

  // Health Score Color Grading
  const getScoreRating = (sc: number) => {
    if (sc >= 800) return { label: 'Excellent', style: 'text-green-550', badge: 'success' };
    if (sc >= 700) return { label: 'Good', style: 'text-brand-blue', badge: 'info' };
    if (sc >= 550) return { label: 'Fair', style: 'text-amber-550', badge: 'warning' };
    return { label: 'Needs Work', style: 'text-red-500', badge: 'error' };
  };

  const rating = score ? getScoreRating(score) : { label: 'Unrated', style: 'text-gray-400', badge: 'info' };

  return (
    <div className="space-y-8">
      {/* Upper header section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time analytics and score tracking models
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 font-bold bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 px-4 py-2.5 rounded-xl shadow-sm">
          <Calendar className="w-4 h-4 text-brand-purple" />
          <span>Last 30 Days Ledger</span>
        </div>
      </div>

      {/* Grid containing score card and indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Financial Score Panel */}
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-tr from-brand-navy to-slate-950 text-white flex flex-col justify-between border-transparent relative overflow-hidden shadow-xl">
          <div className="absolute top-[-40%] right-[-20%] w-[300px] h-[300px] bg-brand-purple/10 rounded-full blur-[80px]" />
          <div>
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-2">
              Financial Health Score
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black tracking-tight">{score || '---'}</span>
              <span className="text-sm text-slate-400">/ 1000</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant={rating.badge as any}>{rating.label}</Badge>
            </div>
          </div>
          
          <div className="mt-8 border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold">Analyzed by XGBoost Regressor</span>
            <Link to="/score" className="text-brand-blue hover:text-white font-bold flex items-center gap-1 transition-colors">
              <span>View score breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Assets & Net Worth Stats */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Total Assets
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-550/10 text-green-500 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight mt-4">
              ₹{summary.total_assets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1 font-semibold">Includes savings & investments</p>
          </div>
        </Card>

        {/* Liabilities Stats */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Total Liabilities
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-550/10 text-red-500 flex items-center justify-center">
              <TrendingDown className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight mt-4">
              ₹{summary.total_liabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1 font-semibold">Includes active loans & EMIs</p>
          </div>
        </Card>
      </div>

      {/* Grid containing charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income vs Expense Bar */}
        <Card className="md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <CardTitle>Cash Flow Trend</CardTitle>
            <span className="text-xs text-gray-400 font-semibold">Income vs Expenses (6 Months)</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {monthly_cash_flow.length > 0 ? (
              <Bar 
                data={barData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            ) : (
              <p className="text-xs text-gray-400">No cash flow logs found.</p>
            )}
          </div>
        </Card>

        {/* Category breakdown Doughnut */}
        <Card>
          <CardTitle className="mb-6">Category Allocation</CardTitle>
          <div className="h-64 flex items-center justify-center relative">
            {categories.length > 0 ? (
              <Doughnut 
                data={doughnutData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, fontSize: 10 } } }
                }} 
              />
            ) : (
              <p className="text-xs text-gray-400">No monthly expenses logged.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Grid containing Goals progress and Recent transactions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <Card className="md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <CardTitle>Recent Transactions</CardTitle>
            <Link to="/transactions" className="text-xs text-brand-indigo font-bold hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-slate-800 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
                {recent_transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 font-bold text-gray-800 dark:text-gray-200">{tx.category}</td>
                    <td className="py-3.5 text-gray-500 dark:text-gray-400">{tx.description || '---'}</td>
                    <td className="py-3.5 text-gray-400">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className={`py-3.5 text-right font-bold ${tx.type === 'income' ? 'text-green-500' : 'text-gray-800 dark:text-gray-200'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Goals Progress Card */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <CardTitle>Savings Goals</CardTitle>
            <Link to="/goals" className="text-xs text-brand-indigo font-bold hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {goals.length > 0 ? (
              goals.slice(0, 3).map((g: any) => {
                const percent = Math.min(100, (g.current_amount / g.target_amount) * 100);
                return (
                  <div key={g.id} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{g.name}</span>
                      <span className="text-gray-400">{percent.toFixed(0)}%</span>
                    </div>
                    {/* Progress slider bar */}
                    <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-blue to-brand-purple transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                      <span>₹{g.current_amount.toLocaleString()}</span>
                      <span>Target: ₹{g.target_amount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-center text-gray-400 py-6">No goals tracked yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
