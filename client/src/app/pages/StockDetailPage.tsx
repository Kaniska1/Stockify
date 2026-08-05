import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { getStockLogo } from "../lib/getStockLogo";
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Check,
  Minus,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import { Link, useParams } from "react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { useApp } from "../context/AppContext";
import { STOCKS_MAP } from "../data/stocks";

const PERIODS = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 60 },
  { label: "6M", days: 75 },
  { label: "1Y", days: 90 },
] as const;

type PeriodLabel =
  (typeof PERIODS)[number]["label"];

type TradeType = "BUY" | "SELL";

function formatCurrency(value: number): string {
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

function formatMarketCap(
  value: number
): string {
  if (value >= 1000) {
    return `$${(
      value / 1000
    ).toFixed(2)}T`;
  }

  return `$${value.toFixed(0)}B`;
}

interface TradeModalProps {
  type: TradeType;
  stockId: string;
  onClose: () => void;
}

function TradeModal({
  type,
  stockId,
  onClose,
}: TradeModalProps) {
  const {
    livePrices,
    walletBalance,
    getHolding,
    buyStock,
    sellStock,
  } = useApp();

  const [quantityInput, setQuantityInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const stock = STOCKS_MAP[stockId];

  const currentPrice =
    livePrices[stockId] ??
    stock?.currentPrice ??
    0;

  const holding = getHolding(stockId);

  const quantity = Number.parseInt(
    quantityInput,
    10
  );

  const validQuantity =
    Number.isFinite(quantity) &&
    quantity > 0
      ? quantity
      : 0;

  const total =
    currentPrice * validQuantity;

  const isBuy = type === "BUY";

  const canBuy =
    isBuy &&
    validQuantity > 0 &&
    total <= walletBalance;

  const canSell =
    !isBuy &&
    validQuantity > 0 &&
    validQuantity <=
      (holding?.quantity ?? 0);

  const canSubmit =
    isBuy ? canBuy : canSell;

  if (!stock) {
    return null;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!canSubmit || loading) {
      return;
    }

    setLoading(true);

    try {
      if (isBuy) {
        await buyStock(
          stockId,
          validQuantity
        );
      } else {
        await sellStock(
          stockId,
          validQuantity
        );
      }

      setSuccess(true);

      toast.success(
        `${
          isBuy ? "Bought" : "Sold"
        } ${validQuantity} ${
          validQuantity === 1
            ? "share"
            : "shares"
        } of ${stock.symbol}`
      );

      window.setTimeout(
        onClose,
        1200
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The order could not be completed"
      );
    } finally {
      setLoading(false);
    }
  };

  const errorMessage =
    validQuantity <= 0
      ? ""
      : isBuy &&
          total > walletBalance
        ? "Your wallet does not contain enough funds for this order."
        : !isBuy &&
            validQuantity >
              (holding?.quantity ?? 0)
          ? `You currently own ${
              holding?.quantity ?? 0
            } shares.`
          : "";

  return (
    <div
      className="stock-trade-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={`stock-trade-modal ${
          isBuy
            ? "stock-trade-buy"
            : "stock-trade-sell"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`${type} ${stock.symbol}`}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="stock-trade-header">
          <div className="stock-trade-company">
            <span>
              {stock.symbol.slice(0, 2)}
            </span>

            <div>
              <small>
                {isBuy
                  ? "BUY ORDER"
                  : "SELL ORDER"}
              </small>

              <h2>
                {type} {stock.symbol}
              </h2>

              <p>{stock.companyName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close trade window"
          >
            <X size={17} />
          </button>
        </header>

        {success ? (
          <div className="stock-trade-success">
            <span>
              <Check size={25} />
            </span>

            <h3>Order executed</h3>

            <p>
              Your portfolio and wallet have
              been updated.
            </p>
          </div>
        ) : (
          <form
            className="stock-trade-form"
            onSubmit={handleSubmit}
          >
            <div className="stock-trade-summary">
              <div>
                <span>Current price</span>

                <strong className="sf-number">
                  $
                  {currentPrice.toFixed(
                    2
                  )}
                </strong>
              </div>

              <div>
                <span>
                  {isBuy
                    ? "Available cash"
                    : "Shares owned"}
                </span>

                <strong className="sf-number">
                  {isBuy
                    ? formatCurrency(
                        walletBalance
                      )
                    : holding?.quantity ??
                      0}
                </strong>
              </div>
            </div>

            <label className="stock-trade-field">
              <span>Number of shares</span>

              <input
                type="number"
                min="1"
                step="1"
                value={quantityInput}
                onChange={(event) =>
                  setQuantityInput(
                    event.target.value
                  )
                }
                placeholder="Enter quantity"
                autoFocus
              />
            </label>

            <div className="stock-trade-total">
              <span>
                Estimated order value
              </span>

              <strong className="sf-number">
                {formatCurrency(total)}
              </strong>
            </div>

            {errorMessage && (
              <div className="stock-trade-error">
                <AlertCircle size={14} />

                <span>
                  {errorMessage}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="stock-trade-submit"
              disabled={
                !canSubmit || loading
              }
            >
              {loading ? (
                <span className="stock-trade-spinner" />
              ) : (
                <>
                  {isBuy ? (
                    <ShoppingCart
                      size={15}
                    />
                  ) : (
                    <Minus size={15} />
                  )}

                  {type}{" "}
                  {validQuantity > 0
                    ? `${validQuantity} ${
                        validQuantity === 1
                          ? "share"
                          : "shares"
                      }`
                    : "shares"}
                </>
              )}
            </button>

            <p className="stock-trade-note">
              Stockify trades are simulated
              and do not involve real money or
              exchange execution.
            </p>
          </form>
        )}
      </section>
    </div>
  );
}

export default function StockDetailPage() {
  const { id } = useParams<{
    id: string;
  }>();

  const {
    livePrices,
    liveChanges,
    getHolding,
    isInWatchlist,
    toggleWatchlist,
  } = useApp();

  const [period, setPeriod] =
    useState<PeriodLabel>("1M");

  const [tradeType, setTradeType] =
    useState<TradeType | null>(null);

  const [watchlistLoading, setWatchlistLoading] =
    useState(false);

  const stock =
    id ? STOCKS_MAP[id] : undefined;

  const selectedDays =
    PERIODS.find(
      (item) => item.label === period
    )?.days ?? 30;

  const chartData = useMemo(() => {
    if (!stock) {
      return [];
    }

    return stock.priceHistory
      .slice(-selectedDays)
      .map((point) => ({
        date: new Date(
          point.date
        ).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        ),
        price: point.price,
      }));
  }, [stock, selectedDays]);

  if (!stock) {
    return (
      <div className="stock-detail-not-found">
        <span>404</span>

        <h1>Stock not found</h1>

        <p>
          The selected market instrument does
          not exist in Stockify.
        </p>

        <Link to="/stocks">
          <ArrowLeft size={14} />
          Return to markets
        </Link>
      </div>
    );
  }

  const currentPrice =
    livePrices[stock.id] ??
    stock.currentPrice;

  const liveChange =
    liveChanges[stock.id] ?? {
      change: stock.change,
      changePercent:
        stock.changePercent,
    };

  const positive =
    liveChange.changePercent >= 0;

  const holding =
    getHolding(stock.id);

  const watched =
    isInWatchlist(stock.id);

  const investedValue = holding
    ? holding.quantity *
      holding.averageBuyPrice
    : 0;

  const currentHoldingValue = holding
    ? holding.quantity * currentPrice
    : 0;

  const holdingPnl =
    currentHoldingValue -
    investedValue;

  const holdingReturn =
    investedValue > 0
      ? (holdingPnl /
          investedValue) *
        100
      : 0;

  const chartPrices =
    chartData.map(
      (point) => point.price
    );

  const chartMinimum =
    chartPrices.length > 0
      ? Math.min(...chartPrices)
      : currentPrice;

  const chartMaximum =
    chartPrices.length > 0
      ? Math.max(...chartPrices)
      : currentPrice;

  const chartPadding = Math.max(
    (chartMaximum - chartMinimum) *
      0.15,
    2
  );

  const handleWatchlist = async () => {
    setWatchlistLoading(true);

    try {
      await toggleWatchlist(
        stock.id
      );

      toast.success(
        watched
          ? `${stock.symbol} removed from watchlist`
          : `${stock.symbol} added to watchlist`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update watchlist"
      );
    } finally {
      setWatchlistLoading(false);
    }
  };

  const marketStats = [
    {
      label: "Day high",
      value: `$${stock.dailyHigh.toFixed(
        2
      )}`,
    },
    {
      label: "Day low",
      value: `$${stock.dailyLow.toFixed(
        2
      )}`,
    },
    {
      label: "Open",
      value: `$${stock.openingPrice.toFixed(
        2
      )}`,
    },
    {
      label: "Previous close",
      value: `$${stock.previousClose.toFixed(
        2
      )}`,
    },
    {
      label: "Volume",
      value: `${stock.volume.toFixed(
        1
      )}M`,
    },
    {
      label: "Market cap",
      value: formatMarketCap(
        stock.marketCap
      ),
    },
  ];

  return (
    <div className="stock-detail-page">
      <Link
        to="/stocks"
        className="stock-detail-back"
      >
        <ArrowLeft size={14} />
        Markets
      </Link>

      <section className="stock-detail-header">
        <div className="stock-detail-identity">
          <span
            className="stock-detail-logo"
            style={{
              color: stock.color,
              borderColor: `${stock.color}35`,
              background: `${stock.color}12`,
            }}
          >
            {stock.symbol.slice(0, 2)}
          </span>

          <div>
            <span className="stock-detail-symbol">
              {stock.symbol}
            </span>

            <h1>
              {stock.companyName}
            </h1>

            <div className="stock-detail-meta">
              <span>{stock.sector}</span>

              <i />

              <span>
                US Equity
              </span>
            </div>
          </div>
        </div>

        <div className="stock-detail-actions">
          <button
            type="button"
            className="stock-detail-buy-button"
            onClick={() =>
              setTradeType("BUY")
            }
          >
            <ShoppingCart size={15} />
            Buy
          </button>

          {holding &&
            holding.quantity > 0 && (
              <button
                type="button"
                className="stock-detail-sell-button"
                onClick={() =>
                  setTradeType("SELL")
                }
              >
                <Minus size={15} />
                Sell
              </button>
            )}

          <button
            type="button"
            className={`stock-detail-watch-button ${
              watched
                ? "stock-detail-watch-active"
                : ""
            }`}
            onClick={() =>
              void handleWatchlist()
            }
            disabled={
              watchlistLoading
            }
          >
            {watched ? (
              <BookmarkCheck
                size={15}
              />
            ) : (
              <Bookmark size={15} />
            )}

            {watched
              ? "Watching"
              : "Watchlist"}
          </button>
        </div>
      </section>

      <section className="stock-detail-overview">
        <article className="stock-price-panel">
          <div className="stock-price-heading">
            <div>
              <span>LIVE MARKET PRICE</span>

              <strong className="sf-number">
                $
                {currentPrice.toFixed(
                  2
                )}
              </strong>

              <div
                className={
                  positive
                    ? "positive"
                    : "negative"
                }
              >
                {positive ? (
                  <TrendingUp
                    size={14}
                  />
                ) : (
                  <TrendingDown
                    size={14}
                  />
                )}

                <span className="sf-number">
                  {positive ? "+" : ""}
                  {liveChange.change.toFixed(
                    2
                  )}
                </span>

                <span className="sf-number">
                  (
                  {positive ? "+" : ""}
                  {liveChange.changePercent.toFixed(
                    2
                  )}
                  %)
                </span>

                <small>Today</small>
              </div>
            </div>

            <div className="stock-period-selector">
              {PERIODS.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className={
                    period === item.label
                      ? "stock-period-active"
                      : ""
                  }
                  onClick={() =>
                    setPeriod(
                      item.label
                    )
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="stock-price-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={chartData}
                margin={{
                  top: 12,
                  right: 8,
                  bottom: 0,
                  left: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="stockDetailGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={
                        positive
                          ? "#22c55e"
                          : "#ef4444"
                      }
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="100%"
                      stopColor={
                        positive
                          ? "#22c55e"
                          : "#ef4444"
                      }
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,.045)"
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={35}
                  tick={{
                    fill: "#665f70",
                    fontSize: 9,
                  }}
                />

                <YAxis
                  domain={[
                    chartMinimum -
                      chartPadding,
                    chartMaximum +
                      chartPadding,
                  ]}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tick={{
                    fill: "#665f70",
                    fontSize: 9,
                  }}
                  tickFormatter={(
                    value
                  ) =>
                    `$${Number(
                      value
                    ).toFixed(0)}`
                  }
                />

                <Tooltip
                  cursor={{
                    stroke:
                      "rgba(192,132,252,.22)",
                  }}
                  contentStyle={{
                    background:
                      "#110d19",
                    border:
                      "1px solid rgba(255,255,255,.09)",
                    borderRadius:
                      "12px",
                    color: "#f7f6fb",
                    fontSize: "10px",
                    boxShadow:
                      "0 18px 50px rgba(0,0,0,.38)",
                  }}
                  formatter={(
                    value: number
                  ) => [
                    `$${value.toFixed(
                      2
                    )}`,
                    "Price",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={
                    positive
                      ? "#22c55e"
                      : "#ef4444"
                  }
                  strokeWidth={2.4}
                  fill="url(#stockDetailGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                  }}
                  isAnimationActive={
                    false
                  }
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <footer className="stock-chart-footer">
            <span>
              Historical series shown for
              educational analysis.
            </span>

            <span>
              Live quote source may differ
              from chart history.
            </span>
          </footer>
        </article>

        <aside className="stock-summary-panel">
          <div className="stock-summary-heading">
            <span>MARKET SNAPSHOT</span>
            <h2>Key statistics</h2>
          </div>

          <div className="stock-stat-list">
            {marketStats.map(
              (stat) => (
                <div key={stat.label}>
                  <span>
                    {stat.label}
                  </span>

                  <strong className="sf-number">
                    {stat.value}
                  </strong>
                </div>
              )
            )}
          </div>

          <div className="stock-range-section">
            <div>
              <span>Day range</span>

              <small className="sf-number">
                $
                {stock.dailyLow.toFixed(
                  2
                )}{" "}
                — $
                {stock.dailyHigh.toFixed(
                  2
                )}
              </small>
            </div>

            <div className="stock-range-track">
              <span
                style={{
                  left: `${Math.max(
                    0,
                    Math.min(
                      100,
                      ((currentPrice -
                        stock.dailyLow) /
                        Math.max(
                          stock.dailyHigh -
                            stock.dailyLow,
                          0.01
                        )) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        </aside>
      </section>

      <section className="stock-detail-lower-grid">
        <article className="stock-position-panel">
          <div className="stock-summary-heading">
            <span>YOUR POSITION</span>
            <h2>
              {holding &&
              holding.quantity > 0
                ? "Current holding"
                : "No open position"}
            </h2>
          </div>

          {holding &&
          holding.quantity > 0 ? (
            <>
              <div className="stock-position-grid">
                <div>
                  <span>Shares owned</span>

                  <strong className="sf-number">
                    {holding.quantity}
                  </strong>
                </div>

                <div>
                  <span>
                    Average buy price
                  </span>

                  <strong className="sf-number">
                    $
                    {holding.averageBuyPrice.toFixed(
                      2
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Current value
                  </span>

                  <strong className="sf-number">
                    {formatCurrency(
                      currentHoldingValue
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Unrealized return
                  </span>

                  <strong
                    className={`sf-number ${
                      holdingPnl >= 0
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    {holdingPnl >= 0
                      ? "+"
                      : ""}
                    {formatCurrency(
                      holdingPnl
                    )}
                    <small>
                      {" "}
                      (
                      {holdingReturn >= 0
                        ? "+"
                        : ""}
                      {holdingReturn.toFixed(
                        2
                      )}
                      %)
                    </small>
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setTradeType("SELL")
                }
                className="stock-position-action"
              >
                <Minus size={14} />
                Reduce position
              </button>
            </>
          ) : (
            <div className="stock-position-empty">
              <Wallet size={23} />

              <p>
                Buy shares to begin tracking
                your position and unrealized
                return.
              </p>

              <button
                type="button"
                onClick={() =>
                  setTradeType("BUY")
                }
              >
                <ShoppingCart
                  size={14}
                />
                Open a position
              </button>
            </div>
          )}
        </article>

        <article className="stock-about-panel">
          <div className="stock-summary-heading">
            <span>COMPANY PROFILE</span>
            <h2>About {stock.symbol}</h2>
          </div>

          <p>
            {stock.companyName} is listed in
            Stockify under the{" "}
            <strong>{stock.sector}</strong>{" "}
            sector. The current page combines
            live quote data with the simulated
            historical dataset used throughout
            the application.
          </p>

          <div className="stock-about-notice">
            <AlertCircle size={14} />

            <span>
              Stockify does not currently
              provide verified company
              fundamentals, earnings,
              analyst ratings or investment
              recommendations.
            </span>
          </div>
        </article>
      </section>

      {tradeType && (
        <TradeModal
          type={tradeType}
          stockId={stock.id}
          onClose={() =>
            setTradeType(null)
          }
        />
      )}
    </div>
  );
}