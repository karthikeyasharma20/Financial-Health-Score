import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardTitle, Button, Input, Dialog, Badge } from '../components/ui/CustomUI';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Landmark, TrendingUp, TrendingDown, Trash2, Plus, AlertTriangle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Investment {
  id: number;
  asset_class: string;
  invested_amount: number;
  current_value: number;
  date: string;
}

export const Investments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetClass, setAssetClass] = useState('stocks');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const assetClasses = [
    { value: 'stocks', label: 'Stocks & Equities' },
    { value: 'mutual_funds', label: 'Mutual Funds & ETFs' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'gold', label: 'Precious Metals / Gold' },
    { value: 'fixed_deposit', label: 'Fixed Deposits / Cash Bonds' }
  ];

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/investments');
      setInvestments(res.data);
    } catch (err) {
      console.error("Failed to load investments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsedInvested = parseFloat(investedAmount);
    const parsedCurrent = parseFloat(currentValue);

    if (isNaN(parsedInvested) || parsedInvested <= 0 || isNaN(parsedCurrent) || parsedCurrent <= 0) {
      setFormError('Please enter valid positive numbers.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/investments', {
        asset_class: assetClass,
        invested_amount: parsedInvested,
        current_value: parsedCurrent
      });

      setInvestedAmount('');
      setCurrentValue('');
      setAssetClass('stocks');
      setIsModalOpen(false);

      await fetchInvestments();
      api.post('/financial-score/recalculate');
    } catch (err) {
      console.error("Failed to save investment:", err);
      setFormError('Failed to record investment. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this investment item from your portfolio?")) return;
    try {
      await api.delete(`/investments/${id}`);
      setInvestments(prev => prev.filter(inv => inv.id !== id));
      api.post('/financial-score/recalculate');
    } catch (err) {
      console.error("Deletion failed:", err);
    }
  };

  // Portfolio Totals
  const totalInvested = investments.reduce((acc, curr) => acc + curr.invested_amount, 0);
  const totalValue = investments.reduce((acc, curr) => acc + curr.current_value, 0);
  const totalProfit = totalValue - totalInvested;
  const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  // Chart Configuration: Group by asset class
  const classTotals = investments.reduce((acc: any, curr) => {
    acc[curr.asset_class] = (acc[curr.asset_class] || 0) + curr.current_value;
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(classTotals).map(k => assetClasses.find(a => a.value === k)?.label || k),
    datasets: [
      {
        data: Object.values(classTotals),
        backgroundColor: ['#2F80ED', '#7F00FF', '#E2E8F0', '#EAB308', '#22C55E'],
        borderWidth: 1,
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
            Investment Portfolio
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track asset allocations and evaluate net valuation growth
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Investment</span>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between">
          <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Invested Capital</span>
          <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight mt-4">
            ₹{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </Card>

        <Card className="flex flex-col justify-between">
          <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Current Portfolio Value</span>
          <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight mt-4">
            ₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </Card>

        <Card className="flex flex-col justify-between">
          <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Net Returns</span>
          <div className="flex items-baseline gap-2 mt-4">
            <span className={`text-2xl font-black ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ({roi.toFixed(1)}% ROI)
            </span>
          </div>
        </Card>
      </div>

      {/* Main Grid: list & allocation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Investment List */}
        <Card className="md:col-span-2">
          <CardTitle className="mb-6">Portfolio Holdings</CardTitle>
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
            </div>
          ) : investments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 dark:border-slate-800 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Asset Class</th>
                    <th className="pb-3 font-semibold text-right">Invested Value</th>
                    <th className="pb-3 font-semibold text-right">Current Value</th>
                    <th className="pb-3 font-semibold text-right">Gain / Loss</th>
                    <th className="pb-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-850/50">
                  {investments.map((inv) => {
                    const diff = inv.current_value - inv.invested_amount;
                    const diffPercent = (diff / inv.invested_amount) * 100;
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/10 transition-colors">
                        <td className="py-3.5 font-bold text-gray-800 dark:text-gray-200">
                          {assetClasses.find(a => a.value === inv.asset_class)?.label || inv.asset_class}
                        </td>
                        <td className="py-3.5 text-right text-gray-500 dark:text-gray-400">₹{inv.invested_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3.5 text-right font-bold text-gray-800 dark:text-gray-200">₹{inv.current_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`py-3.5 text-right font-black ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ₹{diff.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({diffPercent.toFixed(1)}%)
                        </td>
                        <td className="py-3.5 text-center">
                          <button onClick={() => handleDelete(inv.id)} className="text-gray-400 hover:text-red-500 transition-colors inline-block">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <Landmark className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-700 mb-2" />
              <p className="font-semibold text-sm">No investment assets logged.</p>
            </div>
          )}
        </Card>

        {/* Asset Class Allocation Doughnut */}
        <Card>
          <CardTitle className="mb-6">Asset Allocation</CardTitle>
          <div className="h-56 flex items-center justify-center">
            {investments.length > 0 ? (
              <Doughnut 
                data={doughnutData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, fontSize: 10 } } }
                }} 
              />
            ) : (
              <p className="text-xs text-gray-400">No assets logged.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Add Investment Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Portfolio Investment Asset">
        <form onSubmit={handleAddInvestment} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-red-500 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Asset Class Group
            </label>
            <select
              value={assetClass}
              onChange={(e) => setAssetClass(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
              disabled={submitting}
            >
              {assetClasses.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Invested Capital (₹)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={investedAmount}
              onChange={(e) => setInvestedAmount(e.target.value)}
              disabled={submitting}
              required
            />
            <Input
              label="Current Valuation (₹)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Recording...' : 'Record Holding'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
