// @ts-nocheck
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import StocksPage from './pages/StocksPage';
import StockDetailPage from './pages/StockDetailPage';
import PortfolioPage from './pages/PortfolioPage';
import TransactionsPage from './pages/TransactionsPage';
import MarketAnalysisPage from './pages/MarketAnalysisPage';
import ProfilePage from './pages/ProfilePage';
import WatchlistPage from "./pages/WatchlistPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import PortfolioAnalyzerPage from "./pages/PortfolioAnalyzerPage";

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d0d' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(246,246,9,0.15)', borderTopColor: '#f6f609' }} />
        <span style={{ fontSize: '13px', color: '#333' }}>Connecting to database…</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();
  if (authLoading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <AuthLoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/stocks" element={<ProtectedRoute><Layout><StocksPage /></Layout></ProtectedRoute>} />
      <Route path="/stocks/:id" element={<ProtectedRoute><Layout><StockDetailPage /></Layout></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute><Layout><PortfolioPage /></Layout></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Layout><TransactionsPage /></Layout></ProtectedRoute>} />
      <Route path="/market" element={<ProtectedRoute><Layout><MarketAnalysisPage /></Layout></ProtectedRoute>} />
      <Route path="/watchlist" element={<ProtectedRoute><Layout><WatchlistPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute><Layout><AIAssistantPage /></Layout></ProtectedRoute>} />
      <Route path="/portfolio-analyzer" element={<ProtectedRoute><Layout><PortfolioAnalyzerPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0d0d0d' }}>
      <div style={{ fontSize: '72px', fontWeight: 800, color: '#333333', letterSpacing: '-0.04em' }}>404</div>
      <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#e7fef6', marginBottom: '8px' }}>Page not found</h1>
      <p style={{ fontSize: '14px', color: '#808080', marginBottom: '20px' }}>The page you're looking for doesn't exist.</p>
      <a href="/dashboard" style={{ fontSize: '14px', color: '#f6f609', textDecoration: 'none' }}>← Back to Dashboard</a>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.background = '#0d0d0d';
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
            <AppRoutes />

            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#1a1a1a",
                  border: "1px solid #333333",
                  color: "#e7fef6",
                  fontSize: "13px",
                },
              }}
            />
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
