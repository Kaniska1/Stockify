import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  BarChart3,
  Briefcase,
  History,
  LayoutDashboard,
  Search,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from "lucide-react";

import { useNavigate } from "react-router";

import { useApp } from "../context/AppContext";
import { STOCKS } from "../data/stocks";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const PAGES = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Markets",
    path: "/stocks",
    icon: TrendingUp,
  },
  {
    label: "Portfolio",
    path: "/portfolio",
    icon: Briefcase,
  },
  {
    label: "Transactions",
    path: "/transactions",
    icon: History,
  },
  {
    label: "Market Analysis",
    path: "/market",
    icon: BarChart3,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
  },
];

export default function CommandPalette({
  open,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { livePrices, liveChanges } = useApp();

  const normalizedQuery = query
    .trim()
    .toLowerCase();

  const stockResults = useMemo(() => {
    const stocks = normalizedQuery
      ? STOCKS.filter(
          (stock) =>
            stock.symbol
              .toLowerCase()
              .includes(normalizedQuery) ||
            stock.companyName
              .toLowerCase()
              .includes(normalizedQuery)
        )
      : STOCKS;

    return stocks.slice(0, 6);
  }, [normalizedQuery]);

  const pageResults = useMemo(
    () =>
      PAGES.filter(
        (page) =>
          !normalizedQuery ||
          page.label
            .toLowerCase()
            .includes(normalizedQuery)
      ),
    [normalizedQuery]
  );

  const allResults = useMemo(
    () => [
      ...stockResults.map((stock) => ({
        path: `/stocks/${stock.id}`,
      })),
      ...pageResults.map((page) => ({
        path: page.path,
      })),
    ],
    [stockResults, pageResults]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuery("");
    setSelected(0);

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyboard = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setSelected((current) =>
          Math.min(
            current + 1,
            allResults.length - 1
          )
        );
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setSelected((current) =>
          Math.max(current - 1, 0)
        );
      }

      if (event.key === "Enter") {
        const selectedResult =
          allResults[selected];

        if (selectedResult) {
          navigate(selectedResult.path);
          onClose();
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
  }, [
    open,
    selected,
    allResults,
    navigate,
    onClose,
  ]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="command-palette-overlay"
      onMouseDown={onClose}
    >
      <section
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Search Stockify"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="command-palette-header">
          <Search size={18} />

          <input
            ref={inputRef}
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search stocks, pages and tools..."
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </header>

        <div className="command-palette-results">
          {allResults.length === 0 && (
            <div className="command-palette-empty">
              <Search size={22} />

              <strong>
                No results found
              </strong>

              <span>
                Try a ticker symbol, company
                name or page.
              </span>
            </div>
          )}

          {stockResults.length > 0 && (
            <section className="command-palette-group">
              <span className="command-palette-label">
                STOCKS
              </span>

              {stockResults.map(
                (stock, index) => {
                  const currentPrice =
                    livePrices[stock.id] ??
                    stock.currentPrice;

                  const change =
                    liveChanges[stock.id] ?? {
                      change: stock.change,
                      changePercent:
                        stock.changePercent,
                    };

                  const positive =
                    change.changePercent >= 0;

                  return (
                    <button
                      type="button"
                      key={stock.id}
                      className={`command-palette-item ${
                        selected === index
                          ? "command-palette-item-active"
                          : ""
                      }`}
                      onClick={() => {
                        navigate(
                          `/stocks/${stock.id}`
                        );

                        onClose();
                      }}
                      onMouseEnter={() =>
                        setSelected(index)
                      }
                    >
                      <span
                        className="command-stock-logo"
                        style={{
                          color: stock.color,
                          borderColor: `${stock.color}28`,
                          background: `${stock.color}12`,
                        }}
                      >
                        {stock.symbol.slice(0, 2)}
                      </span>

                      <span className="command-item-copy">
                        <strong>
                          {stock.companyName}
                        </strong>

                        <small>
                          {stock.symbol} ·{" "}
                          {stock.sector}
                        </small>
                      </span>

                      <span className="command-stock-value">
                        <strong className="sf-number">
                          $
                          {currentPrice.toFixed(
                            2
                          )}
                        </strong>

                        <small
                          className={
                            positive
                              ? "positive"
                              : "negative"
                          }
                        >
                          {positive ? (
                            <TrendingUp
                              size={12}
                            />
                          ) : (
                            <TrendingDown
                              size={12}
                            />
                          )}

                          {positive ? "+" : ""}
                          {change.changePercent.toFixed(
                            2
                          )}
                          %
                        </small>
                      </span>
                    </button>
                  );
                }
              )}
            </section>
          )}

          {pageResults.length > 0 && (
            <section className="command-palette-group">
              <span className="command-palette-label">
                PAGES
              </span>

              {pageResults.map(
                (page, index) => {
                  const resultIndex =
                    stockResults.length +
                    index;

                  const Icon = page.icon;

                  return (
                    <button
                      type="button"
                      key={page.path}
                      className={`command-palette-item ${
                        selected === resultIndex
                          ? "command-palette-item-active"
                          : ""
                      }`}
                      onClick={() => {
                        navigate(page.path);
                        onClose();
                      }}
                      onMouseEnter={() =>
                        setSelected(
                          resultIndex
                        )
                      }
                    >
                      <span className="command-page-icon">
                        <Icon size={16} />
                      </span>

                      <span className="command-item-copy">
                        <strong>
                          {page.label}
                        </strong>

                        <small>
                          Open workspace
                        </small>
                      </span>

                      <ArrowRight
                        size={14}
                        className="command-item-arrow"
                      />
                    </button>
                  );
                }
              )}
            </section>
          )}
        </div>

        <footer className="command-palette-footer">
          <span>
            <kbd>↑↓</kbd>
            Navigate
          </span>

          <span>
            <kbd>Enter</kbd>
            Open
          </span>

          <span>
            <kbd>Esc</kbd>
            Close
          </span>
        </footer>
      </section>
    </div>
  );
}