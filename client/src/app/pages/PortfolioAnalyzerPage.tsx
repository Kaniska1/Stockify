import { useState, type ReactNode } from "react";
import { getStockLogo } from "../lib/getStockLogo";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

import {
  analyzePortfolioRequest,
  type PortfolioAnalysis,
} from "../lib/ai";

interface ScoreCardProps {
  label: string;
  score: number;
  icon: ReactNode;
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function getScoreTone(score: number): string {
  if (score >= 75) {
    return "good";
  }

  if (score >= 50) {
    return "moderate";
  }

  return "poor";
}

function getRiskTone(
  riskLevel: PortfolioAnalysis["riskLevel"]
): string {
  if (riskLevel === "Low") {
    return "low";
  }

  if (riskLevel === "Moderate") {
    return "moderate";
  }

  return "high";
}

function getSeverityTone(
  severity: "Low" | "Moderate" | "High"
): string {
  return severity.toLowerCase();
}

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

function ScoreCard({
  label,
  score,
  icon,
}: ScoreCardProps) {
  const normalizedScore = clampScore(score);
  const tone = getScoreTone(normalizedScore);

  return (
    <article
      className={`analyzer-score-card analyzer-score-${tone}`}
    >
      <div className="analyzer-score-header">
        <span>{label}</span>

        <span className="analyzer-score-icon">
          {icon}
        </span>
      </div>

      <div className="analyzer-score-value sf-number">
        {normalizedScore}

        <small>/100</small>
      </div>

      <div className="analyzer-score-track">
        <span
          style={{
            width: `${normalizedScore}%`,
          }}
        />
      </div>
    </article>
  );
}

export default function PortfolioAnalyzerPage() {
  const { token } = useAuth();

  const {
    holdings,
    walletBalance,
    portfolioValue,
    transactions,
  } = useApp();

  const [analysis, setAnalysis] =
    useState<PortfolioAnalysis | null>(null);

  const [loading, setLoading] =
    useState(false);

  const totalAccountValue =
    portfolioValue + walletBalance;

  const equityAllocation =
    totalAccountValue > 0
      ? (portfolioValue / totalAccountValue) * 100
      : 0;

  const cashAllocation =
    totalAccountValue > 0
      ? (walletBalance / totalAccountValue) * 100
      : 0;

  const handleAnalyze = async () => {
    if (!token) {
      toast.error("You must be logged in.");
      return;
    }

    setLoading(true);

    try {
      const response =
        await analyzePortfolioRequest(token);

      setAnalysis(response.analysis);

      toast.success(
        "Portfolio analysis completed"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to analyze portfolio"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-analyzer-page">
      <section className="analyzer-heading">
        <div>
          <span className="analyzer-eyebrow">
            STOCKIFY INTELLIGENCE
          </span>

          <h1>AI Portfolio Analyzer</h1>

          <p>
            Evaluate portfolio health,
            diversification, cash utilization and
            concentration risk using your current
            Stockify account data.
          </p>
        </div>

        <button
          type="button"
          className="analyzer-run-button"
          onClick={() => void handleAnalyze()}
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw
                size={15}
                className="analyzer-spin"
              />
              Analyzing portfolio
            </>
          ) : (
            <>
              <Sparkles size={15} />

              {analysis
                ? "Analyze again"
                : "Analyze portfolio"}
            </>
          )}
        </button>
      </section>

      <section className="analyzer-account-grid">
        <article>
          <span>Holdings</span>

          <strong className="sf-number">
            {holdings.length}
          </strong>

          <small>Active portfolio positions</small>
        </article>

        <article>
          <span>Transactions</span>

          <strong className="sf-number">
            {transactions.length}
          </strong>

          <small>Recorded trading activity</small>
        </article>

        <article>
          <span>Portfolio value</span>

          <strong className="sf-number">
            {formatCurrency(portfolioValue)}
          </strong>

          <small>
            {equityAllocation.toFixed(1)}% of account
          </small>
        </article>

        <article>
          <span>Cash balance</span>

          <strong className="sf-number">
            {formatCurrency(walletBalance)}
          </strong>

          <small>
            {cashAllocation.toFixed(1)}% of account
          </small>
        </article>
      </section>

      {!analysis ? (
        <section className="analyzer-empty-state">
          <div className="analyzer-empty-icon">
            <Brain size={30} />
          </div>

          <span className="analyzer-empty-label">
            PERSONALIZED AI REPORT
          </span>

          <h2>
            Understand the structure of your
            portfolio
          </h2>

          <p>
            Stockify AI will examine your holdings,
            cash allocation, transaction history,
            diversification and concentration risks.
          </p>

          <div className="analyzer-preview-grid">
            <article>
              <Gauge size={17} />

              <strong>Portfolio health</strong>

              <small>
                A combined score based on structure
                and risk.
              </small>
            </article>

            <article>
              <Target size={17} />

              <strong>Diversification</strong>

              <small>
                Evaluates how widely your capital is
                distributed.
              </small>
            </article>

            <article>
              <Wallet size={17} />

              <strong>Cash utilization</strong>

              <small>
                Reviews how much of your account is
                currently uninvested.
              </small>
            </article>

            <article>
              <ShieldCheck size={17} />

              <strong>Concentration</strong>

              <small>
                Identifies excessive dependence on
                individual holdings.
              </small>
            </article>
          </div>

          <button
            type="button"
            className="analyzer-empty-action"
            onClick={() => void handleAnalyze()}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw
                  size={15}
                  className="analyzer-spin"
                />
                Generating report
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generate AI report
              </>
            )}
          </button>

          <small className="analyzer-education-note">
            Educational analysis only. Stockify
            trading remains simulated.
          </small>
        </section>
      ) : (
        <div className="analyzer-results">
          <section className="analyzer-result-hero">
            <div className="analyzer-overall-score">
              <div
                className={`analyzer-score-ring analyzer-ring-${getScoreTone(
                  analysis.overallScore
                )}`}
                style={{
                  "--analyzer-score": `${clampScore(
                    analysis.overallScore
                  ) * 3.6}deg`,
                } as React.CSSProperties}
              >
                <div>
                  <strong className="sf-number">
                    {clampScore(
                      analysis.overallScore
                    )}
                  </strong>

                  <span>/100</span>
                </div>
              </div>

              <div className="analyzer-overall-copy">
                <span>OVERALL PORTFOLIO HEALTH</span>

                <h2>
                  {analysis.overallScore >= 75
                    ? "Strong foundation"
                    : analysis.overallScore >= 50
                      ? "Room for improvement"
                      : "Significant weaknesses detected"}
                </h2>

                <p>
                  {analysis.summary}
                </p>
              </div>
            </div>

            <div className="analyzer-risk-summary">
              <span>Current risk level</span>

              <strong
                className={`analyzer-risk-pill analyzer-risk-${getRiskTone(
                  analysis.riskLevel
                )}`}
              >
                {analysis.riskLevel} Risk
              </strong>

              <small>
                Based on the portfolio information
                currently available to Stockify AI.
              </small>
            </div>
          </section>

          <section className="analyzer-score-grid">
            <ScoreCard
              label="Overall health"
              score={analysis.overallScore}
              icon={<Gauge size={18} />}
            />

            <ScoreCard
              label="Diversification"
              score={analysis.diversificationScore}
              icon={<Target size={18} />}
            />

            <ScoreCard
              label="Cash utilization"
              score={analysis.cashUtilizationScore}
              icon={<Wallet size={18} />}
            />

            <ScoreCard
              label="Concentration resistance"
              score={analysis.concentrationScore}
              icon={<ShieldCheck size={18} />}
            />
          </section>

          <section className="analyzer-two-column">
            <article className="analyzer-list-panel analyzer-strength-panel">
              <div className="analyzer-panel-heading">
                <span className="analyzer-panel-icon">
                  <CheckCircle2 size={17} />
                </span>

                <div>
                  <span>POSITIVE SIGNALS</span>
                  <h2>Portfolio strengths</h2>
                </div>
              </div>

              <div className="analyzer-bullet-list">
                {analysis.strengths.map(
                  (strength, index) => (
                    <div
                      key={`${strength}-${index}`}
                    >
                      <span />

                      <p>{strength}</p>
                    </div>
                  )
                )}
              </div>
            </article>

            <article className="analyzer-list-panel analyzer-weakness-panel">
              <div className="analyzer-panel-heading">
                <span className="analyzer-panel-icon">
                  <XCircle size={17} />
                </span>

                <div>
                  <span>AREAS TO REVIEW</span>
                  <h2>Portfolio weaknesses</h2>
                </div>
              </div>

              <div className="analyzer-bullet-list">
                {analysis.weaknesses.map(
                  (weakness, index) => (
                    <div
                      key={`${weakness}-${index}`}
                    >
                      <span />

                      <p>{weakness}</p>
                    </div>
                  )
                )}
              </div>
            </article>
          </section>

          <section className="analyzer-recommendations-panel">
            <div className="analyzer-panel-heading">
              <span className="analyzer-panel-icon">
                <Sparkles size={17} />
              </span>

              <div>
                <span>EDUCATIONAL GUIDANCE</span>
                <h2>Recommendations</h2>
              </div>
            </div>

            <div className="analyzer-recommendation-grid">
              {analysis.recommendations.map(
                (recommendation, index) => (
                  <article
                    key={`${recommendation}-${index}`}
                  >
                    <span className="analyzer-recommendation-number sf-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <p>{recommendation}</p>
                  </article>
                )
              )}
            </div>
          </section>

          <section className="analyzer-risk-panel">
            <div className="analyzer-panel-heading">
              <span className="analyzer-panel-icon">
                <AlertTriangle size={17} />
              </span>

              <div>
                <span>RISK MONITOR</span>
                <h2>Key portfolio risks</h2>
              </div>
            </div>

            <div className="analyzer-risk-grid">
              {analysis.keyRisks.map(
                (risk, index) => (
                  <article
                    key={`${risk.title}-${index}`}
                    className={`analyzer-risk-card analyzer-severity-${getSeverityTone(
                      risk.severity
                    )}`}
                  >
                    <div className="analyzer-risk-card-heading">
                      <strong>{risk.title}</strong>

                      <span>
                        {risk.severity}
                      </span>
                    </div>

                    <p>{risk.description}</p>
                  </article>
                )
              )}
            </div>
          </section>

          <footer className="analyzer-disclaimer">
            <AlertTriangle size={14} />

            <p>
              This report is generated for
              educational use from the data
              available inside Stockify. It is not
              investment advice and does not
              guarantee future performance.
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}