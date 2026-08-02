interface FinnhubQuoteResponse {
  c?: number;
  d?: number;
  dp?: number;
  h?: number;
  l?: number;
  o?: number;
  pc?: number;
  t?: number;
}

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

interface CachedQuote {
  quote: MarketQuote;
  expiresAt: number;
}

const quoteCache = new Map<
  string,
  CachedQuote
>();

const CACHE_DURATION_MS = 30_000;

function getFinnhubApiKey(): string {
  const apiKey =
    process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "FINNHUB_API_KEY is not configured"
    );
  }

  return apiKey;
}

function normalizeSymbol(
  symbol: string
): string {
  return symbol.trim().toUpperCase();
}

function isPositiveNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

export async function getMarketQuote(
  rawSymbol: string
): Promise<MarketQuote> {
  const symbol =
    normalizeSymbol(rawSymbol);

  if (!symbol) {
    throw new Error(
      "Stock symbol is required"
    );
  }

  const cached =
    quoteCache.get(symbol);

  if (
    cached &&
    cached.expiresAt > Date.now()
  ) {
    return cached.quote;
  }

  const apiKey =
    getFinnhubApiKey();

  const url = new URL(
    "https://finnhub.io/api/v1/quote"
  );

  url.searchParams.set(
    "symbol",
    symbol
  );

  const response = await fetch(url, {
    headers: {
      "X-Finnhub-Token": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Finnhub request failed with status ${response.status}`
    );
  }

  const data =
    (await response.json()) as FinnhubQuoteResponse;

  if (!isPositiveNumber(data.c)) {
    throw new Error(
      `No valid quote was returned for ${symbol}`
    );
  }

  const previousClose =
    isPositiveNumber(data.pc)
      ? data.pc
      : data.c;

  const change =
    typeof data.d === "number" &&
    Number.isFinite(data.d)
      ? data.d
      : data.c - previousClose;

  const changePercent =
    typeof data.dp === "number" &&
    Number.isFinite(data.dp)
      ? data.dp
      : previousClose > 0
        ? (change / previousClose) *
          100
        : 0;

  const quote: MarketQuote = {
    symbol,
    currentPrice: data.c,

    change,
    changePercent,

    high:
      isPositiveNumber(data.h)
        ? data.h
        : data.c,

    low:
      isPositiveNumber(data.l)
        ? data.l
        : data.c,

    open:
      isPositiveNumber(data.o)
        ? data.o
        : data.c,

    previousClose,

    timestamp:
      typeof data.t === "number"
        ? data.t
        : Math.floor(Date.now() / 1000),

    source: "finnhub",
  };

  quoteCache.set(symbol, {
    quote,
    expiresAt:
      Date.now() +
      CACHE_DURATION_MS,
  });

  return quote;
}

export async function getMarketQuotes(
  symbols: string[]
): Promise<MarketQuote[]> {
  const uniqueSymbols = [
    ...new Set(
      symbols
        .map(normalizeSymbol)
        .filter(Boolean)
    ),
  ];

  const results =
    await Promise.allSettled(
      uniqueSymbols.map(getMarketQuote)
    );

  return results.flatMap(result =>
    result.status === "fulfilled"
      ? [result.value]
      : []
  );
}