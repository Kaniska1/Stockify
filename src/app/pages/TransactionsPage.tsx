import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, TrendingUp, TrendingDown, Filter, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const { transactions } = useApp();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(t => t.symbol.toLowerCase().includes(q) || t.companyName.toLowerCase().includes(q));
    }
    if (typeFilter !== 'ALL') list = list.filter(t => t.type === typeFilter);
    return list;
  }, [transactions, query, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalBought = transactions.filter(t => t.type === 'BUY').reduce((s, t) => s + t.totalAmount, 0);
  const totalSold = transactions.filter(t => t.type === 'SELL').reduce((s, t) => s + t.totalAmount, 0);

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#e7fef6', letterSpacing: '-0.02em' }}>Transactions</h1>
        <p style={{ fontSize: '13px', color: '#808080', marginTop: '2px' }}>{transactions.length} total transactions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Transactions', value: transactions.length.toString(), color: '#f6f609' },
          { label: 'Total Bought', value: `$${totalBought.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: '#10b981' },
          { label: 'Total Sold', value: `$${totalSold.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: '#f43f5e' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
            <div style={{ fontSize: '12px', color: '#808080', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#808080' }} />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by symbol or company..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg outline-none"
            style={{ background: '#1a1a1a', border: '1px solid #333333', color: '#e7fef6', fontSize: '13px' }}
            onFocus={e => { e.target.style.borderColor = '#f6f609'; }}
            onBlur={e => { e.target.style.borderColor = '#333333'; }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: '#808080' }} />
          {(['ALL', 'BUY', 'SELL'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className="px-3 py-1.5 rounded-lg transition-all"
              style={{
                fontSize: '12px',
                background: typeFilter === t
                  ? t === 'BUY' ? 'rgba(16,185,129,0.15)' : t === 'SELL' ? 'rgba(244,63,94,0.1)' : 'rgba(246,246,9,0.15)'
                  : '#1a1a1a',
                color: typeFilter === t
                  ? t === 'BUY' ? '#10b981' : t === 'SELL' ? '#f43f5e' : '#f8f83a'
                  : '#999999',
                border: `1px solid ${typeFilter === t
                  ? t === 'BUY' ? 'rgba(16,185,129,0.3)' : t === 'SELL' ? 'rgba(244,63,94,0.2)' : 'rgba(246,246,9,0.3)'
                  : '#333333'}`,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
        {paged.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#333333' }}>
              <History size={24} style={{ color: '#4d4d4d' }} />
            </div>
            <p style={{ fontSize: '14px', color: '#808080' }}>No transactions found</p>
            {transactions.length === 0 && (
              <Link to="/stocks" style={{ fontSize: '13px', color: '#f6f609', marginTop: '8px' }}>Start trading →</Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #333333' }}>
                    {['Date & Time', 'Stock', 'Type', 'Quantity', 'Price', 'Total Amount'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#808080', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #0d0d0d' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#999999', whiteSpace: 'nowrap' }}>
                        {fmtDate(tx.timestamp)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Link to={`/stocks/${tx.stockId}`} style={{ textDecoration: 'none' }} className="flex items-center gap-2.5">
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>{tx.symbol}</div>
                          <div style={{ fontSize: '11px', color: '#808080' }} className="truncate max-w-[140px]">{tx.companyName}</div>
                        </Link>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: tx.type === 'BUY' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' }}>
                            {tx.type === 'BUY' ? <TrendingUp size={11} style={{ color: '#10b981' }} /> : <TrendingDown size={11} style={{ color: '#f43f5e' }} />}
                          </div>
                          <span className="px-2 py-0.5 rounded-md" style={{
                            fontSize: '11px', fontWeight: 600,
                            background: tx.type === 'BUY' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                            color: tx.type === 'BUY' ? '#10b981' : '#f43f5e',
                          }}>
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>
                        {tx.quantity} <span style={{ fontSize: '11px', color: '#4d4d4d', fontWeight: 400 }}>shares</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#b3b3b3' }}>
                        ${tx.price.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: tx.type === 'BUY' ? '#f43f5e' : '#10b981' }}>
                        {tx.type === 'BUY' ? '-' : '+'}${tx.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: '#333333' }}>
              <span style={{ fontSize: '12px', color: '#808080' }}>{filtered.length} results · Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg" style={{ color: page === 1 ? '#333333' : '#999999', background: '#1a1a1a', border: '1px solid #333333', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                  <ChevronLeft size={14} />
                </button>
                {(() => {
                  const maxPages = Math.min(5, totalPages);
                  const start = Math.max(1, Math.min(page - 2, totalPages - maxPages + 1));
                  return Array.from({ length: maxPages }, (_, i) => start + i);
                })().map(p => (
                    <button key={`page-${p}`} onClick={() => setPage(p)}
                      style={{ width: '28px', height: '28px', borderRadius: '8px', fontSize: '12px', background: page === p ? '#f6f609' : '#1a1a1a', color: page === p ? 'white' : '#999999', border: `1px solid ${page === p ? '#f6f609' : '#333333'}` }}>
                      {p}
                    </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg" style={{ color: page === totalPages ? '#333333' : '#999999', background: '#1a1a1a', border: '1px solid #333333', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
