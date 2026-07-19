import { useMemo } from 'react';
import { Link } from 'react-router';
import { TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell } from 'recharts';
import { STOCKS, SECTORS } from '../data/stocks';
import { useApp } from '../context/AppContext';

export default function MarketAnalysisPage() {
  const { livePrices, liveChanges } = useApp();

  const stocksWithLive = useMemo(() => STOCKS.map(s => ({
    ...s,
    livePrice: livePrices[s.id] ?? s.currentPrice,
    liveChange: liveChanges[s.id] ?? { change: s.change, changePercent: s.changePercent },
  })), [livePrices, liveChanges]);

  const sorted = useMemo(() => [...stocksWithLive].sort((a, b) => b.liveChange.changePercent - a.liveChange.changePercent), [stocksWithLive]);
  const gainers = sorted.slice(0, 8);
  const losers = sorted.slice(-8).reverse();

  const advancing = stocksWithLive.filter(s => s.liveChange.changePercent >= 0).length;
  const declining = stocksWithLive.length - advancing;

  const sectorPerf = useMemo(() => SECTORS.map(sector => {
    const stocks = stocksWithLive.filter(s => s.sector === sector);
    const avgChange = stocks.reduce((sum, s) => sum + s.liveChange.changePercent, 0) / stocks.length;
    return { sector: sector.replace(' ', '\n'), fullSector: sector, change: +avgChange.toFixed(2), count: stocks.length };
  }).sort((a, b) => b.change - a.change), [stocksWithLive]);

  const radarData = sectorPerf.map(s => ({
    sector: s.fullSector,
    performance: Math.max(0, s.change + 5),
  }));

  const totalVolume = STOCKS.reduce((sum, s) => sum + s.volume, 0);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#e7fef6', letterSpacing: '-0.02em' }}>Market Analysis</h1>
        <p style={{ fontSize: '13px', color: '#808080', marginTop: '2px' }}>Real-time market overview</p>
      </div>

      {/* Market summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Stocks', value: STOCKS.length.toString(), icon: <BarChart2 size={16} />, color: '#f6f609', bg: 'rgba(246,246,9,0.1)' },
          { label: 'Advancing', value: advancing.toString(), icon: <TrendingUp size={16} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Declining', value: declining.toString(), icon: <TrendingDown size={16} />, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
          { label: 'Total Volume', value: `${totalVolume.toFixed(0)}M`, icon: <Activity size={16} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: '12px', color: '#808080' }}>{s.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Market breadth indicator */}
      <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6' }}>Market Breadth</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }} />
              <span style={{ fontSize: '12px', color: '#999999' }}>Advancing {advancing}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f43f5e' }} />
              <span style={{ fontSize: '12px', color: '#999999' }}>Declining {declining}</span>
            </div>
          </div>
        </div>
        <div className="flex rounded-full overflow-hidden h-3">
          <div style={{ flex: advancing, background: 'linear-gradient(90deg, #10b981, #059669)', transition: 'flex 0.5s ease' }} />
          <div style={{ flex: declining, background: 'linear-gradient(90deg, #f43f5e, #dc2626)', transition: 'flex 0.5s ease' }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span style={{ fontSize: '11px', color: '#10b981' }}>{((advancing / STOCKS.length) * 100).toFixed(0)}% advancing</span>
          <span style={{ fontSize: '11px', color: '#f43f5e' }}>{((declining / STOCKS.length) * 100).toFixed(0)}% declining</span>
        </div>
      </div>

      {/* Sector performance + Radar */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6', marginBottom: '16px' }}>Sector Performance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sectorPerf} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#4d4d4d', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`} />
              <YAxis type="category" dataKey="fullSector" tick={{ fill: '#b3b3b3', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px', color: '#e7fef6', fontSize: '12px' }} formatter={(v: number) => [`${v > 0 ? '+' : ''}${v.toFixed(2)}%`, 'Avg Change']} />
              <Bar dataKey="change" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {sectorPerf.map((entry, index) => (
                  <Cell key={`bar-cell-${index}-${entry.fullSector}`} fill={entry.change >= 0 ? '#10b981' : '#f43f5e'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6', marginBottom: '16px' }}>Sector Radar</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#333333" />
              <PolarAngleAxis dataKey="sector" tick={{ fill: '#808080', fontSize: 9 }} />
              <Radar name="Performance" dataKey="performance" stroke="#f6f609" fill="#f6f609" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gainers & Losers */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6' }}>Top Gainers</h3>
          </div>
          <div className="space-y-2">
            {gainers.map((s, i) => (
              <Link key={s.id} to={`/stocks/${s.id}`} style={{ textDecoration: 'none' }}>
                <div className="flex items-center gap-3 p-2.5 rounded-lg transition-all"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <span style={{ fontSize: '12px', color: '#4d4d4d', width: '16px', textAlign: 'right' }}>{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: s.color }}>{s.symbol.slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>{s.symbol}</div>
                    <div style={{ fontSize: '11px', color: '#808080' }} className="truncate">{s.companyName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>${s.livePrice.toFixed(2)}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>+{s.liveChange.changePercent.toFixed(2)}%</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={16} style={{ color: '#f43f5e' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6' }}>Top Losers</h3>
          </div>
          <div className="space-y-2">
            {losers.map((s, i) => (
              <Link key={s.id} to={`/stocks/${s.id}`} style={{ textDecoration: 'none' }}>
                <div className="flex items-center gap-3 p-2.5 rounded-lg transition-all"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <span style={{ fontSize: '12px', color: '#4d4d4d', width: '16px', textAlign: 'right' }}>{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: s.color }}>{s.symbol.slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>{s.symbol}</div>
                    <div style={{ fontSize: '11px', color: '#808080' }} className="truncate">{s.companyName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>${s.livePrice.toFixed(2)}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#f43f5e' }}>{s.liveChange.changePercent.toFixed(2)}%</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Sector stocks breakdown */}
      <div className="p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6', marginBottom: '16px' }}>Stocks by Sector</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sectorPerf.map(s => (
            <div key={s.fullSector} className="p-3 rounded-xl" style={{ background: '#0d0d0d', border: '1px solid #333333' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#b3b3b3', marginBottom: '4px' }}>{s.fullSector}</div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '11px', color: '#4d4d4d' }}>{s.count} stocks</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: s.change >= 0 ? '#10b981' : '#f43f5e' }}>
                  {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
