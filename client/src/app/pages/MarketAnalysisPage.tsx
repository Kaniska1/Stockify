import { useMemo } from "react";
import { Link } from "react-router";
import { getStockLogo } from "../lib/getStockLogo";

import {
  Activity,
  ArrowUpRight,
  BarChart2,
  ChevronRight,
  Radar,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar as RechartsRadar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { STOCKS, SECTORS } from "../data/stocks";
import { useApp } from "../context/AppContext";

function formatVolume(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}B`;
  }

  return `${value.toFixed(0)}M`;
}

export default function MarketAnalysisPage() {
  const { livePrices, liveChanges } = useApp();

  const stocksWithLiveData = useMemo(
    () =>
      STOCKS.map((stock) => ({
        ...stock,

        livePrice:
          livePrices[stock.id] ??
          stock.currentPrice,

        liveChange:
          liveChanges[stock.id] ?? {
            change: stock.change,
            changePercent:
              stock.changePercent,
          },
      })),
    [livePrices, liveChanges]
  );

  const sortedStocks = useMemo(
    () =>
      [...stocksWithLiveData].sort(
        (first, second) =>
          second.liveChange.changePercent -
          first.liveChange.changePercent
      ),
    [stocksWithLiveData]
  );

  const gainers = sortedStocks.slice(0, 6);

  const losers = sortedStocks
    .slice(-6)
    .reverse();

  const advancing = stocksWithLiveData.filter(
    (stock) =>
      stock.liveChange.changePercent >= 0
  ).length;

  const declining =
    stocksWithLiveData.length - advancing;

  const unchanged = stocksWithLiveData.filter(
    (stock) =>
      stock.liveChange.changePercent === 0
  ).length;

  const advancingPercent =
    STOCKS.length > 0
      ? (advancing / STOCKS.length) * 100
      : 0;

  const decliningPercent =
    STOCKS.length > 0
      ? (declining / STOCKS.length) * 100
      : 0;

  const marketTone =
    advancingPercent >= 65
      ? "Bullish"
      : advancingPercent >= 45
        ? "Mixed"
        : "Bearish";

  const sectorPerformance = useMemo(
    () =>
      SECTORS.map((sector) => {
        const sectorStocks =
          stocksWithLiveData.filter(
            (stock) =>
              stock.sector === sector
          );

        const averageChange =
          sectorStocks.length > 0
            ? sectorStocks.reduce(
                (sum, stock) =>
                  sum +
                  stock.liveChange
                    .changePercent,
                0
              ) / sectorStocks.length
            : 0;

        return {
          sector,
          change: Number(
            averageChange.toFixed(2)
          ),
          count: sectorStocks.length,
        };
      }).sort(
        (first, second) =>
          second.change - first.change
      ),
    [stocksWithLiveData]
  );

  const radarData = sectorPerformance.map(
    (sector) => ({
      sector: sector.sector,
      performance: Math.max(
        0,
        sector.change + 5
      ),
    })
  );

  const totalVolume = STOCKS.reduce(
    (sum, stock) =>
      sum + stock.volume,
    0
  );

  const strongestSector =
    sectorPerformance[0];

  const weakestSector =
    sectorPerformance[
      sectorPerformance.length - 1
    ];

  return (
    <div className="market-analysis-page">
      <section className="market-analysis-heading">
        <div>
          <span className="market-analysis-eyebrow">
            LIVE MARKET INTELLIGENCE
          </span>

          <h1>Market Analysis</h1>

          <p>
            Track market breadth, sector
            momentum and the strongest daily
            movers across Stockify.
          </p>
        </div>

        <Link
          to="/stocks"
          className="market-analysis-action"
        >
          Browse markets
          <ArrowUpRight size={15} />
        </Link>
      </section>

      <section className="market-analysis-summary">
        <article>
          <span className="market-analysis-summary-icon">
            <BarChart2 size={17} />
          </span>

          <div>
            <span>Total stocks</span>

            <strong className="sf-number">
              {STOCKS.length}
            </strong>

            <small>
              Available market instruments
            </small>
          </div>
        </article>

        <article>
          <span className="market-analysis-summary-icon market-analysis-positive-icon">
            <TrendingUp size={17} />
          </span>

          <div>
            <span>Advancing</span>

            <strong className="sf-number positive">
              {advancing}
            </strong>

            <small>
              {advancingPercent.toFixed(0)}%
              of tracked stocks
            </small>
          </div>
        </article>

        <article>
          <span className="market-analysis-summary-icon market-analysis-negative-icon">
            <TrendingDown size={17} />
          </span>

          <div>
            <span>Declining</span>

            <strong className="sf-number negative">
              {declining}
            </strong>

            <small>
              {decliningPercent.toFixed(0)}%
              of tracked stocks
            </small>
          </div>
        </article>

        <article>
          <span className="market-analysis-summary-icon market-analysis-volume-icon">
            <Activity size={17} />
          </span>

          <div>
            <span>Total volume</span>

            <strong className="sf-number">
              {formatVolume(totalVolume)}
            </strong>

            <small>
              Combined reported volume
            </small>
          </div>
        </article>
      </section>

      <section className="market-breadth-panel">
        <div className="market-breadth-copy">
          <span>MARKET BREADTH</span>

          <h2>
            Today&apos;s market is{" "}
            <strong
              className={`market-tone-${marketTone.toLowerCase()}`}
            >
              {marketTone.toLowerCase()}
            </strong>
          </h2>

          <p>
            {advancing} stocks are trading
            higher, {declining} are trading
            lower and {unchanged} are
            unchanged.
          </p>
        </div>

        <div className="market-breadth-visual">
          <div className="market-breadth-legend">
            <span>
              <i className="market-breadth-green" />
              Advancing
              <strong className="sf-number">
                {advancing}
              </strong>
            </span>

            <span>
              <i className="market-breadth-red" />
              Declining
              <strong className="sf-number">
                {declining}
              </strong>
            </span>
          </div>

          <div className="market-breadth-track">
            <span
              className="market-breadth-advance"
              style={{
                width: `${advancingPercent}%`,
              }}
            />

            <span
              className="market-breadth-decline"
              style={{
                width: `${decliningPercent}%`,
              }}
            />
          </div>

          <div className="market-breadth-percentages">
            <span className="positive sf-number">
              {advancingPercent.toFixed(1)}%
            </span>

            <span className="negative sf-number">
              {decliningPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </section>

      <section className="market-analysis-grid">
        <article className="market-analysis-panel">
          <div className="market-analysis-panel-heading">
            <div>
              <span>SECTOR MOMENTUM</span>
              <h2>Average daily movement</h2>
            </div>

            <small>
              Strongest to weakest
            </small>
          </div>

          <div className="market-analysis-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={sectorPerformance}
                layout="vertical"
                margin={{
                  top: 0,
                  right: 24,
                  bottom: 0,
                  left: 18,
                }}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,.045)"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  tick={{
                    fill: "#665f70",
                    fontSize: 9,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) =>
                    `${
                      Number(value) > 0
                        ? "+"
                        : ""
                    }${Number(value).toFixed(
                      1
                    )}%`
                  }
                />

                <YAxis
                  type="category"
                  dataKey="sector"
                  width={82}
                  tick={{
                    fill: "#9b93a3",
                    fontSize: 9,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{
                    fill:
                      "rgba(255,255,255,.02)",
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
                    `${
                      value > 0 ? "+" : ""
                    }${value.toFixed(2)}%`,
                    "Average change",
                  ]}
                />

                <Bar
                  dataKey="change"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={false}
                >
                  {sectorPerformance.map(
                    (entry) => (
                      <Cell
                        key={entry.sector}
                        fill={
                          entry.change >= 0
                            ? "#22c55e"
                            : "#ef4444"
                        }
                        fillOpacity={0.82}
                      />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="market-analysis-panel">
          <div className="market-analysis-panel-heading">
            <div>
              <span>MARKET SHAPE</span>
              <h2>Sector radar</h2>
            </div>

            <Radar size={17} />
          </div>

          <div className="market-analysis-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <RadarChart
                data={radarData}
                cx="50%"
                cy="50%"
                outerRadius="70%"
              >
                <PolarGrid
                  stroke="rgba(255,255,255,.08)"
                />

                <PolarAngleAxis
                  dataKey="sector"
                  tick={{
                    fill: "#746d7d",
                    fontSize: 8,
                  }}
                />

                <RechartsRadar
                  name="Performance"
                  dataKey="performance"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fill="#a855f7"
                  fillOpacity={0.15}
                  isAnimationActive={false}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="market-sector-highlight-grid">
        <article className="market-sector-highlight market-sector-best">
          <span>STRONGEST SECTOR</span>

          <h2>
            {strongestSector?.sector ?? "—"}
          </h2>

          <strong className="positive sf-number">
            {strongestSector
              ? `${
                  strongestSector.change >= 0
                    ? "+"
                    : ""
                }${strongestSector.change.toFixed(
                  2
                )}%`
              : "—"}
          </strong>

          <small>
            {strongestSector?.count ?? 0}
            tracked stocks
          </small>
        </article>

        <article className="market-sector-highlight market-sector-weakest">
          <span>WEAKEST SECTOR</span>

          <h2>
            {weakestSector?.sector ?? "—"}
          </h2>

          <strong className="negative sf-number">
            {weakestSector
              ? `${weakestSector.change.toFixed(
                  2
                )}%`
              : "—"}
          </strong>

          <small>
            {weakestSector?.count ?? 0}
            tracked stocks
          </small>
        </article>
      </section>

      <section className="market-movers-grid">
        <article className="market-movers-panel">
          <div className="market-movers-heading">
            <div>
              <span className="market-mover-heading-icon market-mover-heading-positive">
                <TrendingUp size={16} />
              </span>

              <div>
                <span>TOP MOVERS</span>
                <h2>Gainers</h2>
              </div>
            </div>

            <Link to="/stocks">
              View markets
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="market-ranking-list">
            {gainers.map(
              (stock, index) => (
                <Link
                  key={stock.id}
                  to={`/stocks/${stock.id}`}
                  className="market-ranking-row"
                >
                  <span className="market-ranking-number sf-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <span className="market-ranking-logo">
                    {stock.symbol.slice(0, 2)}
                  </span>

                  <span className="market-ranking-company">
                    <strong>
                      {stock.symbol}
                    </strong>

                    <small>
                      {stock.companyName}
                    </small>
                  </span>

                  <span className="market-ranking-price sf-number">
                    $
                    {stock.livePrice.toFixed(2)}
                  </span>

                  <span className="market-ranking-change positive sf-number">
                    +
                    {stock.liveChange.changePercent.toFixed(
                      2
                    )}
                    %
                  </span>
                </Link>
              )
            )}
          </div>
        </article>

        <article className="market-movers-panel">
          <div className="market-movers-heading">
            <div>
              <span className="market-mover-heading-icon market-mover-heading-negative">
                <TrendingDown size={16} />
              </span>

              <div>
                <span>TOP MOVERS</span>
                <h2>Losers</h2>
              </div>
            </div>

            <Link to="/stocks">
              View markets
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="market-ranking-list">
            {losers.map(
              (stock, index) => (
                <Link
                  key={stock.id}
                  to={`/stocks/${stock.id}`}
                  className="market-ranking-row"
                >
                  <span className="market-ranking-number sf-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <span className="market-ranking-logo">
                    {stock.symbol.slice(0, 2)}
                  </span>

                  <span className="market-ranking-company">
                    <strong>
                      {stock.symbol}
                    </strong>

                    <small>
                      {stock.companyName}
                    </small>
                  </span>

                  <span className="market-ranking-price sf-number">
                    $
                    {stock.livePrice.toFixed(2)}
                  </span>

                  <span className="market-ranking-change negative sf-number">
                    {stock.liveChange.changePercent.toFixed(
                      2
                    )}
                    %
                  </span>
                </Link>
              )
            )}
          </div>
        </article>
      </section>

      <section className="market-sector-breakdown-panel">
        <div className="market-analysis-panel-heading">
          <div>
            <span>MARKET COVERAGE</span>
            <h2>Stocks by sector</h2>
          </div>

          <small>
            Average daily sector change
          </small>
        </div>

        <div className="market-sector-breakdown-grid">
          {sectorPerformance.map(
            (sector) => (
              <article key={sector.sector}>
                <span>
                  {sector.sector}
                </span>

                <div>
                  <small>
                    {sector.count}{" "}
                    {sector.count === 1
                      ? "stock"
                      : "stocks"}
                  </small>

                  <strong
                    className={`sf-number ${
                      sector.change >= 0
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    {sector.change >= 0
                      ? "+"
                      : ""}
                    {sector.change.toFixed(
                      2
                    )}
                    %
                  </strong>
                </div>
              </article>
            )
          )}
        </div>
      </section>
    </div>
  );
}