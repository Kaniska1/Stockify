import api from "./api";

export interface WatchlistResponse {
  stocks: string[];
}

export const getWatchlist = (
  token: string
) =>
  api<WatchlistResponse>("/watchlist", {
    token,
  });

export const addWatchlistStock = (
  token: string,
  symbol: string
) =>
  api<WatchlistResponse>("/watchlist", {
    method: "POST",
    token,
    body: JSON.stringify({
      symbol,
    }),
  });

export const removeWatchlistStock = (
  token: string,
  symbol: string
) =>
  api<WatchlistResponse>(
    `/watchlist/${encodeURIComponent(symbol)}`,
    {
      method: "DELETE",
      token,
    }
  );