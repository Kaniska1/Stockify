import { useState } from 'react';
import { DollarSign, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

const PRESETS = [500, 1000, 5000, 10000, 25000, 50000];

interface Props {
  onDone: () => void;
}

export default function FundWalletModal({ onDone }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const { depositFunds } = useApp();

  const amount = custom !== '' ? parseFloat(custom.replace(/,/g, '')) : selected;
  const valid = amount !== null && !isNaN(amount) && amount > 0;

  const handleFund = async () => {
    if (!valid || amount === null) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    depositFunds(amount);
    setLoading(false);
    onDone();
  };

  const handleCustomChange = (v: string) => {
    setSelected(null);
    setCustom(v.replace(/[^0-9.]/g, ''));
  };

  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.28 }}
          className="w-full max-w-md rounded-2xl p-7"
          style={{ background: '#141414', border: '1px solid #2a2a2a', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(246,246,9,0.12)', border: '1px solid rgba(246,246,9,0.2)' }}>
                <DollarSign size={18} style={{ color: '#f6f609' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#e7fef6', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                  Add Funds
                </h2>
                <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                  Deposit money into your trading wallet
                </p>
              </div>
            </div>
            <button
              onClick={onDone}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#444' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#888'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#444'; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Preset amounts */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => { setSelected(p); setCustom(''); }}
                className="py-2.5 rounded-xl transition-all"
                style={{
                  background: selected === p ? 'rgba(246,246,9,0.14)' : '#1e1e1e',
                  border: `1px solid ${selected === p ? 'rgba(246,246,9,0.4)' : '#2a2a2a'}`,
                  color: selected === p ? '#f6f609' : '#888',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
                onMouseEnter={e => { if (selected !== p) (e.currentTarget as HTMLElement).style.borderColor = '#3a3a3a'; }}
                onMouseLeave={e => { if (selected !== p) (e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a'; }}
              >
                {fmt(p)}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="mb-5">
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#555', display: 'block', marginBottom: '7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Custom Amount
            </label>
            <div className="relative">
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: '15px', fontWeight: 600 }}>$</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Enter amount"
                value={custom}
                onChange={e => handleCustomChange(e.target.value)}
                className="w-full rounded-xl outline-none transition-all"
                style={{ background: '#1e1e1e', border: `1px solid ${custom && selected === null ? 'rgba(246,246,9,0.4)' : '#2a2a2a'}`, color: '#e7fef6', fontSize: '14px', padding: '11px 14px 11px 30px' }}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(246,246,9,0.4)'; setSelected(null); }}
                onBlur={e => { if (!custom) (e.target as HTMLInputElement).style.borderColor = '#2a2a2a'; }}
              />
            </div>
          </div>

          {/* Summary */}
          {valid && amount !== null && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3.5 rounded-xl mb-5"
              style={{ background: 'rgba(246,246,9,0.06)', border: '1px solid rgba(246,246,9,0.15)' }}
            >
              <span style={{ fontSize: '13px', color: '#888' }}>Funds to be added</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#f6f609', letterSpacing: '-0.02em' }}>
                ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </motion.div>
          )}

          {/* Actions */}
          <button
            onClick={handleFund}
            disabled={!valid || loading}
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 mb-3 transition-all"
            style={{
              background: valid && !loading ? '#f6f609' : 'rgba(246,246,9,0.2)',
              color: valid && !loading ? '#0d0d0d' : '#666',
              fontSize: '14px', fontWeight: 800,
              cursor: valid && !loading ? 'pointer' : 'not-allowed',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { if (valid && !loading) (e.currentTarget as HTMLElement).style.background = '#fafa6b'; }}
            onMouseLeave={e => { if (valid && !loading) (e.currentTarget as HTMLElement).style.background = '#f6f609'; }}
          >
            {loading
              ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#0d0d0d' }} />
              : <><span>Add Funds & Start Trading</span><ArrowRight size={15} /></>}
          </button>

          <button
            onClick={onDone}
            className="w-full py-2.5 rounded-xl text-center transition-colors"
            style={{ fontSize: '13px', color: '#444', background: 'transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#888'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#444'; }}
          >
            Cancel
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
