import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardTitle, Button, Badge } from '../components/ui/CustomUI';
import { Download, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

export const FinancialScore: React.FC = () => {
  const [scoreData, setScoreData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchScoreData = async () => {
    try {
      const [scoreRes, historyRes] = await Promise.all([
        api.get('/financial-score'),
        api.get('/financial-score/history')
      ]);
      setScoreData(scoreRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Failed to load financial score data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScoreData();
  }, []);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const res = await api.post('/financial-score/recalculate');
      setScoreData(res.data);
      // Reload history to see the new data point
      const historyRes = await api.get('/financial-score/history');
      setHistory(historyRes.data);
    } catch (err) {
      console.error("Recalculation failed:", err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      // Fetch report as file stream blob
      const res = await api.get('/financial-score/report', {
        responseType: 'blob'
      });
      
      // Create download trigger
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial_report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download PDF report:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !scoreData) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
      </div>
    );
  }

  const score = scoreData.score;
  
  // Set ratings
  let ratingLabel = "Fair";
  let ratingColor = "border-amber-500 text-amber-500 bg-amber-500/10";
  let description = "Your financial health is stable but has room for improvement. Take action on recommendations to increase savings and lower debt.";
  
  if (score >= 800) {
    ratingLabel = "Excellent";
    ratingColor = "border-green-550 text-green-550 bg-green-550/10";
    description = "Fantastic! You display exceptional budgeting, debt controls, and savings velocity. Maintain these habits to build long-term wealth.";
  } else if (score >= 700) {
    ratingLabel = "Good";
    ratingColor = "border-brand-blue text-brand-blue bg-brand-blue/10";
    description = "Solid standing! You meet most target ranges. Focus on optimization tips like trimming minor expenses or diversifying asset investments.";
  } else if (score < 550) {
    ratingLabel = "Needs Attention";
    ratingColor = "border-red-500 text-red-500 bg-red-500/10";
    description = "Warning: Your finances show elevated risks. High debt load or low liquidity limits your security. Prioritize building emergency vaults.";
  }

  // 6 Pillars breakdown mapping
  const pillars = [
    {
      name: "Savings Rate",
      weight: "25%",
      metric: `${(parseFloat(scoreData.savings_rate) * 100).toFixed(1)}%`,
      target: ">= 30.0%",
      status: parseFloat(scoreData.savings_rate) >= 0.3 ? "Healthy" : "Low Savings",
      progress: Math.min(100, (parseFloat(scoreData.savings_rate) / 0.3) * 100),
      isOptimal: parseFloat(scoreData.savings_rate) >= 0.3,
      info: "Your net monthly income relative to expenditures. Highly weighted."
    },
    {
      name: "Debt Ratio (DTI)",
      weight: "20%",
      metric: `${(parseFloat(scoreData.debt_ratio) * 100).toFixed(1)}%`,
      target: "<= 20.0%",
      status: parseFloat(scoreData.debt_ratio) <= 0.2 ? "Healthy" : "Debt Heavy",
      progress: parseFloat(scoreData.debt_ratio) <= 0.2 ? 100 : Math.max(0, 100 - ((parseFloat(scoreData.debt_ratio) - 0.2) / 0.4) * 100),
      isOptimal: parseFloat(scoreData.debt_ratio) <= 0.2,
      info: "Ratio of monthly loan EMIs relative to salary. Lower is healthier."
    },
    {
      name: "Credit Card Usage",
      weight: "15%",
      metric: `${(parseFloat(scoreData.credit_usage) * 100).toFixed(1)}%`,
      target: "<= 30.0%",
      status: parseFloat(scoreData.credit_usage) <= 0.3 ? "Healthy" : "High Utilization",
      progress: parseFloat(scoreData.credit_usage) <= 0.3 ? 100 : Math.max(0, 100 - ((parseFloat(scoreData.credit_usage) - 0.3) / 0.65) * 100),
      isOptimal: parseFloat(scoreData.credit_usage) <= 0.3,
      info: "Proportion of total credit card limit spent. High usage penalizes scores."
    },
    {
      name: "Investment Rate",
      weight: "15%",
      metric: `${(parseFloat(scoreData.investment_ratio) * 100).toFixed(1)}%`,
      target: ">= 20.0%",
      status: parseFloat(scoreData.investment_ratio) >= 0.2 ? "Healthy" : "Low Investing",
      progress: Math.min(100, (parseFloat(scoreData.investment_ratio) / 0.2) * 100),
      isOptimal: parseFloat(scoreData.investment_ratio) >= 0.2,
      info: "Allocation of funds into wealth assets (stocks, funds, deposits, gold)."
    },
    {
      name: "Emergency Buffer",
      weight: "10%",
      metric: `${parseFloat(scoreData.emergency_fund_ratio).toFixed(1)} mos`,
      target: ">= 6.0 mos",
      status: parseFloat(scoreData.emergency_fund_ratio) >= 6.0 ? "Healthy" : "Insufficient",
      progress: Math.min(100, (parseFloat(scoreData.emergency_fund_ratio) / 6.0) * 100),
      isOptimal: parseFloat(scoreData.emergency_fund_ratio) >= 6.0,
      info: "Number of months of baseline expenses covered by liquid savings vaults."
    },
    {
      name: "Income Stability",
      weight: "15%",
      metric: "Stable", // Abstracted from calculations
      target: "Consistent",
      status: "Healthy",
      progress: 95,
      isOptimal: true,
      info: "Consistency and source of monthly income deposits."
    }
  ];

  // Chart: Historical Scores Line Chart
  const lineData = {
    labels: history.map(x => new Date(x.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Financial Score',
        data: history.map(x => x.score),
        fill: true,
        borderColor: '#7F00FF',
        backgroundColor: 'rgba(127, 0, 255, 0.05)',
        tension: 0.3,
        pointBackgroundColor: '#2F80ED',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">
            Financial Health Score
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Weighted assessment of your ledger balances and monthly velocity
          </p>
        </div>
        
        {/* Buttons Panel */}
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Downloading...' : 'Export PDF Report'}</span>
          </Button>
        </div>
      </div>

      {/* Grid containing score gauge display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Score Circular Gauge Card */}
        <Card className="col-span-1 flex flex-col items-center justify-center text-center p-8">
          <CardTitle className="mb-6">Health Rating</CardTitle>
          
          {/* Gauge Frame */}
          <div className="relative w-44 h-44 flex items-center justify-center rounded-full border-[10px] border-gray-100 dark:border-slate-800">
            {/* Glowing Border overlay */}
            <div className="absolute inset-[-4px] rounded-full border-2 border-dashed border-brand-purple/20 animate-spin-slow" />
            <div className="flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-gray-800 dark:text-gray-100 tracking-tight">{score}</span>
              <span className="text-[10px] text-gray-400 font-extrabold uppercase mt-1">out of 1000</span>
            </div>
          </div>

          <div className={`mt-6 px-4 py-2 rounded-xl border font-black uppercase text-xs tracking-wider ${ratingColor}`}>
            {ratingLabel}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-5 px-2">
            {description}
          </p>
        </Card>

        {/* Score History Graph Card */}
        <Card className="md:col-span-2">
          <CardTitle className="mb-6">Score History Trend</CardTitle>
          <div className="h-60 flex items-center justify-center">
            {history.length > 0 ? (
              <Line 
                data={lineData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            ) : (
              <p className="text-xs text-gray-400">No score history records found.</p>
            )}
          </div>
        </Card>
      </div>

      {/* 6 Pillars Breakdown Details */}
      <Card>
        <CardTitle className="mb-6">Score Breakdown Metrics</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((p, idx) => (
            <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-950/40 rounded-2xl border border-gray-100 dark:border-slate-850/50 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-400 font-bold tracking-wide block mb-0.5">
                      Pillar {idx + 1} | Weight {p.weight}
                    </span>
                    <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-100">
                      {p.name}
                    </h4>
                  </div>
                  {p.isOptimal ? (
                    <Badge variant="success">Optimal</Badge>
                  ) : (
                    <Badge variant="warning">Improve</Badge>
                  )}
                </div>
                
                <p className="text-[11px] text-gray-400 mt-2 font-semibold leading-4">
                  {p.info}
                </p>
              </div>

              {/* Progress Slider */}
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-extrabold text-gray-700 dark:text-gray-300">
                    Actual: <span className="text-brand-purple">{p.metric}</span>
                  </span>
                  <span className="text-gray-400">Target: {p.target}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${p.isOptimal ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
