import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getWatchlist,
  addWatchlistStock,
  removeWatchlistStock,
} from "../lib/watchlist";

import {
  getMarketQuotes,
} from "../lib/market";
import { STOCKS } from '../data/stocks';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

import {
  getPortfolio,
} from '../lib/portfolio';

import {
  getTransactions,
  addTransaction,
} from '../lib/transaction';

import {
  depositFundsRequest,
} from '../lib/auth';

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

interface BackendHolding {
  symbol: string;
  companyName: string;
  quantity: number;
  averagePrice: number;
}

interface BackendTransaction {
  _id?: string;
  id?: string;
  symbol: string;
  companyName: string;
  quantity: number;
  price: number;
  total?: number;
  totalAmount?: number;
  type: 'BUY' | 'SELL';
  createdAt?: string;
  timestamp?: string;
}

interface AppContextValue {
  livePrices: Record<string, number>;

  liveChanges: Record<
    string,
    {
      change: number;
      changePercent: number;
      previousClose: number;
    }
  >;

  walletBalance: number;
  holdings: Holding[];
  transactions: Transaction[];
  watchlist: string[];

  portfolioValue: number;
  totalInvested: number;
  dayPnl: number;
  totalPnl: number;

  dataLoading: boolean;

  buyStock: (
    stockId: string,
    quantity: number
  ) => Promise<void>;

  sellStock: (
    stockId: string,
    quantity: number
  ) => Promise<void>;

  getHolding: (
    stockId: string
  ) => Holding | undefined;

  depositFunds: (
    amount: number
  ) => Promise<void>;

  refreshData: () => Promise<void>;
  refreshMarketData: () => Promise<void>;
  isInWatchlist: (
  stockId: string
) => boolean;

addToWatchlist: (
  stockId: string
) => Promise<void>;

removeFromWatchlist: (
  stockId: string
) => Promise<void>;

toggleWatchlist: (
  stockId: string
) => Promise<void>;
}

const AppContext =
  createContext<AppContextValue | null>(null);

function findStockId(symbol: string): string {
  return (
    STOCKS.find(
      stock =>
        stock.symbol.toUpperCase() ===
        symbol.toUpperCase()
    )?.id ?? symbol.toLowerCase()
  );
}

