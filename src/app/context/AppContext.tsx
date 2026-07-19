import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { STOCKS } from '../data/stocks';
import { useAuth } from './AuthContext';

export interface Holding {
  stockId: string;
  symbol: string;
  companyName: string;
  quantity: number;
  averageBuyPrice: number;
}

export interface Transaction {
  id: string;
  stockId: string;
  symbol: string;
  companyName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  type: 'BUY' | 'SELL';
  timestamp: string;
}

interface AppContextValue {
  livePrices: Record<string, number>;
  liveChanges: Record<string, { change: number; changePercent: number }>;
  walletBalance: number;
  holdings: Holding[];
  transactions: Transaction[];
  portfolioValue: number;
  totalInvested: number;
  dayPnl: number;
  totalPnl: number;
  buyStock: (stockId: string, quantity: number) => Promise<void>;
  sellStock: (stockId: string, quantity: number) => Promise<void>;
  getHolding: (stockId: string) => Holding | undefined;
  depositFunds: (amount: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function getUserKey(userId: string, key: string) {
  return `smm_${userId}_${key}`;
}

function loadUserData<T>(userId: string, key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(getUserKey(userId, key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveUserData(userId: string, key: string, value: unknown) {
  localStorage.setItem(getUserKey(userId, key), JSON.stringify(value));
}

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem('smm_users') || '[]') as Array<{ id: string; walletBalance: number }>;
  } catch {
    return [];
  }
}

function getWalletBalance(userId: string): number {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  return user?.walletBalance ?? 100000;
}

function setWalletBalance(userId: string, balance: number) {
  const users = JSON.parse(localStorage.getItem('smm_users') || '[]') as Array<{ id: string; walletBalance: number }>;
  const user = users.find(u => u.id === userId);
  if (user) {
    user.walletBalance = balance;
    localStorage.setItem('smm_users', JSON.stringify(users));
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [livePrices, setLivePrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(STOCKS.map(s => [s.id, s.currentPrice]))
  );

  const [liveChanges, setLiveChanges] = useState<Record<string, { change: number; changePercent: number }>>(() =>
    Object.fromEntries(STOCKS.map(s => [s.id, { change: s.change, changePercent: s.changePercent }]))
  );

  const [walletBalance, setWalletBalanceState] = useState(100000);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!userId) {
      setWalletBalanceState(100000);
      setHoldings([]);
      setTransactions([]);
      return;
    }
    setWalletBalanceState(getWalletBalance(userId));
    setHoldings(loadUserData<Holding[]>(userId, 'holdings', []));
    setTransactions(loadUserData<Transaction[]>(userId, 'transactions', []));
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices(prev => {
        const next = { ...prev };
        STOCKS.forEach(stock => {
          const vol = (stock.changePercent !== 0 ? Math.abs(stock.changePercent) / 100 : 0.002);
          const noise = (Math.random() * 2 - 1) * vol * 0.3;
          next[stock.id] = Math.max(+(next[stock.id] * (1 + noise)).toFixed(2), 0.01);
        });
        return next;
      });
      setLiveChanges(prev => {
        const next = { ...prev };
        STOCKS.forEach(stock => {
          const livePrice = livePrices[stock.id] ?? stock.currentPrice;
          const change = +(livePrice - stock.previousClose).toFixed(2);
          const changePercent = +((change / stock.previousClose) * 100).toFixed(2);
          next[stock.id] = { change, changePercent };
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [livePrices]);

  const portfolioValue = holdings.reduce((sum, h) => {
    const price = livePrices[h.stockId] ?? 0;
    return sum + h.quantity * price;
  }, 0);

  const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.averageBuyPrice, 0);
  const totalPnl = portfolioValue - totalInvested;

  const dayPnl = holdings.reduce((sum, h) => {
    const stock = STOCKS.find(s => s.id === h.stockId);
    if (!stock) return sum;
    const livePrice = livePrices[h.stockId] ?? stock.currentPrice;
    const prevClose = stock.previousClose;
    return sum + h.quantity * (livePrice - prevClose);
  }, 0);

  const getHolding = useCallback((stockId: string) => holdings.find(h => h.stockId === stockId), [holdings]);

  const depositFunds = useCallback((amount: number) => {
    if (!userId) return;
    const current = getWalletBalance(userId);
    const next = +(current + amount).toFixed(2);
    setWalletBalance(userId, next);
    setWalletBalanceState(next);
  }, [userId]);

  const buyStock = useCallback(async (stockId: string, quantity: number) => {
    if (!userId) throw new Error('Not logged in');
    const price = livePrices[stockId];
    if (!price) throw new Error('Stock not found');
    const total = price * quantity;
    const balance = getWalletBalance(userId);
    if (balance < total) throw new Error('Insufficient wallet balance');

    const stock = STOCKS.find(s => s.id === stockId);
    if (!stock) throw new Error('Stock not found');

    const newBalance = +(balance - total).toFixed(2);
    setWalletBalance(userId, newBalance);
    setWalletBalanceState(newBalance);

    setHoldings(prev => {
      const existing = prev.find(h => h.stockId === stockId);
      let next: Holding[];
      if (existing) {
        const totalQty = existing.quantity + quantity;
        const avgPrice = +((existing.quantity * existing.averageBuyPrice + quantity * price) / totalQty).toFixed(2);
        next = prev.map(h => h.stockId === stockId ? { ...h, quantity: totalQty, averageBuyPrice: avgPrice } : h);
      } else {
        next = [...prev, { stockId, symbol: stock.symbol, companyName: stock.companyName, quantity, averageBuyPrice: +price.toFixed(2) }];
      }
      saveUserData(userId, 'holdings', next);
      return next;
    });

    const tx: Transaction = {
      id: crypto.randomUUID(),
      stockId,
      symbol: stock.symbol,
      companyName: stock.companyName,
      quantity,
      price: +price.toFixed(2),
      totalAmount: +total.toFixed(2),
      type: 'BUY',
      timestamp: new Date().toISOString(),
    };

    setTransactions(prev => {
      const next = [tx, ...prev];
      saveUserData(userId, 'transactions', next);
      return next;
    });
  }, [userId, livePrices]);

  const sellStock = useCallback(async (stockId: string, quantity: number) => {
    if (!userId) throw new Error('Not logged in');
    const price = livePrices[stockId];
    if (!price) throw new Error('Stock not found');
    const holding = getHolding(stockId);
    if (!holding || holding.quantity < quantity) throw new Error('Insufficient shares to sell');

    const stock = STOCKS.find(s => s.id === stockId);
    if (!stock) throw new Error('Stock not found');

    const total = +(price * quantity).toFixed(2);
    const balance = getWalletBalance(userId);
    const newBalance = +(balance + total).toFixed(2);
    setWalletBalance(userId, newBalance);
    setWalletBalanceState(newBalance);

    setHoldings(prev => {
      const next = prev
        .map(h => h.stockId === stockId ? { ...h, quantity: h.quantity - quantity } : h)
        .filter(h => h.quantity > 0);
      saveUserData(userId, 'holdings', next);
      return next;
    });

    const tx: Transaction = {
      id: crypto.randomUUID(),
      stockId,
      symbol: stock.symbol,
      companyName: stock.companyName,
      quantity,
      price: +price.toFixed(2),
      totalAmount: total,
      type: 'SELL',
      timestamp: new Date().toISOString(),
    };

    setTransactions(prev => {
      const next = [tx, ...prev];
      saveUserData(userId, 'transactions', next);
      return next;
    });
  }, [userId, livePrices, getHolding]);

  return (
    <AppContext.Provider value={{
      livePrices, liveChanges, walletBalance, holdings, transactions,
      portfolioValue, totalInvested, dayPnl, totalPnl,
      buyStock, sellStock, getHolding, depositFunds,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
