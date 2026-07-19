import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, TrendingUp, BarChart3, Briefcase,
  History, Zap, User, LogOut, Menu, X, Search,
  Wallet, ChevronRight, Bell, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import CommandPalette from './CommandPalette';
import FundWalletModal from './FundWalletModal';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Markets', path: '/stocks', icon: <TrendingUp size={18} /> },
  { label: 'Portfolio', path: '/portfolio', icon: <Briefcase size={18} /> },
  { label: 'Transactions', path: '/transactions', icon: <History size={18} /> },
  { label: 'Analysis', path: '/market', icon: <BarChart3 size={18} /> },
];

function formatCurrency(n: number) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const { user, logout } = useAuth();
  const { walletBalance } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d0d0d', color: '#e7fef6' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#111111', borderRight: '1px solid #333333' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: '#333333' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f6f609' }}>
            <Zap size={16} color="#0d0d0d" fill="#0d0d0d" />
          </div>
          <div>
            <div style={{ color: '#e7fef6', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.03em' }}>Stockify</div>
            <div style={{ color: '#3d3d3d', fontSize: '10px', fontWeight: 500 }}>Markets</div>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ color: '#999999' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group"
                style={{
                  background: active ? 'rgba(246,246,9,0.12)' : 'transparent',
                  color: active ? '#f8f83a' : '#999999',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{ color: active ? '#f8f83a' : '#808080' }}>{item.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: active ? 500 : 400 }}>{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto" style={{ color: '#f6f609' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Wallet */}
        <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: 'rgba(246,246,9,0.08)', border: '1px solid rgba(246,246,9,0.2)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={14} style={{ color: '#f6f609' }} />
            <span style={{ fontSize: '12px', color: '#999999' }}>Available Cash</span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#e7fef6', letterSpacing: '-0.02em' }}>
              {formatCurrency(walletBalance)}
            </div>
            <button
              onClick={() => setDepositOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
              style={{ background: 'rgba(246,246,9,0.15)', border: '1px solid rgba(246,246,9,0.3)', color: '#f6f609', fontSize: '11px', fontWeight: 700 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(246,246,9,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(246,246,9,0.15)'; }}
              title="Add funds"
            >
              <Plus size={11} />
              Add
            </button>
          </div>
        </div>
        {depositOpen && <FundWalletModal onDone={() => setDepositOpen(false)} />}

        {/* Profile */}
        <div className="p-3 border-t" style={{ borderColor: '#333333' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f6f609, #c5c507)', fontSize: '13px', fontWeight: 600, color: 'white' }}
            >
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#e7fef6' }} className="truncate">{user?.name}</div>
              <div style={{ fontSize: '11px', color: '#808080' }} className="truncate">@{user?.username}</div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#808080' }}
              title="Logout"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f43f5e'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#808080'; }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-4 px-5 py-3.5 flex-shrink-0"
          style={{ background: 'rgba(8,12,20,0.9)', borderBottom: '1px solid #333333', backdropFilter: 'blur(12px)' }}
        >
          <button
            className="lg:hidden p-1.5 rounded-lg"
            onClick={() => setSidebarOpen(true)}
            style={{ color: '#999999' }}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <button
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg flex-1 max-w-xs transition-colors text-left"
            style={{ background: '#1a1a1a', border: '1px solid #333333', color: '#808080' }}
            onClick={() => setCmdOpen(true)}
          >
            <Search size={14} />
            <span style={{ fontSize: '13px' }}>Search stocks, pages...</span>
            <kbd className="ml-auto flex items-center gap-1 text-xs" style={{ color: '#4d4d4d', background: '#333333', padding: '2px 6px', borderRadius: '4px' }}>
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              className="p-2 rounded-lg relative"
              style={{ color: '#999999' }}
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </button>
            <Link to="/profile">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #f6f609, #c5c507)', fontSize: '12px', fontWeight: 600, color: 'white' }}
              >
                {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
