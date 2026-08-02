import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Bookmark,
  BookmarkX,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { STOCKS } from "../data/stocks";
import { useApp } from "../context/AppContext";

export default function WatchlistPage() {
  const [query, setQuery] = useState("");
  const [removingSymbol, setRemovingSymbol] = useState<string | null>(
    null
  );

  const {
    watchlist,
    livePrices,
    liveChanges,
    removeFromWatchlist,
  } = useApp();

  const savedStocks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return STOCKS.filter((stock) =>
      watchlist.includes(stock.symbol.toUpperCase())
    ).filter((stock) => {
      if (!normalizedQuery) return true;

      return (
        stock.symbol.toLowerCase().includes(normalizedQuery) ||
        stock.companyName.toLowerCase().includes(normalizedQuery) ||
        stock.sector.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [watchlist, query]);

  const handleRemove = async (
    stockId: string,
    symbol: string
  ) => {
    setRemovingSymbol(symbol);

    try {
      await removeFromWatchlist(stockId);
      toast.success(`${symbol} removed from watchlist`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to remove stock"
      );
    } finally {
      setRemovingSymbol(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#e7fef6",
              letterSpacing: "-0.02em",
            }}
          >
            Watchlist
          </h1>

          <p
            style={{
              fontSize: "13px",
              color: "#808080",
              marginTop: "2px",
            }}
          >
            {watchlist.length} saved{" "}
            {watchlist.length === 1 ? "stock" : "stocks"}
          </p>
        </div>

        <Link
          to="/stocks"
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
          style={{
            background: "rgba(246,246,9,0.1)",
            border: "1px solid rgba(246,246,9,0.25)",
            color: "#f8f83a",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <Bookmark size={15} />
          Browse Markets
        </Link>
      </div>

      {watchlist.length > 0 && (
        <div className="relative max-w-sm mb-5">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#808080" }}
          />

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your watchlist..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg outline-none"
            style={{
              background: "#1a1a1a",
              border: "1px solid #333333",
              color: "#e7fef6",
              fontSize: "13px",
            }}
            onFocus={(event) => {
              event.currentTarget.style.borderColor = "#f6f609";
            }}
            onBlur={(event) => {
              event.currentTarget.style.borderColor = "#333333";
            }}
          />
        </div>
      )}

      {watchlist.length === 0 ? (
        <div
          className="min-h-[380px] rounded-xl flex flex-col items-center justify-center text-center p-8"
          style={{
            background: "#1a1a1a",
            border: "1px solid #333333",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "rgba(246,246,9,0.1)",
              border: "1px solid rgba(246,246,9,0.2)",
            }}
          >
            <Bookmark size={25} style={{ color: "#f6f609" }} />
          </div>

          <h2
            style={{
              fontSize: "17px",
              fontWeight: 650,
              color: "#e7fef6",
              marginBottom: "6px",
            }}
          >
            Your watchlist is empty
          </h2>

          <p
            style={{
              fontSize: "13px",
              color: "#808080",
              maxWidth: "360px",
              lineHeight: 1.6,
              marginBottom: "18px",
            }}
          >
            Save stocks from the Markets or Stock Details pages to
            track them here.
          </p>

          <Link
            to="/stocks"
            className="px-4 py-2 rounded-lg"
            style={{
              background: "#f6f609",
              color: "#0d0d0d",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Explore stocks
          </Link>
        </div>
      ) : savedStocks.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: "#1a1a1a",
            border: "1px solid #333333",
            color: "#808080",
            fontSize: "14px",
          }}
        >
          No saved stocks match your search.
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "#1a1a1a",
            border: "1px solid #333333",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #333333" }}>
                  {[
                    "Company",
                    "Price",
                    "Change",
                    "Sector",
                    "Market Cap",
                    "",
                  ].map((heading) => (
                    <th
                      key={heading || "actions"}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#808080",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {savedStocks.map((stock) => {
                  const price =
                    livePrices[stock.id] ?? stock.currentPrice;

                  const change = liveChanges[stock.id] ?? {
                    change: stock.change,
                    changePercent: stock.changePercent,
                  };

                  const isUp = change.changePercent >= 0;
                  const isRemoving =
                    removingSymbol === stock.symbol;

                  return (
                    <tr
                      key={stock.id}
                      style={{
                        borderBottom: "1px solid #0d0d0d",
                      }}
                    >
                      <td style={{ padding: "13px 16px" }}>
                        <Link
                          to={`/stocks/${stock.id}`}
                          className="flex items-center gap-3"
                          style={{ textDecoration: "none" }}
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{
                              background: `${stock.color}15`,
                              border: `1px solid ${stock.color}25`,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: stock.color,
                              }}
                            >
                              {stock.symbol.slice(0, 2)}
                            </span>
                          </div>

                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#e7fef6",
                              }}
                            >
                              {stock.symbol}
                            </div>

                            <div
                              style={{
                                fontSize: "11px",
                                color: "#808080",
                              }}
                            >
                              {stock.companyName}
                            </div>
                          </div>
                        </Link>
                      </td>

                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#e7fef6",
                        }}
                      >
                        ${price.toFixed(2)}
                      </td>

                      <td style={{ padding: "13px 16px" }}>
                        <div className="flex items-center gap-1.5">
                          {isUp ? (
                            <TrendingUp
                              size={14}
                              style={{ color: "#10b981" }}
                            />
                          ) : (
                            <TrendingDown
                              size={14}
                              style={{ color: "#f43f5e" }}
                            />
                          )}

                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: isUp
                                  ? "#10b981"
                                  : "#f43f5e",
                              }}
                            >
                              {isUp ? "+" : ""}
                              {change.changePercent.toFixed(2)}%
                            </div>

                            <div
                              style={{
                                fontSize: "11px",
                                color: "#4d4d4d",
                              }}
                            >
                              {isUp ? "+" : "-"}$
                              {Math.abs(change.change).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "13px 16px" }}>
                        <span
                          className="px-2 py-0.5 rounded-md"
                          style={{
                            fontSize: "11px",
                            background: "rgba(246,246,9,0.1)",
                            color: "#f8f83a",
                          }}
                        >
                          {stock.sector}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: "12px",
                          color: "#999999",
                        }}
                      >
                        $
                        {stock.marketCap >= 1000
                          ? `${(stock.marketCap / 1000).toFixed(1)}T`
                          : `${stock.marketCap.toFixed(0)}B`}
                      </td>

                      <td
                        style={{
                          padding: "13px 16px",
                          textAlign: "right",
                        }}
                      >
                        <button
                          type="button"
                          disabled={isRemoving}
                          onClick={() =>
                            handleRemove(stock.id, stock.symbol)
                          }
                          className="p-2 rounded-lg transition-all"
                          style={{
                            background: "rgba(244,63,94,0.08)",
                            border:
                              "1px solid rgba(244,63,94,0.15)",
                            color: isRemoving
                              ? "#4d4d4d"
                              : "#f43f5e",
                            cursor: isRemoving
                              ? "not-allowed"
                              : "pointer",
                          }}
                          title="Remove from watchlist"
                        >
                          {isRemoving ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                          ) : (
                            <BookmarkX size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p
        style={{
          marginTop: "12px",
          fontSize: "11px",
          color: "#4d4d4d",
        }}
      >
        Quotes are provided by Finnhub and may vary by market status and data entitlement.
      </p>
    </div>
  );
}