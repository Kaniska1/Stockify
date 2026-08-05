import { useMemo, useState } from "react";
import { Link } from "react-router";
import { getStockLogo } from "../lib/getStockLogo";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkX,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { STOCKS } from "../data/stocks";
import { useApp } from "../context/AppContext";

function formatMarketCap(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}T`;
  }

  return `$${value.toFixed(0)}B`;
}

export default function WatchlistPage() {
  const [query, setQuery] = useState("");
  const [removingSymbol, setRemovingSymbol] =
    useState<string | null>(null);

  const {
    watchlist,
    livePrices,
    liveChanges,
    removeFromWatchlist,
  } = useApp();

  const savedStocks = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return STOCKS.filter((stock) =>
      watchlist.includes(
        stock.symbol.toUpperCase()
      )
    ).filter((stock) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        stock.symbol
          .toLowerCase()
          .includes(normalizedQuery) ||
        stock.companyName
          .toLowerCase()
          .includes(normalizedQuery) ||
        stock.sector
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [watchlist, query]);

  const positiveStocks = useMemo(
    () =>
      savedStocks.filter((stock) => {
        const change =
          liveChanges[stock.id]
            ?.changePercent ??
          stock.changePercent;

        return change >= 0;
      }).length,
    [savedStocks, liveChanges]
  );

  const negativeStocks =
    savedStocks.length - positiveStocks;

  const bestPerformer = useMemo(() => {
    if (savedStocks.length === 0) {
      return null;
    }

    return [...savedStocks].sort(
      (first, second) =>
        (liveChanges[second.id]
          ?.changePercent ??
          second.changePercent) -
        (liveChanges[first.id]
          ?.changePercent ??
          first.changePercent)
    )[0];
  }, [savedStocks, liveChanges]);

  const handleRemove = async (
    stockId: string,
    symbol: string
  ) => {
    setRemovingSymbol(symbol);

    try {
      await removeFromWatchlist(stockId);

      toast.success(
        `${symbol} removed from watchlist`
      );
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
    <div className="watchlist-page">
      <section className="watchlist-heading">
        <div>
          <span className="watchlist-eyebrow">
            SAVED MARKETS
          </span>

          <h1>Watchlist</h1>

          <p>
            Track companies you care about
            without adding them to your
            portfolio.
          </p>
        </div>

        <Link
          to="/stocks"
          className="watchlist-browse-button"
        >
          Browse markets
          <ArrowUpRight size={15} />
        </Link>
      </section>

      {watchlist.length === 0 ? (
        <section className="watchlist-empty">
          <div className="watchlist-empty-icon">
            <Bookmark size={27} />
          </div>

          <span className="watchlist-empty-label">
            YOUR WATCHLIST
          </span>

          <h2>
            Save stocks worth following
          </h2>

          <p>
            Add companies from the Markets
            or Stock Details pages and track
            their live prices here.
          </p>

          <Link
            to="/stocks"
            className="watchlist-primary-action"
          >
            Explore stocks
            <ArrowUpRight size={15} />
          </Link>
        </section>
      ) : (
        <>
          <section className="watchlist-summary">
            <article>
              <span>Saved stocks</span>

              <strong className="sf-number">
                {watchlist.length}
              </strong>

              <small>
                Companies being tracked
              </small>
            </article>

            <article>
              <span>Trading higher</span>

              <strong className="sf-number positive">
                {positiveStocks}
              </strong>

              <small>
                Positive daily movement
              </small>
            </article>

            <article>
              <span>Trading lower</span>

              <strong className="sf-number negative">
                {negativeStocks}
              </strong>

              <small>
                Negative daily movement
              </small>
            </article>

            <article>
              <span>Best performer</span>

              <strong>
                {bestPerformer?.symbol ??
                  "—"}
              </strong>

              <small
                className={
                  bestPerformer &&
                  (liveChanges[
                    bestPerformer.id
                  ]?.changePercent ??
                    bestPerformer.changePercent) >=
                    0
                    ? "positive"
                    : "negative"
                }
              >
                {bestPerformer
                  ? `${
                      (
                        liveChanges[
                          bestPerformer.id
                        ]?.changePercent ??
                        bestPerformer.changePercent
                      ) >= 0
                        ? "+"
                        : ""
                    }${(
                      liveChanges[
                        bestPerformer.id
                      ]?.changePercent ??
                      bestPerformer.changePercent
                    ).toFixed(2)}%`
                  : "No data"}
              </small>
            </article>
          </section>

          <section className="watchlist-toolbar">
            <div className="watchlist-search">
              <Search size={15} />

              <input
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                placeholder="Search your watchlist"
              />
            </div>

            <div className="watchlist-feed-status">
              <span />
              Live market feed
            </div>
          </section>

          {savedStocks.length === 0 ? (
            <section className="watchlist-no-results">
              <Search size={26} />

              <strong>
                No matching stocks
              </strong>

              <span>
                Try another company, ticker
                or sector.
              </span>
            </section>
          ) : (
            <section className="watchlist-table-panel">
              <div className="watchlist-table-scroll">
                <table className="watchlist-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Price</th>
                      <th>Change</th>
                      <th>Sector</th>
                      <th>Market cap</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {savedStocks.map(
                      (stock) => {
                        const price =
                          livePrices[
                            stock.id
                          ] ??
                          stock.currentPrice;

                        const change =
                          liveChanges[
                            stock.id
                          ] ?? {
                            change:
                              stock.change,
                            changePercent:
                              stock.changePercent,
                          };

                        const isPositive =
                          change.changePercent >=
                          0;

                        const isRemoving =
                          removingSymbol ===
                          stock.symbol;

                        return (
                          <tr key={stock.id}>
                            <td>
                              <Link
                                to={`/stocks/${stock.id}`}
                                className="watchlist-company-link"
                              >
                                <span className="watchlist-company-logo">
                                  {stock.symbol.slice(
                                    0,
                                    2
                                  )}
                                </span>

                                <span className="watchlist-company-copy">
                                  <strong>
                                    {stock.symbol}
                                  </strong>

                                  <small>
                                    {
                                      stock.companyName
                                    }
                                  </small>
                                </span>
                              </Link>
                            </td>

                            <td>
                              <span className="watchlist-price sf-number">
                                $
                                {price.toFixed(
                                  2
                                )}
                              </span>
                            </td>

                            <td>
                              <div
                                className={`watchlist-change ${
                                  isPositive
                                    ? "positive"
                                    : "negative"
                                }`}
                              >
                                <span>
                                  {isPositive ? (
                                    <TrendingUp
                                      size={13}
                                    />
                                  ) : (
                                    <TrendingDown
                                      size={13}
                                    />
                                  )}

                                  {isPositive
                                    ? "+"
                                    : ""}
                                  {change.changePercent.toFixed(
                                    2
                                  )}
                                  %
                                </span>

                                <small className="sf-number">
                                  {isPositive
                                    ? "+"
                                    : "-"}
                                  $
                                  {Math.abs(
                                    change.change
                                  ).toFixed(2)}
                                </small>
                              </div>
                            </td>

                            <td>
                              <span className="watchlist-sector-pill">
                                {stock.sector}
                              </span>
                            </td>

                            <td>
                              <span className="watchlist-market-cap sf-number">
                                {formatMarketCap(
                                  stock.marketCap
                                )}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                disabled={
                                  isRemoving
                                }
                                className="watchlist-remove-button"
                                onClick={() =>
                                  void handleRemove(
                                    stock.id,
                                    stock.symbol
                                  )
                                }
                                aria-label="Remove from watchlist"
                                title="Remove from watchlist"
                              >
                                {isRemoving ? (
                                  <span className="watchlist-spinner" />
                                ) : (
                                  <BookmarkX
                                    size={16}
                                  />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <footer className="watchlist-table-footer">
                Quotes are provided by
                Finnhub and may vary by
                market status and data
                entitlement.
              </footer>
            </section>
          )}
        </>
      )}
    </div>
  );
}