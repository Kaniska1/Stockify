import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, TrendingUp, LayoutDashboard, Briefcase, History, BarChart3, User, X } from 'lucide-react';
import { STOCKS } from '../data/stocks';
import { useApp } from '../context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PAGES = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={15} /> },
  { label: 'Markets', path: '/stocks', icon: <TrendingUp size={15} /> },
  { label: 'Portfolio', path: '/portfolio', icon: <Briefcase size={15} /> },
  { label: 'Transactions', path: '/transactions', icon: <History size={15} /> },
  { label: 'Market Analysis', path: '/market', icon: <BarChart3 size={15} /> },
  { label: 'Profile', path: '/profile', icon: <User size={15} /> },
];

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const { livePrices, liveChanges } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const q = query.toLowerCase().trim();
  const stockResults = q
    ? STOCKS.filter(s => s.symbol.toLowerCase().includes(q) || s.companyName.toLowerCase().includes(q)).slice(0, 5)
    : STOCKS.slice(0, 5);
  const pageResults = PAGES.filter(p => !q || p.label.toLowerCase().includes(q));

  const allResults = [
    ...stockResults.map(s => ({ type: 'stock' as const, key: s.id, label: s.companyName, sub: s.symbol, path: `/stocks/${s.id}`, icon: null, stock: s })),
    ...pageResults.map(p => ({ type: 'page' as const, key: p.path, label: p.label, sub: 'Navigate', path: p.path, icon: p.icon, stock: null })),
  ];

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(p => Math.min(p + 1, allResults.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(p => Math.max(p - 1, 0)); }
      if (e.key === 'Enter') {
        const item = allResults[selected];
        if (item) { navigate(item.path); onClose(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, allResults, selected, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#1a1a1a', border: '1px solid #333333', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: '#333333' }}>
          <Search size={16} style={{ color: '#808080', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search stocks, pages..."
            className="flex-1 bg-transparent outline-none placeholder-slate-600"
            style={{ fontSize: '15px', color: '#e7fef6' }}
          />
          <button onClick={onClose} style={{ color: '#808080' }}>
            <X size={15} />
          </button>
        </div>

        {/* Results */}
        <div className="py-2 max-h-80 overflow-y-auto">
          {allResults.length === 0 && (
            <div className="px-4 py-8 text-center" style={{ color: '#808080', fontSize: '14px' }}>No results found</div>
          )}

          {stockResults.length > 0 && (
            <>
              <div className="px-4 py-1.5" style={{ fontSize: '11px', color: '#4d4d4d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stocks</div>
              {stockResults.map((stock, i) => {
                const livePrice = livePrices[stock.id] ?? stock.currentPrice;
                const change = liveChanges[stock.id] ?? { change: stock.change, changePercent: stock.changePercent };
                const isGain = change.changePercent >= 0;
                const idx = i;
                return (
                  <button
                    key={stock.id}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                    style={{ background: selected === idx ? 'rgba(246,246,9,0.1)' : 'transparent' }}
                    onClick={() => { navigate(`/stocks/${stock.id}`); onClose(); }}
                    onMouseEnter={() => setSelected(idx)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${stock.color}20`, border: `1px solid ${stock.color}30` }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: stock.color }}>{stock.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#e7fef6' }} className="truncate">{stock.companyName}</div>
                      <div style={{ fontSize: '11px', color: '#808080' }}>{stock.symbol} · {stock.sector}</div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>${livePrice.toFixed(2)}</div>
                      <div style={{ fontSize: '11px', color: isGain ? '#10b981' : '#f43f5e' }}>{isGain ? '+' : ''}{change.changePercent.toFixed(2)}%</div>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {pageResults.length > 0 && (
            <>
              <div className="px-4 py-1.5 mt-1" style={{ fontSize: '11px', color: '#4d4d4d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pages</div>
              {pageResults.map((page, i) => {
                const idx = stockResults.length + i;
                return (
                  <button
                    key={page.path}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                    style={{ background: selected === idx ? 'rgba(246,246,9,0.1)' : 'transparent' }}
                    onClick={() => { navigate(page.path); onClose(); }}
                    onMouseEnter={() => setSelected(idx)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(246,246,9,0.1)', border: '1px solid rgba(246,246,9,0.2)' }}>
                      <span style={{ color: '#f6f609' }}>{page.icon}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#e7fef6' }}>{page.label}</div>
                    <span className="ml-auto" style={{ fontSize: '11px', color: '#4d4d4d' }}>Navigate →</span>
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div className="px-4 py-2.5 border-t flex items-center gap-4" style={{ borderColor: '#333333' }}>
          {[['↑↓', 'Navigate'], ['↵', 'Open'], ['Esc', 'Close']].map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <kbd style={{ background: '#333333', color: '#999999', padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>{key}</kbd>
              <span style={{ fontSize: '11px', color: '#4d4d4d' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
