import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! I am your AI Financial Advisor. How can I help you optimize your Financial Health Score today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [metrics, setMetrics] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load user dashboard stats to provide context-aware recommendations
    const loadMetrics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setMetrics(res.data);
      } catch (err) {
        console.error("Failed to load dashboard context for chatbot:", err);
      }
    };
    loadMetrics();
  }, []);

  useEffect(() => {
    // Auto scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateContextualReply = (userMsg: string): string => {
    const msg = userMsg.toLowerCase();
    
    // Check if we have context stats
    const summary = metrics?.summary;
    const spending = metrics?.spending_by_category || {};
    
    if (msg.includes('score') || msg.includes('improve') || msg.includes('health')) {
      if (summary) {
        const debtRatio = summary.total_liabilities / (summary.total_assets || 1);
        if (debtRatio > 0.3) {
          return `Based on your profile, your liabilities are significant at ₹${summary.total_liabilities.toLocaleString()}. Prioritizing repayments for your highest-interest loans could reduce your Debt Ratio and boost your score.`;
        }
        if (summary.total_savings < 5000) {
          return `Your total savings are currently ₹${summary.total_savings.toLocaleString()}. I recommend allocating 15% of your income to goals to build your Emergency Fund. Having a 6-month buffer contributes 100 points directly to your health score.`;
        }
      }
      return "To improve your score: 1. Keep credit card utilization under 30%. 2. Set aside a 6-month emergency cushion. 3. Maintain regular investments (at least 15% of income) and pay your loan EMIs on time.";
    }

    if (msg.includes('spend') || msg.includes('budget') || msg.includes('expensive')) {
      const topCategory = Object.entries(spending).reduce((a: any, b: any) => a[1] > b[1] ? a : b, ['None', 0]);
      if (topCategory[0] !== 'None' && topCategory[1] > 0) {
        return `Looking at your recent logs, your largest spending area is "${topCategory[0]}" at ₹${topCategory[1].toLocaleString()} this month. Trimming this category by 15% would immediately increase your monthly savings rate.`;
      }
      return "I recommend reviewing your recent transactions under the 'Transactions' tab. Categorize expenses and use a 50/30/20 rule (50% Needs, 30% Wants, 20% Savings).";
    }

    if (msg.includes('saving') || msg.includes('emergency')) {
      if (summary) {
        return `Your active savings stand at ₹${summary.total_savings.toLocaleString()}. Aim for ₹1,50,000 to cover general risks. Try setting up auto-save vaults in your banking app!`;
      }
      return "Building an emergency fund is critical. Try tracking a dedicated 'Emergency Fund' goal under our Goals tab and target 6 months of basic expenses.";
    }

    if (msg.includes('invest') || msg.includes('stock') || msg.includes('mutual')) {
      if (summary) {
        return `Your investments are valued at ₹${summary.total_investments.toLocaleString()}. To grow your net worth (₹${summary.net_worth.toLocaleString()}), try regular SIP contributions into diversified mutual funds.`;
      }
      return "Investments represent 15% of your Health Score. Starting with mutual funds or stock market index funds is a great way to grow your capital.";
    }

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hello! I am ready to review your ledger. Ask me about your 'spending habits', 'how to improve your score', or your 'current asset values'.";
    }

    return "I appreciate your message. I can analyze your financial indicators to help. Try asking about your 'debts', 'spending', 'savings', or 'how to increase your health score'.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot thinking and responding
    setTimeout(() => {
      const botReplyText = generateContextualReply(userMessage.text);
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botReplyText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-tr from-brand-blue to-brand-purple rounded-full shadow-2xl flex items-center justify-center text-white focus:outline-none hover:brightness-110"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 w-96 h-[500px] bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-brand-blue to-brand-purple text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
                🤖
              </div>
              <div>
                <h4 className="font-bold text-sm">AI Financial Assistant</h4>
                <span className="text-[10px] text-brand-blue/30 opacity-90 block">Powered by XGBoost Analysis</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="ml-auto text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Messages Screen */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-slate-950/40">
              {messages.map((m) => {
                const isBot = m.sender === 'bot';
                return (
                  <div key={m.id} className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isBot ? 'bg-brand-purple/10 text-brand-purple' : 'bg-brand-blue/10 text-brand-blue'}`}>
                      {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs max-w-[70%] leading-5 shadow-sm ${
                      isBot 
                        ? 'bg-white dark:bg-slate-850 text-gray-800 dark:text-gray-250 rounded-tl-none border border-gray-100 dark:border-slate-800/80' 
                        : 'bg-gradient-to-r from-brand-blue to-brand-indigo text-white rounded-tr-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-gray-150 dark:border-slate-800/80 flex gap-2 bg-white dark:bg-slate-900">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about spending, saving tips..."
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-950 text-xs text-gray-800 dark:text-gray-200 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-purple/50"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 bg-brand-purple text-white rounded-xl flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
