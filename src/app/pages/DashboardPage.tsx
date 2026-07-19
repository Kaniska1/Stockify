import { useMemo } from 'react';
import { Link } from 'react-router';
import { TrendingUp, TrendingDown, Wallet, BarChart2, DollarSign, Activity, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { STOCKS } from '../data/stocks';

function fmt(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const COLORS = ['#f6f609', '#c5c507', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#ec4899'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { livePrices, liveChanges, walletBalance, holdings, transactions, portfolioValue, totalInvested, dayPnl, totalPnl } = useApp();

  const totalValue = portfolioValue + walletBalance;
  const totalReturn = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const sortedByChange = useMemo(() =>
    [...STOCKS].sort((a, b) => (liveChanges[b.id]?.changePercent ?? b.changePercent) - (liveChanges[a.id]?.changePercent ?? a.changePercent)),
    [liveChanges]
  );
  const gainers = sortedByChange.slice(0, 5);
  const losers = sortedByChange.slice(-5).reverse();

  // Build portfolio chart from first transaction date
  const portfolioChartData = useMemo(() => {
    if (holdings.length === 0) return [];
    const today = new Date('2026-07-19');
    const points = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const val = holdings.reduce((sum, h) => {
        const stock = STOCKS.find(s => s.id === h.stockId);
        if (!stock) return sum;
        const daysBack = i;
        const histIdx = Math.max(0, stock.priceHistory.length - 1 - daysBack);
        const price = stock.priceHistory[histIdx]?.price ?? stock.currentPrice;
        return sum + h.quantity * price;
      }, 0);
      points.push({ date: label, value: +val.toFixed(2) });
    }
    return points;
  }, [holdings]);

  const pieData = useMemo(() =>
    holdings.map((h, i) => ({
      name: h.symbol,
      value: h.quantity * (livePrices[h.stockId] ?? 0),
      color: COLORS[i % COLORS.length],
    })).filter(d => d.value > 0),
    [holdings, livePrices]
  );

  const recentTx = transactions.slice(0, 5);
  const popularStocks = STOCKS.slice(0, 8);

  const stats = [
    { label: 'Total Portfolio', value: fmt(totalValue), sub: `Cash + Stocks`, icon: <Wallet size={18} />, color: '#f6f609', bg: 'rgba(246,246,9,0.1)' },
    { label: "Today's P&L", value: fmt(dayPnl), sub: dayPnl >= 0 ? 'Gain today' : 'Loss today', icon: dayPnl >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />, color: dayPnl >= 0 ? '#10b981' : '#f43f5e', bg: dayPnl >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' },
    { label: 'Total Returns', value: `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`, sub: fmt(totalPnl), icon: <BarChart2 size={18} />, color: totalPnl >= 0 ? '#10b981' : '#f43f5e', bg: totalPnl >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' },
    { label: 'Available Cash', value: fmt(walletBalance), sub: 'Ready to invest', icon: <DollarSign size={18} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#e7fef6', letterSpacing: '-0.02em' }}>
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: '13px', color: '#808080', marginTop: '2px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Link to="/stocks">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all" style={{ background: 'linear-gradient(135deg, #f6f609, #c5c507)', color: 'white', fontSize: '13px', fontWeight: 600 }}>
            <Activity size={14} /> Trade Now
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="p-4 rounded-xl transition-all" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: '12px', color: '#808080' }}>{s.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#808080', marginTop: '2px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Portfolio growth */}
        <div className="lg:col-span-2 p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6' }}>Portfolio Growth</h3>
              <p style={{ fontSize: '12px', color: '#808080' }}>Last 30 days</p>
            </div>
            <div style={{ fontSize: '13px', color: totalPnl >= 0 ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
              {totalPnl >= 0 ? '+' : ''}{fmt(totalPnl)}
            </div>
          </div>
          {portfolioChartData.length > 0 ? (
            <>
              <svg width={0} height={0} style={{ position: 'absolute' }}>
                <defs>
                  <linearGradient id="dashPGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f6f609" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f6f609" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </svg>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={portfolioChartData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="date" tick={{ fill: '#4d4d4d', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
                <YAxis tick={{ fill: '#4d4d4d', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px', color: '#e7fef6', fontSize: '12px' }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Value']}
                />
                <Area isAnimationActive={false} type="monotone" dataKey="value" stroke="#f6f609" strokeWidth={2} fill="url(#dashPGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            </>
          ) : (
            <div className="h-[180px] flex flex-col items-center justify-center">
              <BarChart2 size={32} style={{ color: '#333333', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: '#808080' }}>Buy stocks to see portfolio growth</p>
              <Link to="/stocks" style={{ fontSize: '12px', color: '#f6f609', marginTop: '8px' }}>Browse Markets →</Link>
            </div>
          )}
        </div>

        {/* Allocation */}
        <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6', marginBottom: '4px' }}>Allocation</h3>
          <p style={{ fontSize: '12px', color: '#808080', marginBottom: '12px' }}>{holdings.length} positions</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie isAnimationActive={false} data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={`pie-cell-${i}-${entry.name}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px', fontSize: '12px', color: '#e7fef6' }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.slice(0, 4).map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span style={{ fontSize: '12px', color: '#b3b3b3' }}>{d.name}</span>
                    <span className="ml-auto" style={{ fontSize: '12px', color: '#999999' }}>{((d.value / portfolioValue) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[160px] flex flex-col items-center justify-center">
              <p style={{ fontSize: '13px', color: '#808080', textAlign: 'center' }}>No holdings yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent transactions */}
        <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6' }}>Recent Transactions</h3>
            <Link to="/transactions" style={{ fontSize: '12px', color: '#f6f609' }}>View all</Link>
          </div>
          {recentTx.length === 0 ? (
            <div className="py-8 text-center" style={{ color: '#808080', fontSize: '13px' }}>No transactions yet</div>
          ) : (
            <div className="space-y-3">
              {recentTx.map(tx => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: tx.type === 'BUY' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' }}>
                    {tx.type === 'BUY' ? <TrendingUp size={14} style={{ color: '#10b981' }} /> : <TrendingDown size={14} style={{ color: '#f43f5e' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#e7fef6' }}>{tx.symbol}</div>
                    <div style={{ fontSize: '11px', color: '#808080' }}>{tx.quantity} shares · {fmtDate(tx.timestamp)}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: tx.type === 'BUY' ? '#f43f5e' : '#10b981', textAlign: 'right' }}>
                    {tx.type === 'BUY' ? '-' : '+'}{fmt(tx.totalAmount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Gainers */}
        <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6' }}>Top Gainers</h3>
            <TrendingUp size={15} style={{ color: '#10b981' }} />
          </div>
          <div className="space-y-3">
            {gainers.map(s => {
              const chg = liveChanges[s.id] ?? { changePercent: s.changePercent };
              return (
                <Link key={s.id} to={`/stocks/${s.id}`} className="flex items-center gap-3 group">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: s.color }}>{s.symbol.slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#e7fef6' }}>{s.symbol}</div>
                    <div style={{ fontSize: '11px', color: '#808080' }}>${(livePrices[s.id] ?? s.currentPrice).toFixed(2)}</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>+{chg.changePercent.toFixed(2)}%</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Top Losers */}
        <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6' }}>Top Losers</h3>
            <TrendingDown size={15} style={{ color: '#f43f5e' }} />
          </div>
          <div className="space-y-3">
            {losers.map(s => {
              const chg = liveChanges[s.id] ?? { changePercent: s.changePercent };
              return (
                <Link key={s.id} to={`/stocks/${s.id}`} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: s.color }}>{s.symbol.slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#e7fef6' }}>{s.symbol}</div>
                    <div style={{ fontSize: '11px', color: '#808080' }}>${(livePrices[s.id] ?? s.currentPrice).toFixed(2)}</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#f43f5e' }}>{chg.changePercent.toFixed(2)}%</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular stocks */}
      <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6' }}>Popular Stocks</h3>
          <Link to="/stocks" className="flex items-center gap-1" style={{ fontSize: '12px', color: '#f6f609' }}>
            View all <ChevronRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {popularStocks.map(s => {
            const price = livePrices[s.id] ?? s.currentPrice;
            const chg = liveChanges[s.id] ?? { changePercent: s.changePercent };
            const isUp = chg.changePercent >= 0;
            return (
              <Link key={s.id} to={`/stocks/${s.id}`} className="p-3 rounded-lg transition-all" style={{ background: '#0d0d0d', border: '1px solid #333333', textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4d4d4d'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#333333'; }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${s.color}20` }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: s.color }}>{s.symbol.slice(0, 2)}</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#e7fef6' }}>{s.symbol}</div>
                <div style={{ fontSize: '11px', color: '#b3b3b3' }}>${price.toFixed(2)}</div>
                <div style={{ fontSize: '11px', color: isUp ? '#10b981' : '#f43f5e', marginTop: '2px' }}>
                  {isUp ? '+' : ''}{chg.changePercent.toFixed(2)}%
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
