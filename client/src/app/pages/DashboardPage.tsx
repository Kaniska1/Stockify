import { useMemo } from "react";
import { Link } from "react-router";
import { getStockLogo } from "../lib/getStockLogo";
import {
  ArrowUpRight,
  Bot,
  Briefcase,
  ChevronRight,
  Clock3,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { STOCKS } from "../data/stocks";

function formatCurrency(value: number): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  if (absolute >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }

  return `$${value.toFixed(2)}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

const ALLOCATION_COLORS = [
  "#a855f7",
  "#8b5cf6",
  "#c084fc",
  "#6d5dfc",
  "#22c55e",
  "#06b6d4",
  "#f59e0b",
];

export default function DashboardPage() {
  const { user } = useAuth();

  const {
    livePrices,
    liveChanges,
    walletBalance,
    holdings,
    transactions,
    portfolioValue,
    totalInvested,
    dayPnl,
    totalPnl,
  } = useApp();

  const totalValue =
    portfolioValue + walletBalance;

  const totalReturn =
    totalInvested > 0
      ? (totalPnl / totalInvested) * 100
      : 0;

  const sortedStocks = useMemo(
    () =>
      [...STOCKS].sort(
        (first, second) =>
          (
            liveChanges[second.id]
              ?.changePercent ??
            second.changePercent
          ) -
          (
            liveChanges[first.id]
              ?.changePercent ??
            first.changePercent
          )
      ),
    [liveChanges]
  );

  const marketMovers =
    sortedStocks.slice(0, 5);

  const recentTransactions =
    transactions.slice(0, 5);

  const chartData = useMemo(() => {
    if (holdings.length === 0) {
      return [];
    }

    const today = new Date();
    const points = [];

    for (
      let index = 29;
      index >= 0;
      index -= 1
    ) {
      const date = new Date(today);

      date.setDate(
        date.getDate() - index
      );

      const value = holdings.reduce(
        (sum, holding) => {
          const stock = STOCKS.find(
            item =>
              item.id ===
              holding.stockId
          );

          if (!stock) {
            return sum;
          }

          const historicalIndex =
            Math.max(
              0,
              stock.priceHistory.length -
                1 -
                index
            );

          const price =
            stock.priceHistory[
              historicalIndex
            ]?.price ??
            livePrices[
              holding.stockId
            ] ??
            stock.currentPrice;

          return (
            sum +
            holding.quantity * price
          );
        },
        0
      );

      points.push({
        date: date.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        ),
        value: Number(
          value.toFixed(2)
        ),
      });
    }

    return points;
  }, [holdings, livePrices]);

  const allocation = useMemo(
    () =>
      holdings
        .map(
          (
            holding,
            index
          ) => ({
            name: holding.symbol,

            value:
              holding.quantity *
              (
                livePrices[
                  holding.stockId
                ] ?? 0
              ),

            color:
              ALLOCATION_COLORS[
                index %
                  ALLOCATION_COLORS.length
              ],
          })
        )
        .filter(
          item => item.value > 0
        ),
    [holdings, livePrices]
  );

  const firstName =
    user?.name?.split(" ")[0] ??
    "Investor";

  return (
    <div className="dashboard-v2">
      <section className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">
            LIVE PORTFOLIO OVERVIEW
          </span>

          <h1>
            Hello, {firstName}!
          </h1>

          <p>
            Your market, portfolio and AI
            research workspace.
          </p>
        </div>

        <Link
          to="/stocks"
          className="dashboard-trade-button"
        >
          Explore markets

          <ArrowUpRight size={16} />
        </Link>
      </section>

      <section className="portfolio-hero-panel">
        <div className="portfolio-hero-copy">
          <span className="portfolio-hero-label">
            Total account value
          </span>

          <div className="portfolio-hero-value sf-number">
            {formatCurrency(totalValue)}
          </div>

          <div className="portfolio-hero-meta">
            <span
              className={
                totalPnl >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {totalPnl >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown
                  size={14}
                />
              )}

              {totalReturn >= 0
                ? "+"
                : ""}

              {totalReturn.toFixed(2)}%
            </span>

            <span>
              {formatCurrency(
                totalPnl
              )}{" "}
              all time
            </span>
          </div>

          <div className="portfolio-hero-actions">
            <Link to="/portfolio">
              View portfolio

              <ChevronRight
                size={14}
              />
            </Link>

            <Link to="/portfolio-analyzer">
              Analyze with AI

              <Sparkles size={14} />
            </Link>
          </div>
        </div>

        <div className="portfolio-hero-chart">
          {chartData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="dashboardPurple"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#a855f7"
                      stopOpacity={0.42}
                    />

                    <stop
                      offset="100%"
                      stopColor="#a855f7"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="rgba(255,255,255,.045)"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tick={{
                    fill: "#6f6878",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={6}
                />

                <YAxis
                  hide
                  domain={[
                    "dataMin",
                    "dataMax",
                  ]}
                />

                <Tooltip
                  cursor={{
                    stroke:
                      "rgba(192,132,252,.28)",
                  }}
                  contentStyle={{
                    background:
                      "#110d19",

                    border:
                      "1px solid rgba(255,255,255,.09)",

                    borderRadius:
                      "12px",

                    color:
                      "#f7f6fb",

                    fontSize:
                      "11px",

                    boxShadow:
                      "0 18px 50px rgba(0,0,0,.38)",
                  }}
                  formatter={(
                    value: number
                  ) => [
                    formatCurrency(
                      value
                    ),
                    "Portfolio",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#b66bff"
                  strokeWidth={2.5}
                  fill="url(#dashboardPurple)"
                  dot={false}
                  isAnimationActive={
                    false
                  }
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="dashboard-empty-chart">
              <TrendingUp size={30} />

              <strong>
                Your performance chart
                starts here
              </strong>

              <span>
                Buy your first stock to
                begin tracking growth.
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-metrics">
        <article>
          <span className="metric-label">
            Invested value
          </span>

          <strong className="sf-number">
            {formatCurrency(
              portfolioValue
            )}
          </strong>

          <small>
            {holdings.length} active{" "}
            {holdings.length === 1
              ? "position"
              : "positions"}
          </small>
        </article>

        <article>
          <span className="metric-label">
            Available cash
          </span>

          <strong className="sf-number">
            {formatCurrency(
              walletBalance
            )}
          </strong>

          <small>
            Ready for your next trade
          </small>
        </article>

        <article>
          <span className="metric-label">
            Today&apos;s P&amp;L
          </span>

          <strong
            className={`sf-number ${
              dayPnl >= 0
                ? "positive"
                : "negative"
            }`}
          >
            {dayPnl >= 0
              ? "+"
              : ""}

            {formatCurrency(dayPnl)}
          </strong>

          <small>
            Based on live market quotes
          </small>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel dashboard-panel-wide">
          <div className="panel-heading">
            <div>
              <span>
                Market pulse
              </span>

              <h2>
                Today&apos;s leaders
              </h2>
            </div>

            <Link to="/stocks">
              View markets

              <ChevronRight
                size={14}
              />
            </Link>
          </div>

          <div className="market-movers-list">
            {marketMovers.map(
              stock => {
                const price =
                  livePrices[
                    stock.id
                  ] ??
                  stock.currentPrice;

                const change =
                  liveChanges[
                    stock.id
                  ] ?? {
                    changePercent:
                      stock.changePercent,

                    change:
                      stock.change,
                  };

                const logo = getStockLogo(
                  stock.symbol
                );

                return (
                  <Link
                    to={`/stocks/${stock.id}`}
                    className="market-mover-row"
                    key={stock.id}
                  >
                    <span className="market-mover-logo">
                      {logo ? (
                        <svg
                          viewBox="0 0 24 24"
                          dangerouslySetInnerHTML={{
                            __html: logo.path,
                          }}
                        />
                      ) : (
                        stock.symbol[0]
                      )}
                    </span>

                    <span className="market-mover-company">
                      <strong>
                        {stock.symbol}
                      </strong>

                      <small>
                        {
                          stock.companyName
                        }
                      </small>
                    </span>

                    <span className="market-mover-price sf-number">
                      ${price.toFixed(2)}
                    </span>

                    <span
                      className={
                        change.changePercent >=
                        0
                          ? "market-mover-change positive"
                          : "market-mover-change negative"
                      }
                    >
                      {change.changePercent >=
                      0
                        ? "+"
                        : ""}

                      {change.changePercent.toFixed(
                        2
                      )}
                      %
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span>
                Allocation
              </span>

              <h2>
                Portfolio mix
              </h2>
            </div>
          </div>

          {allocation.length > 0 ? (
            <>
              <div className="allocation-chart">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={allocation}
                      dataKey="value"
                      innerRadius={58}
                      outerRadius={78}
                      paddingAngle={3}
                      stroke="none"
                      isAnimationActive={
                        false
                      }
                    >
                      {allocation.map(
                        entry => (
                          <Cell
                            key={
                              entry.name
                            }
                            fill={
                              entry.color
                            }
                          />
                        )
                      )}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="allocation-center">
                  <strong>
                    {holdings.length}
                  </strong>

                  <span>
                    positions
                  </span>
                </div>
              </div>

              <div className="allocation-list">
                {allocation
                  .slice(0, 5)
                  .map(item => (
                    <div
                      key={item.name}
                    >
                      <span
                        className="allocation-dot"
                        style={{
                          background:
                            item.color,
                        }}
                      />

                      <span>
                        {item.name}
                      </span>

                      <strong className="sf-number">
                        {portfolioValue >
                        0
                          ? (
                              (
                                item.value /
                                portfolioValue
                              ) *
                              100
                            ).toFixed(
                              1
                            )
                          : "0.0"}
                        %
                      </strong>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="panel-empty-state">
              <Briefcase size={25} />

              <strong>
                No holdings yet
              </strong>

              <span>
                Your allocation will
                appear after your first
                trade.
              </span>
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span>
                Activity
              </span>

              <h2>
                Recent trades
              </h2>
            </div>

            <Link to="/transactions">
              View all

              <ChevronRight
                size={14}
              />
            </Link>
          </div>

          {recentTransactions.length >
          0 ? (
            <div className="recent-trades-list">
              {recentTransactions.map(
                transaction => (
                  <div
                    className="recent-trade-row"
                    key={
                      transaction.id
                    }
                  >
                    <span
                      className={`trade-direction ${
                        transaction.type ===
                        "BUY"
                          ? "trade-buy"
                          : "trade-sell"
                      }`}
                    >
                      {transaction.type ===
                      "BUY" ? (
                        <TrendingUp
                          size={14}
                        />
                      ) : (
                        <TrendingDown
                          size={14}
                        />
                      )}
                    </span>

                    <span className="recent-trade-copy">
                      <strong>
                        {
                          transaction.symbol
                        }
                      </strong>

                      <small>
                        {
                          transaction.quantity
                        }{" "}
                        shares ·{" "}
                        {formatDate(
                          transaction.timestamp
                        )}
                      </small>
                    </span>

                    <span
                      className={`recent-trade-value sf-number ${
                        transaction.type ===
                        "BUY"
                          ? "negative"
                          : "positive"
                      }`}
                    >
                      {transaction.type ===
                      "BUY"
                        ? "-"
                        : "+"}

                      {formatCurrency(
                        transaction.totalAmount
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="panel-empty-state">
              <Clock3 size={25} />

              <strong>
                No activity yet
              </strong>

              <span>
                Your trades will appear
                here.
              </span>
            </div>
          )}
        </article>

        <article className="dashboard-ai-panel">
          <div className="dashboard-ai-icon">
            <Bot size={20} />
          </div>

          <div>
            <span className="dashboard-ai-label">
              STOCKIFY AI
            </span>

            <h2>
              Turn portfolio data into
              clearer decisions.
            </h2>

            <p>
              Review concentration, cash
              utilization and risk with a
              personalized AI analysis.
            </p>
          </div>

          <Link to="/portfolio-analyzer">
            Analyze portfolio

            <ArrowUpRight size={15} />
          </Link>
        </article>
      </section>
    </div>
  );
}