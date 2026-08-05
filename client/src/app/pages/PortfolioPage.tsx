import { useMemo } from "react";
import { getStockLogo } from "../lib/getStockLogo";
import { Link } from "react-router";
import {
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
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

import { useApp } from "../context/AppContext";
import { STOCKS } from "../data/stocks";

const ALLOCATION_COLORS = [
  "#a855f7",
  "#8b5cf6",
  "#c084fc",
  "#6d5dfc",
  "#22c55e",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
];

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

export default function PortfolioPage() {
  const {
    livePrices,
    holdings,
    portfolioValue,
    totalInvested,
    totalPnl,
    walletBalance,
  } = useApp();

  const totalAccountValue =
    portfolioValue + walletBalance;

  const totalPnlPercent =
    totalInvested > 0
      ? (totalPnl / totalInvested) * 100
      : 0;

  const enrichedHoldings = useMemo(
    () =>
      holdings.map((holding, index) => {
        const currentPrice =
          livePrices[holding.stockId] ??
          holding.averageBuyPrice;

        const currentValue =
          currentPrice * holding.quantity;

        const investedValue =
          holding.averageBuyPrice *
          holding.quantity;

        const pnl =
          currentValue - investedValue;

        const pnlPercent =
          investedValue > 0
            ? (pnl / investedValue) * 100
            : 0;

        const stock = STOCKS.find(
          (item) =>
            item.id === holding.stockId
        );

        return {
          ...holding,
          stock,
          currentPrice,
          currentValue,
          investedValue,
          pnl,
          pnlPercent,
          color:
            ALLOCATION_COLORS[
              index %
                ALLOCATION_COLORS.length
            ],
        };
      }),
    [holdings, livePrices]
  );

  const allocationData = useMemo(
    () =>
      enrichedHoldings
        .map((holding) => ({
          name: holding.symbol,
          value: holding.currentValue,
          color: holding.color,
        }))
        .filter((item) => item.value > 0),
    [enrichedHoldings]
  );

  const growthData = useMemo(() => {
    if (holdings.length === 0) {
      return [];
    }

    const today = new Date();

    return Array.from(
      { length: 30 },
      (_, index) => {
        const daysAgo = 29 - index;
        const date = new Date(today);

        date.setDate(
          date.getDate() - daysAgo
        );

        const value = holdings.reduce(
          (sum, holding) => {
            const stock = STOCKS.find(
              (item) =>
                item.id === holding.stockId
            );

            if (!stock) {
              return sum;
            }

            const historyIndex = Math.max(
              0,
              stock.priceHistory.length -
                1 -
                daysAgo
            );

            const price =
              stock.priceHistory[
                historyIndex
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

        return {
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
        };
      }
    );
  }, [holdings, livePrices]);

  const bestHolding = useMemo(
    () =>
      enrichedHoldings.length > 0
        ? [...enrichedHoldings].sort(
            (first, second) =>
              second.pnlPercent -
              first.pnlPercent
          )[0]
        : null,
    [enrichedHoldings]
  );

  const largestHolding = useMemo(
    () =>
      enrichedHoldings.length > 0
        ? [...enrichedHoldings].sort(
            (first, second) =>
              second.currentValue -
              first.currentValue
          )[0]
        : null,
    [enrichedHoldings]
  );

  if (holdings.length === 0) {
    return (
      <div className="portfolio-page">
        <section className="portfolio-page-heading">
          <div>
            <span className="portfolio-page-eyebrow">
              YOUR INVESTMENTS
            </span>

            <h1>Portfolio</h1>

            <p>
              Track positions, allocation and
              portfolio performance.
            </p>
          </div>
        </section>

        <section className="portfolio-empty">
          <div className="portfolio-empty-icon">
            <Briefcase size={28} />
          </div>

          <span className="portfolio-empty-label">
            YOUR PORTFOLIO
          </span>

          <h2>
            Start building your portfolio
          </h2>

          <p>
            Explore live markets and make your
            first simulated investment to begin
            tracking performance.
          </p>

          <Link
            to="/stocks"
            className="portfolio-primary-action"
          >
            Explore markets
            <ArrowUpRight size={15} />
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      <section className="portfolio-page-heading">
        <div>
          <span className="portfolio-page-eyebrow">
            YOUR INVESTMENTS
          </span>

          <h1>Portfolio</h1>

          <p>
            Monitor performance, concentration
            and individual positions.
          </p>
        </div>

        <Link
          to="/portfolio-analyzer"
          className="portfolio-ai-button"
        >
          <Sparkles size={15} />
          Analyze with AI
        </Link>
      </section>

      <section className="portfolio-overview">
        <div className="portfolio-overview-primary">
          <span className="portfolio-overview-label">
            Total account value
          </span>

          <strong className="portfolio-overview-value sf-number">
            {formatCurrency(
              totalAccountValue
            )}
          </strong>

          <div className="portfolio-overview-return">
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
                <TrendingDown size={14} />
              )}

              {totalPnlPercent >= 0
                ? "+"
                : ""}
              {totalPnlPercent.toFixed(2)}%
            </span>

            <small>
              {totalPnl >= 0 ? "+" : ""}
              {formatCurrency(totalPnl)} total
              return
            </small>
          </div>

          <div className="portfolio-overview-actions">
            <Link to="/stocks">
              Add investment
              <ArrowUpRight size={14} />
            </Link>

            <Link to="/transactions">
              View transactions
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div className="portfolio-overview-chart">
          <div className="portfolio-chart-heading">
            <div>
              <span>PERFORMANCE</span>
              <h2>Portfolio value</h2>
            </div>

            <span>Last 30 days</span>
          </div>

          <ResponsiveContainer
            width="100%"
            height={230}
          >
            <AreaChart
              data={growthData}
              margin={{
                top: 10,
                right: 6,
                bottom: 0,
                left: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="portfolioPurpleGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#a855f7"
                    stopOpacity={0.4}
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
                  fill: "#665f70",
                  fontSize: 9,
                }}
                axisLine={false}
                tickLine={false}
                interval={6}
              />

              <YAxis
                tick={{
                  fill: "#665f70",
                  fontSize: 9,
                }}
                axisLine={false}
                tickLine={false}
                width={46}
                tickFormatter={(value) =>
                  `$${(
                    Number(value) / 1000
                  ).toFixed(0)}K`
                }
              />

              <Tooltip
                cursor={{
                  stroke:
                    "rgba(192,132,252,.25)",
                }}
                contentStyle={{
                  background: "#110d19",
                  border:
                    "1px solid rgba(255,255,255,.09)",
                  borderRadius: "12px",
                  color: "#f7f6fb",
                  fontSize: "10px",
                  boxShadow:
                    "0 18px 50px rgba(0,0,0,.38)",
                }}
                formatter={(value: number) => [
                  formatCurrency(value),
                  "Portfolio",
                ]}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#b66bff"
                strokeWidth={2.5}
                fill="url(#portfolioPurpleGradient)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="portfolio-stat-grid">
        <article>
          <span>
            <Briefcase size={15} />
            Invested value
          </span>

          <strong className="sf-number">
            {formatCurrency(totalInvested)}
          </strong>

          <small>
            Original cost basis
          </small>
        </article>

        <article>
          <span>
            <Wallet size={15} />
            Available cash
          </span>

          <strong className="sf-number">
            {formatCurrency(walletBalance)}
          </strong>

          <small>
            Ready to invest
          </small>
        </article>

        <article>
          <span>
            <TrendingUp size={15} />
            Best performer
          </span>

          <strong>
            {bestHolding?.symbol ?? "—"}
          </strong>

          <small
            className={
              (bestHolding?.pnlPercent ??
                0) >= 0
                ? "positive"
                : "negative"
            }
          >
            {bestHolding
              ? `${
                  bestHolding.pnlPercent >= 0
                    ? "+"
                    : ""
                }${bestHolding.pnlPercent.toFixed(
                  2
                )}%`
              : "No data"}
          </small>
        </article>

        <article>
          <span>
            <Briefcase size={15} />
            Largest position
          </span>

          <strong>
            {largestHolding?.symbol ?? "—"}
          </strong>

          <small>
            {largestHolding &&
            portfolioValue > 0
              ? `${(
                  (largestHolding.currentValue /
                    portfolioValue) *
                  100
                ).toFixed(1)}% of portfolio`
              : "No data"}
          </small>
        </article>
      </section>

      <section className="portfolio-content-grid">
        <article className="portfolio-panel">
          <div className="portfolio-panel-heading">
            <div>
              <span>ALLOCATION</span>
              <h2>Portfolio composition</h2>
            </div>

            <small>
              By current market value
            </small>
          </div>

          <div className="portfolio-allocation-layout">
            <div className="portfolio-allocation-chart">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={allocationData}
                    dataKey="value"
                    innerRadius={68}
                    outerRadius={94}
                    paddingAngle={3}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {allocationData.map(
                      (entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                        />
                      )
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="portfolio-allocation-center">
                <strong className="sf-number">
                  {holdings.length}
                </strong>
                <span>positions</span>
              </div>
            </div>

            <div className="portfolio-allocation-list">
              {allocationData.map(
                (item) => (
                  <div key={item.name}>
                    <span
                      className="portfolio-allocation-dot"
                      style={{
                        background:
                          item.color,
                      }}
                    />

                    <span>{item.name}</span>

                    <strong className="sf-number">
                      {portfolioValue > 0
                        ? (
                            (item.value /
                              portfolioValue) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </strong>
                  </div>
                )
              )}
            </div>
          </div>
        </article>

        <article className="portfolio-panel portfolio-insight-panel">
          <div className="portfolio-panel-heading">
            <div>
              <span>PORTFOLIO INSIGHT</span>
              <h2>Current structure</h2>
            </div>
          </div>

          <div className="portfolio-insight-list">
            <div>
              <span>
                Equity allocation
              </span>

              <strong className="sf-number">
                {totalAccountValue > 0
                  ? (
                      (portfolioValue /
                        totalAccountValue) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </strong>
            </div>

            <div>
              <span>Cash allocation</span>

              <strong className="sf-number">
                {totalAccountValue > 0
                  ? (
                      (walletBalance /
                        totalAccountValue) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </strong>
            </div>

            <div>
              <span>Number of holdings</span>

              <strong className="sf-number">
                {holdings.length}
              </strong>
            </div>

            <div>
              <span>
                Largest concentration
              </span>

              <strong className="sf-number">
                {largestHolding &&
                portfolioValue > 0
                  ? `${(
                      (largestHolding.currentValue /
                        portfolioValue) *
                      100
                    ).toFixed(1)}%`
                  : "0.0%"}
              </strong>
            </div>
          </div>

          <Link
            to="/portfolio-analyzer"
            className="portfolio-insight-action"
          >
            <Sparkles size={14} />
            Generate complete AI analysis
          </Link>
        </article>
      </section>

      <section className="portfolio-holdings-panel">
        <div className="portfolio-holdings-heading">
          <div>
            <span>YOUR POSITIONS</span>
            <h2>Holdings</h2>
          </div>

          <strong>
            {holdings.length}{" "}
            {holdings.length === 1
              ? "position"
              : "positions"}
          </strong>
        </div>

        <div className="portfolio-table-scroll">
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Quantity</th>
                <th>Average price</th>
                <th>Current price</th>
                <th>Invested</th>
                <th>Current value</th>
                <th>P&amp;L</th>
                <th>Return</th>
              </tr>
            </thead>

            <tbody>
              {enrichedHoldings.map(
                (holding) => (
                  <tr key={holding.stockId}>
                    <td>
                      <Link
                        to={`/stocks/${holding.stockId}`}
                        className="portfolio-stock-link"
                      >
                        <span className="portfolio-stock-logo">
                          {holding.symbol.slice(
                            0,
                            2
                          )}
                        </span>

                        <span className="portfolio-stock-copy">
                          <strong>
                            {holding.symbol}
                          </strong>

                          <small>
                            {
                              holding.companyName
                            }
                          </small>
                        </span>
                      </Link>
                    </td>

                    <td>
                      <span className="portfolio-table-value sf-number">
                        {holding.quantity}
                      </span>
                    </td>

                    <td>
                      <span className="portfolio-table-muted sf-number">
                        $
                        {holding.averageBuyPrice.toFixed(
                          2
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="portfolio-table-value sf-number">
                        $
                        {holding.currentPrice.toFixed(
                          2
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="portfolio-table-muted sf-number">
                        {formatCurrency(
                          holding.investedValue
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="portfolio-table-value sf-number">
                        {formatCurrency(
                          holding.currentValue
                        )}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`portfolio-pnl ${
                          holding.pnl >= 0
                            ? "positive"
                            : "negative"
                        }`}
                      >
                        {holding.pnl >= 0 ? (
                          <TrendingUp
                            size={13}
                          />
                        ) : (
                          <TrendingDown
                            size={13}
                          />
                        )}

                        <span className="sf-number">
                          {holding.pnl >= 0
                            ? "+"
                            : ""}
                          {formatCurrency(
                            holding.pnl
                          )}
                        </span>
                      </span>
                    </td>

                    <td>
                      <span
                        className={`portfolio-return-pill ${
                          holding.pnlPercent >= 0
                            ? "portfolio-return-positive"
                            : "portfolio-return-negative"
                        }`}
                      >
                        {holding.pnlPercent >=
                        0
                          ? "+"
                          : ""}
                        {holding.pnlPercent.toFixed(
                          2
                        )}
                        %
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}