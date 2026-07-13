import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { FinancialScore } from './pages/FinancialScore';
import { Transactions } from './pages/Transactions';
import { Savings } from './pages/Savings';
import { Investments } from './pages/Investments';
import { Goals } from './pages/Goals';
import { Recommendations } from './pages/Recommendations';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { FloatingChatbot } from './components/Chatbot/FloatingChatbot';

// Protected Admin Route Constraint
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// Open-access Login/Register constraints (redirects back to dashboard if session exists)
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const DashboardRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        
        {/* Core Layout Shell */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="score" element={<FinancialScore />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="savings" element={<Savings />} />
          <Route path="investments" element={<Investments />} />
          <Route path="goals" element={<Goals />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Floating chatbot assistant */}
      <ChatbotWrapper />
    </>
  );
};

// Help wrapper to render Chatbot only when user session exists
const ChatbotWrapper: React.FC = () => {
  const { token } = useAuth();
  if (!token) return null;
  return <FloatingChatbot />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <DashboardRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
