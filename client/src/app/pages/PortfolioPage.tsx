import { useMemo } from 'react';
import { Link } from 'react-router';
import { TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { STOCKS } from '../data/stocks';

const COLORS = ['#f6f609', '#c5c507', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#84cc16', '#14b8a6'];

function fmt(n: number) {
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export default function PortfolioPage() {
  const { livePrices, holdings, portfolioValue, totalInvested, totalPnl, walletBalance } = useApp();

  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const enrichedHoldings = useMemo(() => holdings.map((h, i) => {
    const livePrice = livePrices[h.stockId] ?? h.averageBuyPrice;
    const currentValue = livePrice * h.quantity;
    const invested = h.averageBuyPrice * h.quantity;
    const pnl = currentValue - invested;
    const pnlPct = (pnl / invested) * 100;
    const stock = STOCKS.find(s => s.id === h.stockId);
    return { ...h, livePrice, currentValue, invested, pnl, pnlPct, stock, color: COLORS[i % COLORS.length] };
  }), [holdings, livePrices]);

  const pieData = enrichedHoldings.map(h => ({ name: h.symbol, value: h.currentValue, color: h.color })).filter(d => d.value > 0);

  const growthData = useMemo(() => {
    if (holdings.length === 0) return [];
    const today = new Date('2026-07-19');
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const val = holdings.reduce((sum, h) => {
        const stock = STOCKS.find(s => s.id === h.stockId);
        if (!stock) return sum;
        const histIdx = Math.max(0, stock.priceHistory.length - 1 - (29 - i));
        const price = stock.priceHistory[histIdx]?.price ?? stock.currentPrice;
        return sum + h.quantity * price;
      }, 0);
      return { date: label, value: +val.toFixed(2) };
    });
  }, [holdings]);

  if (holdings.length === 0) {
    return (
      <div className="p-6">
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#e7fef6', letterSpacing: '-0.02em', marginBottom: '24px' }}>Portfolio</h1>
        <div className="flex flex-col items-center justify-center py-24" style={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: '16px' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(246,246,9,0.1)' }}>
            <Briefcase size={28} style={{ color: '#f6f609' }} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#e7fef6', marginBottom: '8px' }}>Your portfolio is empty</h2>
          <p style={{ fontSize: '14px', color: '#808080', marginBottom: '20px', textAlign: 'center', maxWidth: '280px' }}>
            Start building your portfolio by buying stocks from the markets.
          </p>
          <Link to="/stocks">
            <button className="px-5 py-2.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #f6f609, #c5c507)', color: 'white', fontSize: '14px', fontWeight: 600 }}>
              Browse Markets
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#e7fef6', letterSpacing: '-0.02em' }}>Portfolio</h1>
          <p style={{ fontSize: '13px', color: '#808080', marginTop: '2px' }}>{holdings.length} positions</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Portfolio Value', value: fmt(portfolioValue), sub: 'Current market value', color: '#f6f609' },
          { label: 'Total Invested', value: fmt(totalInvested), sub: 'Cost basis', color: '#999999' },
          { label: 'P&L', value: `${totalPnl >= 0 ? '+' : ''}${fmt(totalPnl)}`, sub: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}% return`, color: totalPnl >= 0 ? '#10b981' : '#f43f5e' },
          { label: 'Available Cash', value: fmt(walletBalance), sub: 'Ready to invest', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
            <div style={{ fontSize: '12px', color: '#808080', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: '#4d4d4d', marginTop: '2px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6', marginBottom: '16px' }}>Portfolio Value — 30 Days</h3>
          <svg width={0} height={0} style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="portfolioGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f6f609" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f6f609" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis dataKey="date" tick={{ fill: '#4d4d4d', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fill: '#4d4d4d', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px', color: '#e7fef6', fontSize: '12px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Value']} />
              <Area isAnimationActive={false} type="monotone" dataKey="value" stroke="#f6f609" strokeWidth={2} fill="url(#portfolioGrowthGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6', marginBottom: '4px' }}>Allocation</h3>
          <p style={{ fontSize: '12px', color: '#808080', marginBottom: '8px' }}>By current value</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie isAnimationActive={false} data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={`pie-cell-${i}-${entry.name}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px', fontSize: '12px', color: '#e7fef6' }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {pieData.slice(0, 5).map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span style={{ fontSize: '12px', color: '#b3b3b3' }}>{d.name}</span>
                <span className="ml-auto" style={{ fontSize: '11px', color: '#999999' }}>
                  {portfolioValue > 0 ? ((d.value / portfolioValue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
        <div className="px-5 py-3.5 border-b" style={{ borderColor: '#333333' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6' }}>Holdings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #333333' }}>
                {['Stock', 'Quantity', 'Avg. Price', 'Current Price', 'Invested', 'Current Value', 'P&L', 'Return'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#808080', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrichedHoldings.map(h => (
                <tr key={h.stockId} style={{ borderBottom: '1px solid #0d0d0d' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <td style={{ padding: '12px 16px' }}>
                    <Link to={`/stocks/${h.stockId}`} className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${h.color}20`, border: `1px solid ${h.color}30` }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: h.color }}>{h.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>{h.symbol}</div>
                        <div style={{ fontSize: '11px', color: '#808080' }} className="truncate max-w-[120px]">{h.companyName}</div>
                      </div>
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>{h.quantity}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#b3b3b3' }}>${h.averageBuyPrice.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>${h.livePrice.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#b3b3b3' }}>{fmt(h.invested)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>{fmt(h.currentValue)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex items-center gap-1">
                      {h.pnl >= 0 ? <TrendingUp size={12} style={{ color: '#10b981' }} /> : <TrendingDown size={12} style={{ color: '#f43f5e' }} />}
                      <span style={{ fontSize: '13px', fontWeight: 600, color: h.pnl >= 0 ? '#10b981' : '#f43f5e' }}>
                        {h.pnl >= 0 ? '+' : ''}{fmt(h.pnl)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="px-2 py-0.5 rounded-md" style={{ fontSize: '12px', fontWeight: 600, background: h.pnlPct >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', color: h.pnlPct >= 0 ? '#10b981' : '#f43f5e' }}>
                      {h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
