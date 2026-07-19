import { useState, FormEvent, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { Zap, Eye, EyeOff, ArrowRight, AlertCircle, TrendingUp, Activity, BarChart3, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import FundWalletModal from '../components/FundWalletModal';

const TICKER_ITEMS = [
  { symbol: 'AAPL', price: '$214.32', change: '+1.84%', up: true },
  { symbol: 'NVDA', price: '$891.54', change: '+3.21%', up: true },
  { symbol: 'TSLA', price: '$248.71', change: '-0.93%', up: false },
  { symbol: 'MSFT', price: '$432.18', change: '+0.67%', up: true },
  { symbol: 'GOOGL', price: '$178.90', change: '+2.15%', up: true },
  { symbol: 'AMZN', price: '$194.47', change: '-1.12%', up: false },
  { symbol: 'META', price: '$528.33', change: '+4.02%', up: true },
  { symbol: 'AMD', price: '$162.88', change: '+2.78%', up: true },
  { symbol: 'NFLX', price: '$701.22', change: '-0.44%', up: false },
  { symbol: 'SPY', price: '$548.90', change: '+0.91%', up: true },
];

const FEATURES = [
  { icon: <Activity size={15} />, title: 'Real-Time Prices', desc: 'Live quotes refreshed every 3 seconds' },
  { icon: <BarChart3 size={15} />, title: 'Advanced Analytics', desc: 'Sector charts, radar & depth analysis' },
  { icon: <Zap size={15} />, title: 'Instant Execution', desc: 'Market & limit orders in milliseconds' },
  { icon: <Globe size={15} />, title: '45+ US Stocks', desc: 'All major sectors & indices covered' },
];

const STATS = [
  { value: '$2.4B+', label: 'Volume Tracked' },
  { value: '45', label: 'Stocks Listed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '3s', label: 'Quote Refresh' },
];

const MARKET_INDICES = [
  { name: 'S&P 500', val: '5,847', change: '+0.84%', up: true },
  { name: 'NASDAQ', val: '18,942', change: '+1.23%', up: true },
  { name: 'DOW', val: '42,891', change: '-0.31%', up: false },
];

const tickerDouble = [...TICKER_ITEMS, ...TICKER_ITEMS];

// Replicates AuthContext's simpleHash so we can patch the demo account in localStorage
function hashStr(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash.toString(16);
}

// Ensures the demo account exists and has the correct password.
// Returns true if the account already existed (use login), false if it needs signup.
function prepareDemoAccount(): boolean {
  const DEMO_EMAIL = 'demo@stockify.app';
  const DEMO_PASS = 'Demo@1234!';
  try {
    const users: Array<Record<string, unknown>> = JSON.parse(localStorage.getItem('smm_users') || '[]');
    const existing = users.find(u => String(u.email).toLowerCase() === DEMO_EMAIL);
    if (existing) {
      existing.passwordHash = hashStr(DEMO_PASS);
      localStorage.setItem('smm_users', JSON.stringify(users));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Seamlessly looping sine-based price path (period = totalW, so it loops at translateX(-50%))
function genPricePath(totalW: number, totalH: number, baseY: number, comps: Array<[number, number, number]>): string {
  const steps = 220;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * totalW;
    let y = baseY;
    for (const [amp, period, phase] of comps) {
      y += amp * Math.sin((2 * Math.PI * x) / period + phase);
    }
    y = Math.max(4, Math.min(totalH - 4, y));
    d += i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

// Scrolling area-chart background decoration for the left panel
function PriceChartBg() {
  const W = 4000;
  const H = 300;

  const stroke1 = useMemo(() => genPricePath(W, H, 195, [[60, W, 0], [24, W / 4, 0.9], [10, W / 8, 1.6]]), []);
  const fill1 = `${stroke1} L${W},${H} L0,${H} Z`;

  const stroke2 = useMemo(() => genPricePath(W, H, 140, [[42, W, Math.PI], [18, W / 4, 2.2], [8, W / 8, 0.4]]), []);
  const fill2 = `${stroke2} L${W},${H} L0,${H} Z`;

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', pointerEvents: 'none' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '200%', height: '100%', animation: 'scrollChart 72s linear infinite' }}
      >
        <defs>
          <linearGradient id="lpGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6f609" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#f6f609" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lpGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6f609" stopOpacity={0.045} />
            <stop offset="100%" stopColor="#f6f609" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={fill2} fill="url(#lpGrad2)" />
        <path d={stroke2} fill="none" stroke="#f6f609" strokeWidth="1" strokeOpacity={0.08} />
        <path d={fill1} fill="url(#lpGrad1)" />
        <path d={stroke1} fill="none" stroke="#f6f609" strokeWidth="1.5" strokeOpacity={0.16} />
      </svg>
    </div>
  );
}

// Decorative candlestick chart — bottom-right of the left panel
function CandlestickBg() {
  const candles = useMemo(() => {
    let s = 73;
    const rand = () => { s = ((s * 1664525) + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
    let price = 72;
    return Array.from({ length: 30 }, (_, i) => {
      const open = price;
      const change = (rand() - 0.43) * 30;
      const close = Math.max(8, Math.min(132, open + change));
      const wick = rand() * 14;
      price = close;
      return {
        open, close,
        high: Math.min(142, Math.max(open, close) + wick),
        low: Math.max(0, Math.min(open, close) - wick),
        isUp: close >= open, i,
      };
    });
  }, []);

  const CW = 11, GAP = 6;
  const W = candles.length * (CW + GAP);
  const H = 155;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', bottom: '11%', right: 0, width: '54%', height: '29%', opacity: 0.14, pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="cdFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="black" />
          <stop offset="22%" stopColor="transparent" />
        </linearGradient>
        <mask id="cdMask">
          <rect width={W} height={H} fill="white" />
          <rect width={W} height={H} fill="url(#cdFade)" />
        </mask>
      </defs>
      <g mask="url(#cdMask)">
        {candles.map((c) => {
          const x = c.i * (CW + GAP);
          const cx = x + CW / 2;
          const bodyTop = H - Math.max(c.open, c.close);
          const bodyH = Math.max(2, Math.abs(c.close - c.open));
          return (
            <g key={c.i}>
              <line x1={cx} y1={H - c.high} x2={cx} y2={H - c.low}
                stroke={c.isUp ? '#f6f609' : '#666'} strokeWidth="1" />
              <rect x={x} y={bodyTop} width={CW} height={bodyH}
                fill={c.isUp ? '#f6f609' : '#4d4d4d'} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFundModal, setShowFundModal] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!emailOrUsername || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(emailOrUsername, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    setError('');
    const demoEmail = 'demo@stockify.app';
    const demoPassword = 'Demo@1234!';
    try {
      const accountExists = prepareDemoAccount();
      if (accountExists) {
        await login(demoEmail, demoPassword);
        toast.success('Welcome to the demo!');
      } else {
        await signup('Demo User', demoEmail, 'demouser', demoPassword);
        toast.success('Demo account ready!');
      }
      setShowFundModal(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0d0d0d' }}>
      {showFundModal && <FundWalletModal onDone={() => navigate('/dashboard')} />}

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col w-[58%] relative overflow-hidden" style={{ background: '#111111', borderRight: '1px solid #1e1e1e' }}>

        {/* ── Background decoration layer (behind all content) ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {/* Trading terminal grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)',
            backgroundSize: '100% 52px, 70px 100%',
          }} />
          {/* Scrolling price chart waves */}
          <PriceChartBg />
          {/* Candlestick cluster */}
          <CandlestickBg />
          {/* Ambient glow — top left */}
          <div style={{ position: 'absolute', top: '-15%', left: '-5%', width: '55%', height: '55%', background: 'radial-gradient(ellipse, rgba(246,246,9,0.06) 0%, transparent 70%)' }} />
          {/* Ambient glow — bottom right */}
          <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: '45%', height: '45%', background: 'radial-gradient(ellipse, rgba(246,246,9,0.035) 0%, transparent 70%)' }} />
        </div>

        {/* ── Content layer ── */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

          {/* Header */}
          <div className="flex items-center justify-between px-10 pt-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f6f609' }}>
                <Zap size={18} color="#0d0d0d" fill="#0d0d0d" />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#e7fef6', letterSpacing: '-0.03em' }}>Stockify</span>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', letterSpacing: '0.04em' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
              MARKETS LIVE
            </span>
          </div>

          {/* Market indices strip */}
          <div className="flex items-center gap-2 px-10 pt-5">
            {MARKET_INDICES.map((idx) => (
              <div key={idx.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid #202020' }}>
                <span style={{ fontSize: '10px', color: '#4a4a4a', fontWeight: 600, letterSpacing: '0.02em' }}>{idx.name}</span>
                <span style={{ fontSize: '11px', color: '#aaaaaa', fontWeight: 700 }}>{idx.val}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: idx.up ? '#10b981' : '#f43f5e' }}>{idx.change}</span>
              </div>
            ))}
          </div>

          {/* Hero */}
          <motion.div className="px-10 pt-10 pb-6" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: 'rgba(246,246,9,0.08)', border: '1px solid rgba(246,246,9,0.18)', fontSize: '11px', color: '#f6f609', fontWeight: 600, letterSpacing: '0.05em' }}>
              ✦ &nbsp;REAL-TIME STOCK EXCHANGE
            </div>
            <h1 style={{ fontSize: '46px', fontWeight: 900, color: '#e7fef6', lineHeight: 1.08, letterSpacing: '-0.045em', marginBottom: '18px' }}>
              Markets move fast.<br />
              <span style={{ color: '#f6f609' }}>Move faster.</span>
            </h1>
            <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.7, maxWidth: '400px' }}>
              Trade real stocks with live market data, professional-grade analytics, and instant order execution — all in one platform built for serious investors.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="mx-10 mb-7 rounded-2xl overflow-hidden flex"
            style={{ border: '1px solid #1e1e1e', background: '#0f0f0f' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
          >
            {STATS.map((s, i) => (
              <div key={s.label} className="flex-1 px-5 py-4" style={{ borderRight: i < STATS.length - 1 ? '1px solid #1e1e1e' : 'none' }}>
                <div style={{ fontSize: '21px', fontWeight: 800, color: '#f6f609', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#3d3d3d', marginTop: '5px', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Ticker strip */}
          <div className="relative overflow-hidden mb-7" style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', background: '#0d0d0d' }}>
            <div style={{ display: 'flex', animation: 'tickerScroll 30s linear infinite', width: 'max-content' }}>
              {tickerDouble.map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 px-5 py-2.5" style={{ borderRight: '1px solid #1a1a1a', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#cccccc', letterSpacing: '0.04em' }}>{t.symbol}</span>
                  <span style={{ fontSize: '11px', color: '#444444' }}>{t.price}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: t.up ? '#10b981' : '#f43f5e' }}>{t.change}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature cards */}
          <motion.div
            className="grid grid-cols-2 gap-3 mx-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55, delay: 0.25 }}
          >
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(246,246,9,0.1)', color: '#f6f609' }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#cccccc', marginBottom: '2px' }}>{f.title}</div>
                  <div style={{ fontSize: '11px', color: '#444444', lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Footer */}
          <div className="mt-auto px-10 py-6 flex items-center justify-between">
            <span style={{ fontSize: '11px', color: '#252525' }}>© 2026 Stockify. All rights reserved.</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
              <span style={{ fontSize: '11px', color: '#2e2e2e' }}>All systems operational</span>
            </div>
          </div>

        </div>

        <style>{`
          @keyframes tickerScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scrollChart {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-[340px]"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#f6f609' }}>
              <Zap size={15} color="#0d0d0d" fill="#0d0d0d" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#e7fef6', letterSpacing: '-0.03em' }}>Stockify</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#e7fef6', marginBottom: '4px', letterSpacing: '-0.035em' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: '#555555', marginBottom: '28px', lineHeight: 1.5 }}>
            No account?{' '}
            <Link to="/signup" style={{ color: '#f6f609', textDecoration: 'none', fontWeight: 600 }}>Sign up free →</Link>
          </p>

          {error && (
            <motion.div
              className="flex items-center gap-2.5 p-3 rounded-xl mb-5"
              style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.18)' }}
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            >
              <AlertCircle size={14} style={{ color: '#f43f5e', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#f43f5e' }}>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#555555', display: 'block', marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Email or Username
              </label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={e => setEmailOrUsername(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#e7fef6', fontSize: '14px' }}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#f6f609'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(246,246,9,0.05)'; }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#252525'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#555555', display: 'block', marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                  style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#e7fef6', fontSize: '14px', paddingRight: '44px' }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#f6f609'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(246,246,9,0.05)'; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#252525'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#444444' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{ background: loading ? 'rgba(246,246,9,0.4)' : '#f6f609', color: '#0d0d0d', fontSize: '14px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em' }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#fafa6b'; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#f6f609'; }}
            >
              {loading
                ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(0,0,0,0.15)', borderTopColor: '#0d0d0d' }} />
                : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: '#1a1a1a' }} />
            <span style={{ fontSize: '11px', color: '#2e2e2e', fontWeight: 600 }}>OR</span>
            <div className="flex-1 h-px" style={{ background: '#1a1a1a' }} />
          </div>

          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            style={{ background: 'transparent', border: '1px solid #252525', color: '#666666', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f6f609'; (e.currentTarget as HTMLElement).style.color = '#f6f609'; (e.currentTarget as HTMLElement).style.background = 'rgba(246,246,9,0.04)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#252525'; (e.currentTarget as HTMLElement).style.color = '#666666'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <TrendingUp size={14} />
            Try Demo Account
          </button>

          <p style={{ fontSize: '11px', color: '#252525', textAlign: 'center', marginTop: '20px', lineHeight: 1.5 }}>
            Explore the platform · Fund your account anytime
          </p>
        </motion.div>
      </div>
    </div>
  );
}
