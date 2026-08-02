import { useState } from "react";
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

function scoreColor(score: number) {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#f43f5e";
}

function severityColor(
  severity: "Low" | "Moderate" | "High"
) {
  if (severity === "Low") return "#10b981";
  if (severity === "Moderate") return "#f59e0b";
  return "#f43f5e";
}

function ScoreCard({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon: React.ReactNode;
}) {
  const color = scoreColor(score);

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: "#1a1a1a",
        border: "1px solid #333333",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontSize: "12px",
            color: "#808080",
          }}
        >
          {label}
        </span>

        <span style={{ color }}>{icon}</span>
      </div>

      <div
        style={{
          fontSize: "24px",
          fontWeight: 750,
          color,
        }}
      >
        {score}
        <span
          style={{
            fontSize: "12px",
            color: "#5f5f5f",
          }}
        >
          /100
        </span>
      </div>

      <div
        className="mt-3 h-1.5 rounded-full overflow-hidden"
        style={{ background: "#2a2a2a" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(
              0,
              Math.min(100, score)
            )}%`,
            background: color,
          }}
        />
      </div>
    </div>
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
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "rgba(246,246,9,0.1)",
                border:
                  "1px solid rgba(246,246,9,0.2)",
              }}
            >
              <Brain
                size={18}
                style={{ color: "#f6f609" }}
              />
            </div>

            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#e7fef6",
                  letterSpacing: "-0.02em",
                }}
              >
                AI Portfolio Analyzer
              </h1>

              <p
                style={{
                  fontSize: "13px",
                  color: "#808080",
                  marginTop: "2px",
                }}
              >
                Evaluate diversification, risk and cash utilization
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
          style={{
            background: loading
              ? "#333333"
              : "linear-gradient(135deg, #f6f609, #c5c507)",

            color: loading
              ? "#666666"
              : "#111111",

            fontSize: "13px",
            fontWeight: 700,
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading ? (
            <>
              <RefreshCw
                size={15}
                className="animate-spin"
              />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={15} />
              {analysis
                ? "Analyze Again"
                : "Analyze Portfolio"}
            </>
          )}
        </button>
      </div>

      <div
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Holdings",
            value: holdings.length,
          },
          {
            label: "Transactions",
            value: transactions.length,
          },
          {
            label: "Portfolio Value",
            value: `$${portfolioValue.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}`,
          },
          {
            label: "Cash Balance",
            value: `$${walletBalance.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}`,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-xl"
            style={{
              background: "#1a1a1a",
              border: "1px solid #333333",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#808080",
                marginBottom: "7px",
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                fontSize: "19px",
                fontWeight: 700,
                color: "#e7fef6",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {!analysis ? (
        <div
          className="min-h-[430px] rounded-2xl flex flex-col items-center justify-center text-center p-8"
          style={{
            background: "#1a1a1a",
            border: "1px solid #333333",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background:
                "rgba(246,246,9,0.1)",
              border:
                "1px solid rgba(246,246,9,0.2)",
            }}
          >
            <Brain
              size={29}
              style={{ color: "#f6f609" }}
            />
          </div>

          <h2
            style={{
              fontSize: "18px",
              fontWeight: 650,
              color: "#e7fef6",
            }}
          >
            Generate an AI portfolio report
          </h2>

          <p
            style={{
              marginTop: "7px",
              maxWidth: "500px",
              fontSize: "13px",
              color: "#808080",
              lineHeight: 1.65,
            }}
          >
            Stockify AI will evaluate your portfolio structure,
            cash allocation, concentration risk and recent trading
            activity.
          </p>

          <p
            style={{
              marginTop: "12px",
              fontSize: "11px",
              color: "#4d4d4d",
            }}
          >
            Educational analysis only. Prices are currently simulated.
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreCard
              label="Overall Health"
              score={analysis.overallScore}
              icon={<Gauge size={18} />}
            />

            <ScoreCard
              label="Diversification"
              score={analysis.diversificationScore}
              icon={<Target size={18} />}
            />

            <ScoreCard
              label="Cash Utilization"
              score={analysis.cashUtilizationScore}
              icon={<Wallet size={18} />}
            />

            <ScoreCard
              label="Concentration Resistance"
              score={analysis.concentrationScore}
              icon={<ShieldCheck size={18} />}
            />
          </div>

          <div
            className="p-5 rounded-xl"
            style={{
              background: "#1a1a1a",
              border: "1px solid #333333",
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: 650,
                  color: "#e7fef6",
                }}
              >
                Portfolio Summary
              </h2>

              <span
                className="px-2.5 py-1 rounded-md"
                style={{
                  fontSize: "11px",
                  fontWeight: 650,
                  color:
                    analysis.riskLevel === "Low"
                      ? "#10b981"
                      : analysis.riskLevel ===
                          "Moderate"
                        ? "#f59e0b"
                        : "#f43f5e",

                  background:
                    analysis.riskLevel === "Low"
                      ? "rgba(16,185,129,0.1)"
                      : analysis.riskLevel ===
                          "Moderate"
                        ? "rgba(245,158,11,0.1)"
                        : "rgba(244,63,94,0.1)",
                }}
              >
                {analysis.riskLevel} Risk
              </span>
            </div>

            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.7,
                color: "#b3b3b3",
              }}
            >
              {analysis.summary}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div
              className="p-5 rounded-xl"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333333",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2
                  size={16}
                  style={{ color: "#10b981" }}
                />

                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 650,
                    color: "#e7fef6",
                  }}
                >
                  Strengths
                </h3>
              </div>

              <div className="space-y-3">
                {analysis.strengths.map(
                  (strength, index) => (
                    <div
                      key={`${strength}-${index}`}
                      className="flex items-start gap-2.5"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{
                          background: "#10b981",
                        }}
                      />

                      <p
                        style={{
                          fontSize: "12px",
                          lineHeight: 1.6,
                          color: "#b3b3b3",
                        }}
                      >
                        {strength}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div
              className="p-5 rounded-xl"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333333",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <XCircle
                  size={16}
                  style={{ color: "#f43f5e" }}
                />

                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 650,
                    color: "#e7fef6",
                  }}
                >
                  Weaknesses
                </h3>
              </div>

              <div className="space-y-3">
                {analysis.weaknesses.map(
                  (weakness, index) => (
                    <div
                      key={`${weakness}-${index}`}
                      className="flex items-start gap-2.5"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{
                          background: "#f43f5e",
                        }}
                      />

                      <p
                        style={{
                          fontSize: "12px",
                          lineHeight: 1.6,
                          color: "#b3b3b3",
                        }}
                      >
                        {weakness}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div
            className="p-5 rounded-xl"
            style={{
              background: "#1a1a1a",
              border: "1px solid #333333",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles
                size={16}
                style={{ color: "#f6f609" }}
              />

              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 650,
                  color: "#e7fef6",
                }}
              >
                Recommendations
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {analysis.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={`${recommendation}-${index}`}
                    className="p-3.5 rounded-lg"
                    style={{
                      background: "#111111",
                      border: "1px solid #2d2d2d",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#f6f609",
                        marginBottom: "5px",
                      }}
                    >
                      RECOMMENDATION {index + 1}
                    </div>

                    <p
                      style={{
                        fontSize: "12px",
                        lineHeight: 1.6,
                        color: "#b3b3b3",
                      }}
                    >
                      {recommendation}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          <div
            className="p-5 rounded-xl"
            style={{
              background: "#1a1a1a",
              border: "1px solid #333333",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle
                size={16}
                style={{ color: "#f59e0b" }}
              />

              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 650,
                  color: "#e7fef6",
                }}
              >
                Key Risks
              </h3>
            </div>

            <div className="space-y-3">
              {analysis.keyRisks.map(
                (risk, index) => {
                  const color =
                    severityColor(risk.severity);

                  return (
                    <div
                      key={`${risk.title}-${index}`}
                      className="p-4 rounded-lg"
                      style={{
                        background: "#111111",
                        border: `1px solid ${color}25`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4
                          style={{
                            fontSize: "13px",
                            fontWeight: 650,
                            color: "#e7fef6",
                          }}
                        >
                          {risk.title}
                        </h4>

                        <span
                          className="px-2 py-0.5 rounded"
                          style={{
                            color,
                            background: `${color}15`,
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          {risk.severity}
                        </span>
                      </div>

                      <p
                        style={{
                          marginTop: "7px",
                          fontSize: "12px",
                          lineHeight: 1.6,
                          color: "#999999",
                        }}
                      >
                        {risk.description}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <p
            style={{
              fontSize: "11px",
              color: "#4d4d4d",
              textAlign: "center",
            }}
          >
            This analysis is educational and based on simulated
            Stockify portfolio data.
          </p>
        </>
      )}
    </div>
  );
}