function toSymbol(stockIdOrSymbol: string): string {
  const stock = STOCKS.find(
    item => item.id === stockIdOrSymbol
  );

  return (
    stock?.symbol ?? stockIdOrSymbol
  ).toUpperCase();
}

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    user,
    token,
    refreshUser,
  } = useAuth();

  const { refreshNotifications } = useNotifications();

  const [holdings, setHoldings] =
    useState<Holding[]>([]);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [watchlist, setWatchlist] =
    useState<string[]>([]);

  const [dataLoading, setDataLoading] =
    useState(false);

  const [livePrices, setLivePrices] = useState<
    Record<string, number>
  >(() =>
    Object.fromEntries(
      STOCKS.map(stock => [
        stock.id,
        stock.currentPrice,
      ])
    )
  );

  const [liveChanges, setLiveChanges] = useState<
    Record<
      string,
      {
        change: number;
        changePercent: number;
      }
    >
  >(() =>
    Object.fromEntries(
      STOCKS.map(stock => [
        stock.id,
        {
          change: stock.change,
          changePercent: stock.changePercent,
        },
      ])
    )
  );

  const walletBalance =
    user?.walletBalance ?? 0;

  const refreshData = useCallback(async () => {
    if (!token) {
      setHoldings([]);
      setTransactions([]);
      setWatchlist([]);
      return;
    }

    setDataLoading(true);

    try {
      const [
        portfolioResponse,
        transactionResponse,
        watchlistResponse,
      ] = await Promise.all([
        getPortfolio(token),
        getTransactions(token),
        getWatchlist(token),
      ]);

      const backendHoldings =
        portfolioResponse as BackendHolding[];

      const backendTransactions =
        transactionResponse as BackendTransaction[];

      setHoldings(
        backendHoldings.map(holding => ({
          stockId: findStockId(holding.symbol),
          symbol: holding.symbol,
          companyName: holding.companyName,
          quantity: holding.quantity,
          averageBuyPrice: holding.averagePrice,
        }))
      );

      setTransactions(
        backendTransactions.map(transaction => ({
          id:
            transaction._id ??
            transaction.id ??
            crypto.randomUUID(),

          stockId: findStockId(
            transaction.symbol
          ),

          symbol: transaction.symbol,
          companyName:
            transaction.companyName,

          quantity: transaction.quantity,
          price: transaction.price,

          totalAmount:
            transaction.total ??
            transaction.totalAmount ??
            transaction.quantity *
              transaction.price,

          type: transaction.type,

          timestamp:
            transaction.createdAt ??
            transaction.timestamp ??
            new Date().toISOString(),
        }))
      );
      setWatchlist(
        watchlistResponse.stocks.map(symbol =>
          symbol.toUpperCase()
      )
    );
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const refreshMarketData =
    useCallback(async () => {
      if (!token) return;

      try {
        const response =
          await getMarketQuotes(
            token,
            STOCKS.map(
              stock => stock.symbol
            )
          );

        const priceEntries:
          [string, number][] = [];

        const changeEntries:
          [
            string,
            {
              change: number;
              changePercent: number;
            },
          ][] = [];

        response.quotes.forEach(
          quote => {
            const stock =
              STOCKS.find(
                item =>
                  item.symbol.toUpperCase() ===
                  quote.symbol.toUpperCase()
              );

            if (!stock) return;

            priceEntries.push([
              stock.id,
              quote.currentPrice,
            ]);

            changeEntries.push([
              stock.id,
              {
                change: quote.change,
                changePercent: quote.changePercent,
                previousClose: quote.previousClose,
              },
            ]);
          }
        );

        setLivePrices(previous => ({
          ...previous,
          ...Object.fromEntries(
            priceEntries
          ),
        }));

        setLiveChanges(previous => ({
          ...previous,
          ...Object.fromEntries(
            changeEntries
          ),
        }));
      } catch (error) {
        console.error(
          "Unable to refresh market data:",
          error
        );
      }
    }, [token]);

  useEffect(() => {
    void refreshMarketData();

    if (!token) return;

    const interval =
      window.setInterval(() => {
        void refreshMarketData();
      }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    token,
    refreshMarketData,
  ]);

  const portfolioValue = useMemo(
    () =>
      holdings.reduce((sum, holding) => {
        const price =
          livePrices[holding.stockId] ?? 0;

        return (
          sum +
          holding.quantity * price
        );
      }, 0),
    [holdings, livePrices]
  );

  const totalInvested = useMemo(
    () =>
      holdings.reduce(
        (sum, holding) =>
          sum +
          holding.quantity *
            holding.averageBuyPrice,
        0
      ),
    [holdings]
  );

  const totalPnl =
    portfolioValue - totalInvested;

  const dayPnl = useMemo(
  () =>
    holdings.reduce((sum, holding) => {
      const currentPrice =
        livePrices[holding.stockId];

      const change =
        liveChanges[holding.stockId];

      if (
        currentPrice === undefined ||
        !change
      ) {
        return sum;
      }

      return (
        sum +
        holding.quantity *
          (currentPrice -
            change.previousClose)
      );
    }, 0),
  [holdings, livePrices, liveChanges]
);

  const getHolding = useCallback(
    (stockId: string) =>
      holdings.find(
        holding =>
          holding.stockId === stockId
      ),
    [holdings]
  );

  

  const isInWatchlist = useCallback(
    (stockId: string) => {
      const symbol = toSymbol(stockId);
      return watchlist.includes(symbol);
    },
    [watchlist]
  );

  const addToWatchlist = useCallback(
    async (stockId: string) => {
      if (!token) throw new Error('Not logged in');

      const symbol = toSymbol(stockId);

      const response = await addWatchlistStock(
        token,
        symbol
      );

      setWatchlist(
        response.stocks.map(item =>
          item.toUpperCase()
        )
      );
      await refreshNotifications();
    },
    [token, refreshNotifications]
  );

  const removeFromWatchlist = useCallback(
    async (stockId: string) => {
      if (!token) throw new Error('Not logged in');

      const symbol = toSymbol(stockId);

      const response =
        await removeWatchlistStock(
          token,
          symbol
        );

      setWatchlist(
        response.stocks.map(item =>
          item.toUpperCase()
        )
      );
      await refreshNotifications();
    },
    [token, refreshNotifications]
  );

  const toggleWatchlist = useCallback(
    async (stockId: string) => {
      if (isInWatchlist(stockId)) {
        await removeFromWatchlist(stockId);
      } else {
        await addToWatchlist(stockId);
      }
    },
    [isInWatchlist, removeFromWatchlist, addToWatchlist]
  );

  const buyStock = useCallback(
    async (
      stockId: string,
      quantity: number
    ) => {
      if (!token) {
        throw new Error('Not logged in');
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          'Quantity must be a positive integer'
        );
      }

      const stock = STOCKS.find(
        item => item.id === stockId
      );

      if (!stock) {
        throw new Error('Stock not found');
      }

      const price =
        livePrices[stockId];

      if (!price) {
        throw new Error(
          'Stock price is unavailable'
        );
      }

      await addTransaction(token, {
        symbol: stock.symbol,
        companyName: stock.companyName,
        quantity,
        price: Number(price.toFixed(2)),
        type: 'BUY',
      });

      await Promise.all([
        refreshData(),
        refreshUser(),
        refreshNotifications(),
      ]);
    },
    [
      token,
      livePrices,
      refreshData,
      refreshUser,
      refreshNotifications,
    ]
  );

  const sellStock = useCallback(
    async (
      stockId: string,
      quantity: number
    ) => {
      if (!token) {
        throw new Error('Not logged in');
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          'Quantity must be a positive integer'
        );
      }

      const stock = STOCKS.find(
        item => item.id === stockId
      );

      if (!stock) {
        throw new Error('Stock not found');
      }

      const holding =
        holdings.find(
          item =>
            item.stockId === stockId
        );

      if (
        !holding ||
        holding.quantity < quantity
      ) {
        throw new Error(
          'Insufficient shares to sell'
        );
      }

      const price =
        livePrices[stockId];

      if (!price) {
        throw new Error(
          'Stock price is unavailable'
        );
      }

      await addTransaction(token, {
        symbol: stock.symbol,
        companyName: stock.companyName,
        quantity,
        price: Number(price.toFixed(2)),
        type: 'SELL',
      });

      await Promise.all([
        refreshData(),
        refreshUser(),
        refreshNotifications(),
      ]);
    },
    [
      token,
      holdings,
      livePrices,
      refreshData,
      refreshUser,
      refreshNotifications,
    ]
  );

  const depositFunds = useCallback(
    async (amount: number) => {
      if (!token) {
        throw new Error('Not logged in');
      }

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        throw new Error(
          'Deposit amount must be positive'
        );
      }

      await depositFundsRequest(
        token,
        amount
      );

      await Promise.all([
        refreshUser(),
        refreshNotifications(),
      ]);
    },
    [token, refreshUser, refreshNotifications]
  );

  return (
    <AppContext.Provider
      value={{
        livePrices,
        liveChanges,
        walletBalance,
        holdings,
        transactions,
        watchlist,
        portfolioValue,
        totalInvested,
        dayPnl,
        totalPnl,
        dataLoading,
        buyStock,
        sellStock,
        getHolding,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        depositFunds,
        refreshData,
        refreshMarketData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used within AppProvider'
    );
  }

  return context;
}