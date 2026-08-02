import api from "./api";

export interface MarketQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
  source: "finnhub";
}

export interface QuotesResponse {
  quotes: MarketQuote[];
  requested: number;
  returned: number;
}

export interface QuoteResponse {
  quote: MarketQuote;
}

export const getMarketQuotes = (
  token: string,
  symbols: string[]
) => {
  const cleanedSymbols = symbols
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  if (cleanedSymbols.length === 0) {
    throw new Error("At least one stock symbol is required");
  }

  return api<QuotesResponse>(
    `/market/quotes?symbols=${encodeURIComponent(
      cleanedSymbols.join(",")
    )}`,
    {
      token,
    }
  );
};

export const getMarketQuote = (
  token: string,
  symbol: string
) => {
  const cleanedSymbol = symbol.trim().toUpperCase();

  if (!cleanedSymbol) {
    throw new Error("Stock symbol is required");
  }

  return api<QuoteResponse>(
    `/market/quote/${encodeURIComponent(cleanedSymbol)}`,
    {
      token,
    }
  );
};