import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardTitle, Button, Badge } from '../components/ui/CustomUI';
import { Lightbulb, Check, Sparkles, Brain, Award, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Recommendation {
  id: number;
  recommendation_text: string;
  type: string;
  impact: 'high' | 'medium' | 'low';
  resolved: boolean;
}

export const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // AI Advisor Simulation states
  const [consulting, setConsulting] = useState(false);
  const [consultationReport, setConsultationReport] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recommendations');
      setRecommendations(res.data);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleResolve = async (id: number) => {
    try {
      await api.post(`/recommendations/${id}/resolve`);
      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to resolve recommendation:", err);
    }
  };

  const triggerAIConsultation = async () => {
    try {
      setConsulting(true);
      setConsultationReport(null);
      
      // Fetch score details to build context
      const scoreRes = await api.get('/financial-score');
      const score = scoreRes.data.score;
      //const  = scoreRes.data;

      // Simulate sending prompt to Gemini / OpenAI
      setTimeout(() => {
        let analysis = "";
        let warnings = "";
        let steps = "";

        if (score >= 800) {
          analysis = "Your cash flow velocity is exemplary. Savings rate is aligned above 30%, which builds capital reserves fast. Liquid assets cover standard operations easily.";
          warnings = "Risk Profile: Your investments might be heavily weighted in low-yield cash deposits (goals) rather than capital equities. Check asset diversification ratios.";
          steps = "Recommendation: Allocate excess cash savings exceeding your 6-month emergency fund into active mutual fund SIPs or low-cost index funds to accelerate compound growth.";
        } else if (score >= 700) {
          analysis = "You display clean ledger hygiene, but minor leaks exist. Savings stand in the 15-20% band, and credit card balances occasionally peak mid-cycle.";
          warnings = "Risk Profile: A debt ratio near 25% or CC utilization close to 30% acts as a drag on score gains. Keep spending card ratios below 20%.";
          steps = "Recommendation: Automate savings transfers on payday. Review credit card statements, and pay off half the balance mid-cycle to keep reported utilization under 20%.";
        } else {
          analysis = "Your ledger shows elevated warning signs. A savings rate below 10% coupled with a high debt-to-income ratio (DTI) creates friction for net worth building.";
          warnings = "Risk Profile: Insufficient emergency funds (less than 3 months of expenses) leaves you vulnerable to sudden cash flow shocks or job changes.";
          steps = "Recommendation: Halt new credit expenditures. Implement the Debt Snowball method on loans, and build a liquid $5,000 emergency fund as your absolute highest priority.";
        }

        const report = `
### 1. Executive Cash Flow Assessment
${analysis}

### 2. Risk Indicators & Warning Areas
${warnings}

### 3. Immediate Optimization Strategy
${steps}
        `;
        setConsultationReport(report);
        setConsulting(false);
      }, 1500);
    } catch (err) {
      console.error("AI Consultation failed:", err);
      setConsulting(false);
    }
  };

  const getImpactBadge = (impact: string) => {
    const maps = {
      high: { label: 'High Priority', val: 'error' },
      medium: { label: 'Medium Priority', val: 'warning' },
      low: { label: 'Low Priority', val: 'success' }
    };
    const c = (maps as any)[impact] || { label: 'Priority', val: 'info' };
    return <Badge variant={c.val}>{c.label}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
          AI Actionable Recommendations
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Rules-based insights and LLM planner advice to optimize your financial standing
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendation list */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardTitle className="mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-brand-purple" />
              <span>Prioritized Recommendations</span>
            </CardTitle>

            {loading ? (
              <div className="py-16 flex justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {recommendations.map((rec) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="p-4 bg-gray-50 dark:bg-slate-950/40 border border-gray-100 dark:border-slate-850/50 rounded-2xl flex items-start justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          {getImpactBadge(rec.impact)}
                          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">{rec.type}</span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-5">
                          {rec.recommendation_text}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleResolve(rec.id)}
                        className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 hover:bg-brand-purple hover:text-white border border-gray-150 dark:border-slate-850/80 flex items-center justify-center text-gray-400 transition-all shrink-0 active:scale-90"
                        title="Mark as done"
                      >
                        <Check className="w-4.5 h-4.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
                <Award className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-3" />
                <p className="font-semibold text-sm">All cleared! No outstanding warnings.</p>
              </div>
            )}
          </Card>
        </div>

        {/* AI Advisor Panel */}
        <Card className="flex flex-col h-fit bg-gradient-to-tr from-slate-950 to-brand-navy border-transparent text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-[-20%] right-[-10%] w-56 h-56 bg-brand-purple/10 rounded-full blur-[80px]" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight">AI Advisor Consultation</h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">LLM Score Analyzer</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-5 mb-6">
            Execute a detailed analysis of your ledger balances. The AI will evaluate debt ratios, savings margins, and outline an action plan.
          </p>

          <Button 
            onClick={triggerAIConsultation} 
            disabled={consulting}
            className="w-full py-3 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span>{consulting ? 'Analyzing Ledger...' : 'Trigger Consultation'}</span>
          </Button>

          {/* Render simulation result */}
          {consultationReport && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 border-t border-slate-800/80 pt-6 space-y-4 text-xs text-slate-350 leading-5"
            >
              <div className="flex items-center gap-1.5 text-brand-blue font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>AI Action Plan Generated</span>
              </div>
              <div 
                className="prose prose-sm prose-invert"
                dangerouslySetInnerHTML={{ 
                  __html: consultationReport
                    .replace(/### (.*)/g, '<h4 class="font-bold text-gray-100 mt-4 mb-1 text-xs">$1</h4>')
                    .replace(/\n/g, '<br />') 
                }} 
              />
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
};
