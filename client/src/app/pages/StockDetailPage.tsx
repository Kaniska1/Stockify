import { useState, useMemo, FormEvent } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, TrendingUp, TrendingDown, ShoppingCart, Minus, AlertCircle, X, Check, Bookmark, BookmarkCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { STOCKS_MAP } from '../data/stocks';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

const PERIODS = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 60 },
  { label: '6M', days: 75 },
  { label: '1Y', days: 90 },
];

function TradeModal({ type, stockId, onClose }: { type: 'BUY' | 'SELL'; stockId: string; onClose: () => void }) {
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { livePrices, walletBalance, getHolding, buyStock, sellStock } = useApp();

  const stock = STOCKS_MAP[stockId];
  const price = livePrices[stockId] ?? stock?.currentPrice ?? 0;
  const holding = getHolding(stockId);
  const quantity = parseInt(qty) || 0;
  const total = price * quantity;
  const canBuy = type === 'BUY' && total <= walletBalance && quantity > 0;
  const canSell = type === 'SELL' && quantity > 0 && (holding?.quantity ?? 0) >= quantity;
  const canSubmit = type === 'BUY' ? canBuy : canSell;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      if (type === 'BUY') await buyStock(stockId, quantity);
      else await sellStock(stockId, quantity);
      setSuccess(true);
      toast.success(`${type === 'BUY' ? 'Bought' : 'Sold'} ${quantity} shares of ${stock?.symbol}!`);
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (!stock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#1a1a1a', border: '1px solid #333333' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e7fef6' }}>{type === 'BUY' ? 'Buy' : 'Sell'} {stock.symbol}</h3>
            <p style={{ fontSize: '12px', color: '#808080' }}>{stock.companyName}</p>
          </div>
          <button onClick={onClose} style={{ color: '#808080' }}>
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <Check size={24} style={{ color: '#10b981' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#10b981' }}>Order Executed!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-3 rounded-xl mb-4" style={{ background: '#0d0d0d', border: '1px solid #333333' }}>
              <div className="flex justify-between">
                <span style={{ fontSize: '12px', color: '#808080' }}>Current Price</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#e7fef6' }}>${price.toFixed(2)}</span>
              </div>
              {type === 'BUY' && (
                <div className="flex justify-between mt-1">
                  <span style={{ fontSize: '12px', color: '#808080' }}>Available Cash</span>
                  <span style={{ fontSize: '12px', color: '#999999' }}>${walletBalance.toLocaleString()}</span>
                </div>
              )}
              {type === 'SELL' && (
                <div className="flex justify-between mt-1">
                  <span style={{ fontSize: '12px', color: '#808080' }}>Shares Owned</span>
                  <span style={{ fontSize: '12px', color: '#999999' }}>{holding?.quantity ?? 0}</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#b3b3b3', display: 'block', marginBottom: '6px' }}>Quantity</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(e.target.value)}
                placeholder="Number of shares"
                className="w-full rounded-lg px-3.5 py-2.5 outline-none"
                style={{ background: '#0d0d0d', border: '1px solid #333333', color: '#e7fef6', fontSize: '15px' }}
                onFocus={e => { e.target.style.borderColor = type === 'BUY' ? '#10b981' : '#f43f5e'; }}
                onBlur={e => { e.target.style.borderColor = '#333333'; }}
                autoFocus
              />
            </div>

            {quantity > 0 && (
              <div className="p-3 rounded-xl mb-4" style={{ background: type === 'BUY' ? 'rgba(16,185,129,0.05)' : 'rgba(244,63,94,0.05)', border: `1px solid ${type === 'BUY' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}` }}>
                <div className="flex justify-between">
                  <span style={{ fontSize: '12px', color: '#999999' }}>Order Total</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: type === 'BUY' ? '#10b981' : '#f43f5e' }}>${total.toFixed(2)}</span>
                </div>
                {type === 'BUY' && quantity > 0 && walletBalance < total && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle size={12} style={{ color: '#f43f5e' }} />
                    <span style={{ fontSize: '11px', color: '#f43f5e' }}>Insufficient balance</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
              style={{
                background: !canSubmit || loading
                  ? '#333333'
                  : type === 'BUY'
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #f43f5e, #dc2626)',
                color: !canSubmit || loading ? '#4d4d4d' : 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: !canSubmit || loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                `${type} ${quantity > 0 ? quantity : ''} Shares`
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function StockDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [period, setPeriod] = useState('1M');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL' | null>(null);
  const { livePrices, liveChanges, getHolding, isInWatchlist, toggleWatchlist } = useApp();

  const stock = id ? STOCKS_MAP[id] : null;
  if (!stock) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <p style={{ color: '#808080', fontSize: '15px' }}>Stock not found</p>
        <Link to="/stocks" style={{ color: '#f6f609', marginTop: '8px', fontSize: '13px' }}>← Back to Markets</Link>
      </div>
    );
  }

  const livePrice = livePrices[stock.id] ?? stock.currentPrice;
  const chg = liveChanges[stock.id] ?? { change: stock.change, changePercent: stock.changePercent };
  const isUp = chg.changePercent >= 0;
  const holding = getHolding(stock.id);

  const days = PERIODS.find(p => p.label === period)?.days ?? 30;
  const chartData = useMemo(() => {
    const slice = stock.priceHistory.slice(-days);
    return slice.map(p => ({
      date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: p.price,
    }));
  }, [stock, days]);

  const minPrice = Math.min(...chartData.map(d => d.price));
  const maxPrice = Math.max(...chartData.map(d => d.price));

  const stats = [
    { label: 'Day High', value: `$${stock.dailyHigh.toFixed(2)}` },
    { label: 'Day Low', value: `$${stock.dailyLow.toFixed(2)}` },
    { label: 'Open', value: `$${stock.openingPrice.toFixed(2)}` },
    { label: 'Prev Close', value: `$${stock.previousClose.toFixed(2)}` },
    { label: 'Volume', value: `${stock.volume.toFixed(1)}M` },
    { label: 'Market Cap', value: stock.marketCap >= 1000 ? `$${(stock.marketCap / 1000).toFixed(2)}T` : `$${stock.marketCap}B` },
    { label: 'Sector', value: stock.sector },
  ];

  return (
    <div className="p-6">
      {/* Back */}
      <Link to="/stocks" className="flex items-center gap-1.5 mb-5 group" style={{ fontSize: '13px', color: '#808080', textDecoration: 'none', width: 'fit-content' }}>
        <ArrowLeft size={14} />
        <span>Markets</span>
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${stock.color}20`, border: `1px solid ${stock.color}30` }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: stock.color }}>{stock.symbol.slice(0, 2)}</span>
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#e7fef6', letterSpacing: '-0.02em' }}>{stock.companyName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span style={{ fontSize: '13px', color: '#808080' }}>{stock.symbol}</span>
              <span className="px-2 py-0.5 rounded" style={{ fontSize: '11px', background: 'rgba(246,246,9,0.1)', color: '#f8f83a' }}>{stock.sector}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTradeType('BUY')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: '13px', fontWeight: 600 }}
          >
            <ShoppingCart size={14} /> Buy
          </button>
          {holding && holding.quantity > 0 && (
            <button
              onClick={() => setTradeType('SELL')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', fontSize: '13px', fontWeight: 600 }}
            >
              <Minus size={14} /> Sell
            </button>
          )}
          <WatchlistButton stock={stock} isInWatchlist={isInWatchlist} toggleWatchlist={toggleWatchlist} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
          {/* Price */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#e7fef6', letterSpacing: '-0.03em' }}>
                ${livePrice.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {isUp ? <TrendingUp size={14} style={{ color: '#10b981' }} /> : <TrendingDown size={14} style={{ color: '#f43f5e' }} />}
                <span style={{ fontSize: '14px', fontWeight: 600, color: isUp ? '#10b981' : '#f43f5e' }}>
                  {isUp ? '+' : ''}${Math.abs(chg.change ?? 0).toFixed(2)} ({isUp ? '+' : ''}{chg.changePercent.toFixed(2)}%)
                </span>
                <span style={{ fontSize: '12px', color: '#4d4d4d' }}>Today</span>
              </div>
            </div>

            {/* Period selector */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#0d0d0d', border: '1px solid #333333' }}>
              {PERIODS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setPeriod(p.label)}
                  className="px-2.5 py-1 rounded-md transition-all"
                  style={{
                    fontSize: '12px', fontWeight: 500,
                    background: period === p.label ? '#333333' : 'transparent',
                    color: period === p.label ? '#e7fef6' : '#808080',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <svg width={0} height={0} style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id={`grad-${stock.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.2} />
                <stop offset="95%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis dataKey="date" tick={{ fill: '#4d4d4d', fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 6)} />
              <YAxis domain={[minPrice * 0.995, maxPrice * 1.005]} tick={{ fill: '#4d4d4d', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toFixed(0)}`} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px', color: '#e7fef6', fontSize: '12px' }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, stock.symbol]}
              />
              <Area isAnimationActive={false} type="monotone" dataKey="price" stroke={isUp ? '#10b981' : '#f43f5e'} strokeWidth={2} fill={`url(#grad-${stock.id})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Holding card */}
          {holding && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(246,246,9,0.08)', border: '1px solid rgba(246,246,9,0.2)' }}>
              <div style={{ fontSize: '12px', color: '#f6f609', fontWeight: 600, marginBottom: '10px' }}>YOUR POSITION</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ fontSize: '12px', color: '#999999' }}>Shares</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>{holding.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '12px', color: '#999999' }}>Avg. Price</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>${holding.averageBuyPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '12px', color: '#999999' }}>Current Value</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>${(holding.quantity * livePrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2" style={{ borderColor: 'rgba(246,246,9,0.2)' }}>
                  <span style={{ fontSize: '12px', color: '#999999' }}>P&L</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: livePrice > holding.averageBuyPrice ? '#10b981' : '#f43f5e' }}>
                    {livePrice > holding.averageBuyPrice ? '+' : ''}${((livePrice - holding.averageBuyPrice) * holding.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="p-4 rounded-xl space-y-3" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#808080', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Statistics</div>
            {stats.map(s => (
              <div key={s.label} className="flex justify-between items-center">
                <span style={{ fontSize: '12px', color: '#999999' }}>{s.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#b3b3b3' }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#808080', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>About</div>
            <p style={{ fontSize: '12px', color: '#999999', lineHeight: 1.6 }}>{stock.description}</p>
          </div>
        </div>
      </div>

      {tradeType && <TradeModal type={tradeType} stockId={stock.id} onClose={() => setTradeType(null)} />}
    </div>
  );
}

    function WatchlistButton({ stock, isInWatchlist, toggleWatchlist }: { stock: any; isInWatchlist: (id: string) => boolean; toggleWatchlist: (id: string) => Promise<void> }) {
      const saved = isInWatchlist(stock.id);

      return (
        <button
          type="button"
          onClick={async () => {
            try {
              await toggleWatchlist(stock.id);

              toast.success(
                saved ? 'Removed from watchlist' : 'Added to watchlist'
              );
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : 'Unable to update watchlist'
              );
            }
          }}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-white transition hover:border-yellow-400"
        >
          {saved ? (
            <BookmarkCheck size={18} />
          ) : (
            <Bookmark size={18} />
          )}

          {saved ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </button>
      );
    }
