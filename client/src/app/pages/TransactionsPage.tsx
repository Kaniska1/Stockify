import { useMemo, useState } from "react";
import { Link } from "react-router";
import { getStockLogo } from "../lib/getStockLogo";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  History,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { useApp } from "../context/AppContext";

const PAGE_SIZE = 20;

type TransactionFilter =
  | "ALL"
  | "BUY"
  | "SELL";

function formatCurrency(
  value: number
): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    return `$${(
      value / 1_000_000
    ).toFixed(2)}M`;
  }

  if (absolute >= 1_000) {
    return `$${(
      value / 1_000
    ).toFixed(1)}K`;
  }

  return `$${value.toFixed(2)}`;
}

function formatDate(
  value: string
): {
  date: string;
  time: string;
} {
  const date = new Date(value);

  return {
    date: date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    ),

    time: date.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    ),
  };
}

export default function TransactionsPage() {
  const { transactions } = useApp();

  const [query, setQuery] =
    useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<TransactionFilter>(
      "ALL"
    );

  const [page, setPage] =
    useState(1);

  const filteredTransactions =
    useMemo(() => {
      const normalizedQuery =
        query.trim().toLowerCase();

      return transactions.filter(
        (transaction) => {
          const matchesSearch =
            !normalizedQuery ||
            transaction.symbol
              .toLowerCase()
              .includes(
                normalizedQuery
              ) ||
            transaction.companyName
              .toLowerCase()
              .includes(
                normalizedQuery
              );

          const matchesType =
            typeFilter === "ALL" ||
            transaction.type ===
              typeFilter;

          return (
            matchesSearch &&
            matchesType
          );
        }
      );
    }, [
      transactions,
      query,
      typeFilter,
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredTransactions.length /
        PAGE_SIZE
    )
  );

  const paginatedTransactions =
    filteredTransactions.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

  const visiblePages =
    useMemo(() => {
      const pageCount = Math.min(
        5,
        totalPages
      );

      const start = Math.max(
        1,
        Math.min(
          page - 2,
          totalPages -
            pageCount +
            1
        )
      );

      return Array.from(
        { length: pageCount },
        (_, index) =>
          start + index
      );
    }, [page, totalPages]);

  const totalBought =
    useMemo(
      () =>
        transactions
          .filter(
            (transaction) =>
              transaction.type ===
              "BUY"
          )
          .reduce(
            (sum, transaction) =>
              sum +
              transaction.totalAmount,
            0
          ),
      [transactions]
    );

  const totalSold =
    useMemo(
      () =>
        transactions
          .filter(
            (transaction) =>
              transaction.type ===
              "SELL"
          )
          .reduce(
            (sum, transaction) =>
              sum +
              transaction.totalAmount,
            0
          ),
      [transactions]
    );

  const buyCount =
    transactions.filter(
      (transaction) =>
        transaction.type === "BUY"
    ).length;

  const sellCount =
    transactions.length - buyCount;

  return (
    <div className="transactions-page">
      <section className="transactions-heading">
        <div>
          <span className="transactions-eyebrow">
            ACCOUNT ACTIVITY
          </span>

          <h1>Transactions</h1>

          <p>
            Review every simulated trade
            placed through your Stockify
            account.
          </p>
        </div>

        <Link
          to="/stocks"
          className="transactions-trade-button"
        >
          Place a trade
          <ArrowUpRight
            size={15}
          />
        </Link>
      </section>

      <section className="transactions-summary">
        <article>
          <span>
            Total transactions
          </span>

          <strong className="sf-number">
            {transactions.length}
          </strong>

          <small>
            Complete order history
          </small>
        </article>

        <article>
          <span>Total bought</span>

          <strong className="sf-number">
            {formatCurrency(
              totalBought
            )}
          </strong>

          <small>
            {buyCount} buy{" "}
            {buyCount === 1
              ? "order"
              : "orders"}
          </small>
        </article>

        <article>
          <span>Total sold</span>

          <strong className="sf-number">
            {formatCurrency(
              totalSold
            )}
          </strong>

          <small>
            {sellCount} sell{" "}
            {sellCount === 1
              ? "order"
              : "orders"}
          </small>
        </article>
      </section>

      <section className="transactions-toolbar">
        <div className="transactions-search">
          <Search size={15} />

          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(
                event.target.value
              );

              setPage(1);
            }}
            placeholder="Search by company or ticker"
          />
        </div>

        <div className="transactions-filter-wrap">
          <div className="transactions-filter-label">
            <Filter size={14} />
            Type
          </div>

          {(
            [
              "ALL",
              "BUY",
              "SELL",
            ] as const
          ).map((filter) => (
            <button
              type="button"
              key={filter}
              className={`transactions-filter-button ${
                typeFilter ===
                filter
                  ? `transactions-filter-button-active transactions-filter-${filter.toLowerCase()}`
                  : ""
              }`}
              onClick={() => {
                setTypeFilter(
                  filter
                );

                setPage(1);
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="transactions-table-panel">
        {paginatedTransactions.length ===
        0 ? (
          <div className="transactions-empty">
            <div className="transactions-empty-icon">
              <History size={25} />
            </div>

            <strong>
              No transactions found
            </strong>

            <span>
              {transactions.length === 0
                ? "Your completed trades will appear here."
                : "Try another ticker, company or filter."}
            </span>

            {transactions.length ===
              0 && (
              <Link to="/stocks">
                Start trading
                <ArrowUpRight
                  size={14}
                />
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="transactions-table-scroll">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>
                      Date and time
                    </th>
                    <th>Stock</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>
                      Total amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedTransactions.map(
                    (transaction) => {
                      const formattedDate =
                        formatDate(
                          transaction.timestamp
                        );

                      const isBuy =
                        transaction.type ===
                        "BUY";

                      return (
                        <tr
                          key={
                            transaction.id
                          }
                        >
                          <td>
                            <div className="transaction-date">
                              <strong>
                                {
                                  formattedDate.date
                                }
                              </strong>

                              <small>
                                {
                                  formattedDate.time
                                }
                              </small>
                            </div>
                          </td>

                          <td>
                            <Link
                              to={`/stocks/${transaction.stockId}`}
                              className="transaction-stock-link"
                            >
                              <span className="transaction-stock-logo">
                                {transaction.symbol.slice(
                                  0,
                                  2
                                )}
                              </span>

                              <span className="transaction-stock-copy">
                                <strong>
                                  {
                                    transaction.symbol
                                  }
                                </strong>

                                <small>
                                  {
                                    transaction.companyName
                                  }
                                </small>
                              </span>
                            </Link>
                          </td>

                          <td>
                            <span
                              className={`transaction-type-pill ${
                                isBuy
                                  ? "transaction-type-buy"
                                  : "transaction-type-sell"
                              }`}
                            >
                              {isBuy ? (
                                <TrendingUp
                                  size={12}
                                />
                              ) : (
                                <TrendingDown
                                  size={12}
                                />
                              )}

                              {
                                transaction.type
                              }
                            </span>
                          </td>

                          <td>
                            <span className="transaction-quantity sf-number">
                              {
                                transaction.quantity
                              }
                            </span>

                            <small className="transaction-unit">
                              shares
                            </small>
                          </td>

                          <td>
                            <span className="transaction-price sf-number">
                              $
                              {transaction.price.toFixed(
                                2
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`transaction-total sf-number ${
                                isBuy
                                  ? "negative"
                                  : "positive"
                              }`}
                            >
                              {isBuy
                                ? "-"
                                : "+"}
                              {formatCurrency(
                                transaction.totalAmount
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            <footer className="transactions-pagination">
              <span>
                Showing{" "}
                {(page - 1) *
                  PAGE_SIZE +
                  1}
                –
                {Math.min(
                  page *
                    PAGE_SIZE,
                  filteredTransactions.length
                )}{" "}
                of{" "}
                {
                  filteredTransactions.length
                }
              </span>

              <div>
                <button
                  type="button"
                  disabled={
                    page === 1
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current -
                            1
                        )
                    )
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft
                    size={14}
                  />
                </button>

                {visiblePages.map(
                  (pageNumber) => (
                    <button
                      type="button"
                      key={
                        pageNumber
                      }
                      className={
                        page ===
                        pageNumber
                          ? "transactions-page-button-active"
                          : ""
                      }
                      onClick={() =>
                        setPage(
                          pageNumber
                        )
                      }
                    >
                      {
                        pageNumber
                      }
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={
                    page ===
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.min(
                          totalPages,
                          current +
                            1
                        )
                    )
                  }
                  aria-label="Next page"
                >
                  <ChevronRight
                    size={14}
                  />
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}