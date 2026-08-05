import { useMemo, useState } from "react";
import { Link } from "react-router";
import { getStockLogo } from "../lib/getStockLogo";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { STOCKS, SECTORS } from "../data/stocks";
import { useApp } from "../context/AppContext";

const PAGE_SIZE = 15;

type SortKey =
  | "companyName"
  | "currentPrice"
  | "changePercent"
  | "volume"
  | "marketCap";

interface SortIconProps {
  column: SortKey;
  activeColumn: SortKey;
  direction: "asc" | "desc";
}

function SortIcon({
  column,
  activeColumn,
  direction,
}: SortIconProps) {
  const active = column === activeColumn;

  if (!active) {
    return (
      <ChevronDown
        size={12}
        className="markets-sort-icon"
      />
    );
  }

  return direction === "asc" ? (
    <ChevronUp
      size={12}
      className="markets-sort-icon markets-sort-icon-active"
    />
  ) : (
    <ChevronDown
      size={12}
      className="markets-sort-icon markets-sort-icon-active"
    />
  );
}

function formatMarketCap(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}T`;
  }

  return `$${value.toFixed(0)}B`;
}

export default function StocksPage() {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");

  const [sortKey, setSortKey] =
    useState<SortKey>("marketCap");

  const [sortDirection, setSortDirection] =
    useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);

  const {
    livePrices,
    liveChanges,
    isInWatchlist,
    toggleWatchlist,
  } = useApp();

  const sectors = ["All", ...SECTORS];

  const filteredStocks = useMemo(() => {
    let stocks = [...STOCKS];

    const normalizedQuery = query
      .trim()
      .toLowerCase();

    if (normalizedQuery) {
      stocks = stocks.filter(
        (stock) =>
          stock.symbol
            .toLowerCase()
            .includes(normalizedQuery) ||
          stock.companyName
            .toLowerCase()
            .includes(normalizedQuery)
      );
    }

    if (sector !== "All") {
      stocks = stocks.filter(
        (stock) => stock.sector === sector
      );
    }

    stocks.sort((first, second) => {
      if (sortKey === "companyName") {
        const result =
          first.companyName.localeCompare(
            second.companyName
          );

        return sortDirection === "asc"
          ? result
          : -result;
      }

      let firstValue: number;
      let secondValue: number;

      if (sortKey === "currentPrice") {
        firstValue =
          livePrices[first.id] ??
          first.currentPrice;

        secondValue =
          livePrices[second.id] ??
          second.currentPrice;
      } else if (
        sortKey === "changePercent"
      ) {
        firstValue =
          liveChanges[first.id]
            ?.changePercent ??
          first.changePercent;

        secondValue =
          liveChanges[second.id]
            ?.changePercent ??
          second.changePercent;
      } else {
        firstValue =
          first[sortKey] as number;

        secondValue =
          second[sortKey] as number;
      }

      return sortDirection === "asc"
        ? firstValue - secondValue
        : secondValue - firstValue;
    });

    return stocks;
  }, [
    query,
    sector,
    sortKey,
    sortDirection,
    livePrices,
    liveChanges,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredStocks.length / PAGE_SIZE
    )
  );

  const paginatedStocks =
    filteredStocks.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

  const visiblePages = useMemo(() => {
    const pageCount = Math.min(
      5,
      totalPages
    );

    const start = Math.max(
      1,
      Math.min(
        page - 2,
        totalPages - pageCount + 1
      )
    );

    return Array.from(
      { length: pageCount },
      (_, index) => start + index
    );
  }, [page, totalPages]);

  const toggleSort = (column: SortKey) => {
    if (column === sortKey) {
      setSortDirection((current) =>
        current === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortKey(column);
      setSortDirection("desc");
    }

    setPage(1);
  };

  const handleWatchlistToggle = async (
    stockId: string,
    symbol: string
  ) => {
    const saved =
      isInWatchlist(stockId);

    try {
      await toggleWatchlist(stockId);

      toast.success(
        saved
          ? `${symbol} removed from watchlist`
          : `${symbol} added to watchlist`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update watchlist"
      );
    }
  };

  return (
    <div className="markets-page">
      <section className="markets-heading">
        <div>
          <span className="markets-eyebrow">
            LIVE MARKET DATA
          </span>

          <h1>Markets</h1>

          <p>
            Discover stocks, monitor movement
            and build your watchlist.
          </p>
        </div>

        <div className="markets-heading-status">
          <span />
          Finnhub feed active
        </div>
      </section>

      <section className="markets-toolbar">
        <div className="markets-search">
          <Search size={15} />

          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search by company or ticker"
          />
        </div>

        <div className="markets-sector-wrap">
          <div className="markets-sector-label">
            <Filter size={14} />
            Sector
          </div>

          <div className="markets-sector-list">
            {sectors.map((item) => (
              <button
                type="button"
                key={item}
                className={`markets-sector-button ${
                  sector === item
                    ? "markets-sector-button-active"
                    : ""
                }`}
                onClick={() => {
                  setSector(item);
                  setPage(1);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="markets-summary">
        <div>
          <span>Available stocks</span>
          <strong className="sf-number">
            {STOCKS.length}
          </strong>
        </div>

        <div>
          <span>Matching results</span>
          <strong className="sf-number">
            {filteredStocks.length}
          </strong>
        </div>

        <div>
          <span>Selected sector</span>
          <strong>{sector}</strong>
        </div>
      </section>

      <section className="markets-table-panel">
        <div className="markets-table-scroll">
          <table className="markets-table">
            <thead>
              <tr>
                <th className="markets-index-column">
                  #
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSort(
                        "companyName"
                      )
                    }
                  >
                    Company
                    <SortIcon
                      column="companyName"
                      activeColumn={sortKey}
                      direction={
                        sortDirection
                      }
                    />
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSort(
                        "currentPrice"
                      )
                    }
                  >
                    Price
                    <SortIcon
                      column="currentPrice"
                      activeColumn={sortKey}
                      direction={
                        sortDirection
                      }
                    />
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSort(
                        "changePercent"
                      )
                    }
                  >
                    Change
                    <SortIcon
                      column="changePercent"
                      activeColumn={sortKey}
                      direction={
                        sortDirection
                      }
                    />
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSort("volume")
                    }
                  >
                    Volume
                    <SortIcon
                      column="volume"
                      activeColumn={sortKey}
                      direction={
                        sortDirection
                      }
                    />
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSort(
                        "marketCap"
                      )
                    }
                  >
                    Market cap
                    <SortIcon
                      column="marketCap"
                      activeColumn={sortKey}
                      direction={
                        sortDirection
                      }
                    />
                  </button>
                </th>

                <th>Sector</th>
                <th className="markets-action-column" />
              </tr>
            </thead>

            <tbody>
              {paginatedStocks.length ===
              0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="markets-empty-state">
                      <Search size={28} />

                      <strong>
                        No matching stocks
                      </strong>

                      <span>
                        Try another company,
                        ticker or sector.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStocks.map(
                  (stock, index) => {
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

                    const saved =
                      isInWatchlist(
                        stock.id
                      );

                    const rowNumber =
                      (page - 1) *
                        PAGE_SIZE +
                      index +
                      1;

                    return (
                      <tr key={stock.id}>
                        <td className="markets-index-column sf-number">
                          {rowNumber}
                        </td>

                        <td>
                          <Link
                            to={`/stocks/${stock.id}`}
                            className="markets-company-link"
                          >
                            <span className="markets-company-logo">
                              {stock.symbol.slice(
                                0,
                                2
                              )}
                            </span>

                            <span className="markets-company-copy">
                              <strong>
                                {
                                  stock.symbol
                                }
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
                          <span className="markets-price sf-number">
                            $
                            {price.toFixed(
                              2
                            )}
                          </span>
                        </td>

                        <td>
                          <div
                            className={`markets-change ${
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
                                change.change ??
                                  0
                              ).toFixed(2)}
                            </small>
                          </div>
                        </td>

                        <td>
                          <span className="markets-muted-value sf-number">
                            {stock.volume.toFixed(
                              1
                            )}
                            M
                          </span>
                        </td>

                        <td>
                          <span className="markets-muted-value sf-number">
                            {formatMarketCap(
                              stock.marketCap
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="markets-sector-pill">
                            {stock.sector}
                          </span>
                        </td>

                        <td className="markets-action-column">
                          <button
                            type="button"
                            className={`markets-watchlist-button ${
                              saved
                                ? "markets-watchlist-button-active"
                                : ""
                            }`}
                            onClick={() =>
                              void handleWatchlistToggle(
                                stock.id,
                                stock.symbol
                              )
                            }
                            aria-label={
                              saved
                                ? "Remove from watchlist"
                                : "Add to watchlist"
                            }
                            title={
                              saved
                                ? "Remove from watchlist"
                                : "Add to watchlist"
                            }
                          >
                            {saved ? (
                              <BookmarkCheck
                                size={16}
                              />
                            ) : (
                              <Bookmark
                                size={16}
                              />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        <footer className="markets-pagination">
          <span>
            Showing{" "}
            {filteredStocks.length === 0
              ? 0
              : (page - 1) *
                  PAGE_SIZE +
                1}
            –
            {Math.min(
              page * PAGE_SIZE,
              filteredStocks.length
            )}{" "}
            of {filteredStocks.length}
          </span>

          <div>
            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(
                    1,
                    current - 1
                  )
                )
              }
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

            {visiblePages.map(
              (pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={
                    page === pageNumber
                      ? "markets-page-button-active"
                      : ""
                  }
                  onClick={() =>
                    setPage(pageNumber)
                  }
                >
                  {pageNumber}
                </button>
              )
            )}

            <button
              type="button"
              disabled={
                page === totalPages
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
                )
              }
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}