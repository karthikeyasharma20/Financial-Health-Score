import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card,  Button, Input, Dialog, Badge } from '../components/ui/CustomUI';
import { Plus, Download, Search, Trash2, ArrowLeftRight, AlertTriangle } from 'lucide-react';

interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Groceries');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16)); // YYYY-MM-DDTHH:MM
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Salary', 'Freelance', 'Rent', 'Groceries', 'Utilities', 
    'Entertainment', 'EMI', 'Dining Out', 'Shopping', 'Investment', 
    'Medical', 'Travel', 'Others'
  ];

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to load transactions list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Save transaction
      await api.post('/transactions', {
        amount: parsedAmount,
        type,
        category,
        description,
        date: new Date(date).toISOString()
      });

      // Reset modal values
      setAmount('');
      setType('expense');
      setCategory('Groceries');
      setDescription('');
      setDate(new Date().toISOString().substring(0, 16));
      setIsModalOpen(false);
      
      // Reload lists and trigger a score refresh in background
      await fetchTransactions();
      api.post('/financial-score/recalculate');
    } catch (err) {
      console.error("Failed to save transaction:", err);
      setFormError('Network error. Failed to log transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this transaction record? This will affect your health score calculations.")) return;
    
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t.id !== id));
      // Trigger score update in background
      api.post('/financial-score/recalculate');
    } catch (err) {
      console.error("Deletion failed:", err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/transactions/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export CSV:", err);
    }
  };

  // Run list filtering client side for speed
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description?.toLowerCase().includes(search.toLowerCase()) || 
                          t.category?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = catFilter === 'all' || t.category === catFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
            Transaction Ledger
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Log income, expenses, and asset transfers to maintain score accuracy
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExportCSV} variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <Card className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-950 text-xs text-gray-800 dark:text-gray-200 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-purple/50"
          />
        </div>
        
        {/* Type selector */}
        <div className="w-full md:w-48">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 text-xs text-gray-800 dark:text-gray-200 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-purple/50"
          >
            <option value="all">All Types</option>
            <option value="income">Incomes Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>

        {/* Category selector */}
        <div className="w-full md:w-48">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 text-xs text-gray-800 dark:text-gray-200 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-purple/50"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Main ledger list */}
      <Card>
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-slate-800 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-850/50">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/10 transition-colors">
                    <td className="py-3.5 text-gray-400">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-3.5 font-bold text-gray-800 dark:text-gray-200">{tx.category}</td>
                    <td className="py-3.5 text-gray-500 dark:text-gray-400 max-w-xs truncate">{tx.description || '---'}</td>
                    <td className="py-3.5">
                      <Badge variant={tx.type === 'income' ? 'success' : 'info'}>{tx.type}</Badge>
                    </td>
                    <td className={`py-3.5 text-right font-black ${tx.type === 'income' ? 'text-green-500' : 'text-gray-800 dark:text-gray-200'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors inline-block"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
            <ArrowLeftRight className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="font-semibold text-sm">No transaction logs match filters.</p>
          </div>
        )}
      </Card>

      {/* Add Transaction Dialog Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Financial Transaction"
      >
        <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-red-500 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Transaction Amount (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={submitting}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
                disabled={submitting}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
                disabled={submitting}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Description / Memo"
            placeholder="e.g. Weekly supermarket shopping"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />

          <Input
            label="Transaction Timestamp"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={submitting}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Logging...' : 'Save Log'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
