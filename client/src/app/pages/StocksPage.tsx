import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, ChevronUp, ChevronDown, TrendingUp, TrendingDown, Filter, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';
import { STOCKS, SECTORS } from '../data/stocks';
import { useApp } from '../context/AppContext';

const PAGE_SIZE = 15;

type SortKey = 'companyName' | 'currentPrice' | 'changePercent' | 'volume' | 'marketCap';

export default function StocksPage() {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('marketCap');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const { livePrices, liveChanges, isInWatchlist, toggleWatchlist } = useApp();

  const filtered = useMemo(() => {
    let list = [...STOCKS];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(s => s.symbol.toLowerCase().includes(q) || s.companyName.toLowerCase().includes(q));
    }
    if (sector !== 'All') list = list.filter(s => s.sector === sector);
    list.sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === 'companyName') {
        return sortDir === 'asc' ? a.companyName.localeCompare(b.companyName) : b.companyName.localeCompare(a.companyName);
      }
      if (sortKey === 'changePercent') {
        av = liveChanges[a.id]?.changePercent ?? a.changePercent;
        bv = liveChanges[b.id]?.changePercent ?? b.changePercent;
      } else if (sortKey === 'currentPrice') {
        av = livePrices[a.id] ?? a.currentPrice;
        bv = livePrices[b.id] ?? b.currentPrice;
      } else {
        av = a[sortKey] as number;
        bv = b[sortKey] as number;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return list;
  }, [query, sector, sortKey, sortDir, livePrices, liveChanges]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
    setPage(1);
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="ml-1" style={{ color: sortKey === k ? '#f6f609' : '#4d4d4d' }}>
      {sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : <ChevronDown size={13} />}
    </span>
  );

  const allSectors = ['All', ...SECTORS];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#e7fef6', letterSpacing: '-0.02em' }}>Markets</h1>
        <p style={{ fontSize: '13px', color: '#808080', marginTop: '2px' }}>{STOCKS.length} stocks · Live prices</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#808080' }} />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search symbol or name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg outline-none transition-all"
            style={{ background: '#1a1a1a', border: '1px solid #333333', color: '#e7fef6', fontSize: '13px' }}
            onFocus={e => { e.target.style.borderColor = '#f6f609'; }}
            onBlur={e => { e.target.style.borderColor = '#333333'; }}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter size={14} style={{ color: '#808080', flexShrink: 0 }} />
          {allSectors.map(s => (
            <button
              key={s}
              onClick={() => { setSector(s); setPage(1); }}
              className="px-3 py-1.5 rounded-lg whitespace-nowrap transition-all"
              style={{
                fontSize: '12px',
                background: sector === s ? 'rgba(246,246,9,0.15)' : '#1a1a1a',
                color: sector === s ? '#f8f83a' : '#999999',
                border: `1px solid ${sector === s ? 'rgba(246,246,9,0.3)' : '#333333'}`,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #333333' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #333333' }}>
                {[
                  { label: '#', k: null, w: '40px' },
                  { label: 'Company', k: 'companyName' as SortKey, w: null },
                  { label: 'Price', k: 'currentPrice' as SortKey, w: '110px' },
                  { label: 'Change', k: 'changePercent' as SortKey, w: '110px' },
                  { label: 'Volume', k: 'volume' as SortKey, w: '100px' },
                  { label: 'Market Cap', k: 'marketCap' as SortKey, w: '120px' },
                  { label: 'Sector', k: null, w: '120px' },
                ].map(col => (
                  <th
                    key={col.label}
                    style={{ width: col.w || undefined, padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#808080', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', cursor: col.k ? 'pointer' : 'default', background: '#1a1a1a' }}
                    onClick={() => col.k && toggleSort(col.k)}
                  >
                    <span className="flex items-center">
                      {col.label}
                      {col.k && <SortIcon k={col.k} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#808080', fontSize: '14px' }}>
                    No stocks match your search
                  </td>
                </tr>
              ) : paged.map((stock, i) => {
                const livePrice = livePrices[stock.id] ?? stock.currentPrice;
                const chg = liveChanges[stock.id] ?? { change: stock.change, changePercent: stock.changePercent };
                const isUp = chg.changePercent >= 0;
                const rowIdx = (page - 1) * PAGE_SIZE + i + 1;

                return (
                  <tr
                    key={stock.id}
                    style={{ borderBottom: '1px solid #0d0d0d' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#4d4d4d' }}>{rowIdx}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link to={`/stocks/${stock.id}`} className="flex items-center gap-3 group" style={{ textDecoration: 'none' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${stock.color}15`, border: `1px solid ${stock.color}25` }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: stock.color }}>{stock.symbol.slice(0, 2)}</span>
                        </div>
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e7fef6' }}>{stock.symbol}</div>
                                  <div style={{ fontSize: '11px', color: '#808080' }} className="truncate max-w-[160px]">{stock.companyName}</div>
                                </div>
                                <div className="ml-auto">
                                  {(() => {
                                    const saved = isInWatchlist(stock.id);

                                    return (
                                      <button
                                        type="button"
                                        onClick={async event => {
                                          event.preventDefault();
                                          event.stopPropagation();

                                          try {
                                            await toggleWatchlist(stock.id);

                                            toast.success(
                                              saved ? `${stock.symbol} removed from watchlist` : `${stock.symbol} added to watchlist`
                                            );
                                          } catch (error) {
                                            toast.error(
                                              error instanceof Error ? error.message : 'Unable to update watchlist'
                                            );
                                          }
                                        }}
                                        aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
                                        className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-yellow-400"
                                      >
                                        {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                                      </button>
                                    );
                                  })()}
                                </div>
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#e7fef6', fontVariantNumeric: 'tabular-nums' }}>
                      ${livePrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-1.5">
                        {isUp ? <TrendingUp size={13} style={{ color: '#10b981' }} /> : <TrendingDown size={13} style={{ color: '#f43f5e' }} />}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: isUp ? '#10b981' : '#f43f5e' }}>
                            {isUp ? '+' : ''}{chg.changePercent.toFixed(2)}%
                          </div>
                          <div style={{ fontSize: '11px', color: '#4d4d4d' }}>
                            {isUp ? '+' : ''}${Math.abs(chg.change ?? 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#999999' }}>
                      {stock.volume.toFixed(1)}M
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#999999' }}>
                      ${stock.marketCap >= 1000 ? `${(stock.marketCap / 1000).toFixed(1)}T` : `${stock.marketCap.toFixed(0)}B`}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="px-2 py-0.5 rounded-md" style={{ fontSize: '11px', background: 'rgba(246,246,9,0.1)', color: '#f8f83a' }}>
                        {stock.sector}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: '#333333' }}>
          <span style={{ fontSize: '12px', color: '#808080' }}>
            {filtered.length} results · Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: page === 1 ? '#333333' : '#999999', background: '#1a1a1a', border: '1px solid #333333', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={14} />
            </button>
            {(() => {
              const maxPages = Math.min(5, totalPages);
              const start = Math.max(1, Math.min(page - 2, totalPages - maxPages + 1));
              return Array.from({ length: maxPages }, (_, i) => start + i);
            })().map(p => (
                <button
                  key={`page-${p}`}
                  onClick={() => setPage(p)}
                  className="w-7 h-7 rounded-lg transition-all"
                  style={{
                    fontSize: '12px',
                    background: page === p ? '#f6f609' : '#1a1a1a',
                    color: page === p ? 'white' : '#999999',
                    border: `1px solid ${page === p ? '#f6f609' : '#333333'}`,
                  }}
                >
                  {p}
                </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: page === totalPages ? '#333333' : '#999999', background: '#1a1a1a', border: '1px solid #333333', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
