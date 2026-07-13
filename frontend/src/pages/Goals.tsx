import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardTitle, Button, Input, Dialog, Badge } from '../components/ui/CustomUI';
import { Target, Trash2, Plus, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: 'in_progress' | 'completed' | 'failed';
}

export const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // New Goal Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Add Money Modal State
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [moneyError, setMoneyError] = useState('');
  const [addingMoney, setAddingMoney] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = parseFloat(currentAmount);

    if (isNaN(parsedTarget) || parsedTarget <= 0 || isNaN(parsedCurrent) || parsedCurrent < 0) {
      setFormError('Please enter valid positive amounts.');
      return;
    }
    if (!targetDate) {
      setFormError('Please select a target deadline date.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/goals', {
        name: goalName,
        target_amount: parsedTarget,
        current_amount: parsedCurrent,
        target_date: targetDate
      });

      setGoalName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
      setIsModalOpen(false);

      await fetchGoals();
      api.post('/financial-score/recalculate');
    } catch (err) {
      console.error("Failed to save goal:", err);
      setFormError('Failed to create saving goal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setMoneyError('');

    const parsedAmt = parseFloat(addAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setMoneyError('Please enter a positive savings increment.');
      return;
    }

    if (selectedGoalId === null) return;

    try {
      setAddingMoney(true);
      await api.post(`/goals/${selectedGoalId}/add-money?amount=${parsedAmt}`);
      setAddAmount('');
      setSelectedGoalId(null);
      setIsAddMoneyOpen(false);
      
      await fetchGoals();
      api.post('/financial-score/recalculate');
    } catch (err) {
      console.error("Failed to add money:", err);
      setMoneyError('Failed to deposit funds. Try again.');
    } finally {
      setAddingMoney(false);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this saving goal?")) return;
    try {
      await api.delete(`/goals/${id}`);
      setGoals(prev => prev.filter(g => g.id !== id));
      api.post('/financial-score/recalculate');
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
            Financial Goals Tracking
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set, prioritize, and allocate liquid capital to key saving metrics
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </Button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const percent = Math.min(100, (g.current_amount / g.target_amount) * 100);
            return (
              <Card key={g.id} className="flex flex-col justify-between h-60 relative overflow-hidden">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-200 truncate pr-6">{g.name}</h3>
                    <Badge variant={g.status === 'completed' ? 'success' : 'purple'}>
                      {g.status === 'completed' ? 'achieved' : 'active'}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold block mt-1">
                    Deadline: {new Date(g.target_date).toLocaleDateString()}
                  </span>
                </div>

                {/* Progress bar info */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>₹{g.current_amount.toLocaleString()}</span>
                    <span>Target: ₹{g.target_amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-150 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-blue to-brand-purple transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block text-right font-bold">{percent.toFixed(0)}% saved</span>
                </div>

                {/* Footer panel */}
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-800 pt-3 mt-4">
                  <button 
                    onClick={() => handleDeleteGoal(g.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                  {g.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      onClick={() => { setSelectedGoalId(g.id); setIsAddMoneyOpen(true); }}
                      className="text-xs py-1.5 px-3"
                    >
                      Allocate Cash
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="py-20 text-center flex flex-col items-center justify-center text-gray-400 border-dashed">
          <Target className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-3" />
          <p className="font-semibold text-sm">No savings goals logged yet.</p>
        </Card>
      )}

      {/* Create Goal Dialog Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Saving Target">
        <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-red-500 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Goal Target Name"
            placeholder="e.g. Emergency Fund Vault"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            disabled={submitting}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Amount (₹)"
              type="number"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              disabled={submitting}
              required
            />
            <Input
              label="Starting Savings (₹)"
              type="number"
              placeholder="0.00"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              disabled={submitting}
            />
          </div>

          <Input
            label="Achieve Target By (Date)"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            disabled={submitting}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Allocate Savings Dialog Modal */}
      <Dialog isOpen={isAddMoneyOpen} onClose={() => setIsAddMoneyOpen(false)} title="Allocate Cash to Goal">
        <form onSubmit={handleAddMoney} className="space-y-4 text-xs">
          {moneyError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-red-500 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>{moneyError}</span>
            </div>
          )}

          <Input
            label="Deposit Amount (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            disabled={addingMoney}
            required
            autoFocus
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsAddMoneyOpen(false)} disabled={addingMoney}>
              Cancel
            </Button>
            <Button type="submit" disabled={addingMoney}>
              {addingMoney ? 'Transferring...' : 'Confirm Allocation'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
