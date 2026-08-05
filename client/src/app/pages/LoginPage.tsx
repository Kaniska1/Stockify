import {
  useState,
  type FormEvent,
} from "react";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Globe2,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import FundWalletModal from "../components/FundWalletModal";
import Logo from "../components/ui/Logo";
import { useAuth } from "../context/AuthContext";

const MARKET_TICKER = [
  {
    symbol: "AAPL",
    price: "$214.32",
    change: "+1.84%",
    positive: true,
  },
  {
    symbol: "NVDA",
    price: "$891.54",
    change: "+3.21%",
    positive: true,
  },
  {
    symbol: "TSLA",
    price: "$248.71",
    change: "-0.93%",
    positive: false,
  },
  {
    symbol: "MSFT",
    price: "$432.18",
    change: "+0.67%",
    positive: true,
  },
  {
    symbol: "GOOGL",
    price: "$178.90",
    change: "+2.15%",
    positive: true,
  },
  {
    symbol: "AMZN",
    price: "$194.47",
    change: "-1.12%",
    positive: false,
  },
];

const FEATURES = [
  {
    icon: Activity,
    title: "Live market quotes",
    description:
      "Monitor supported stocks using real market quote data.",
  },
  {
    icon: BarChart3,
    title: "Portfolio intelligence",
    description:
      "Track performance, allocation and concentration risk.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted research",
    description:
      "Explore your portfolio with educational Gemini analysis.",
  },
  {
    icon: ShieldCheck,
    title: "Safe simulation",
    description:
      "Practice trading without risking real money.",
  },
];

const INDEX_CARDS = [
  {
    name: "S&P 500",
    value: "5,847.29",
    change: "+0.84%",
    positive: true,
  },
  {
    name: "NASDAQ",
    value: "18,942.11",
    change: "+1.23%",
    positive: true,
  },
  {
    name: "DOW",
    value: "42,891.04",
    change: "-0.31%",
    positive: false,
  },
];

export default function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [demoLoading, setDemoLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showFundModal, setShowFundModal] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const identity =
      emailOrUsername.trim();

    if (!identity || !password) {
      setError(
        "Enter your email or username and password."
      );

      return;
    }

    setLoading(true);

    try {
      await login(identity, password);

      toast.success("Welcome back");

      navigate("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError("");

    const demoEmail =
      "demo@stockify.app";

    const demoPassword =
      "Demo@1234!";

    try {
      try {
        await login(
          demoEmail,
          demoPassword
        );

        toast.success(
          "Welcome to the Stockify demo"
        );
      } catch {
        await signup(
          "Demo User",
          demoEmail,
          "demouser",
          demoPassword
        );

        toast.success(
          "Demo account created"
        );
      }

      setShowFundModal(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to open the demo account"
      );
    } finally {
      setDemoLoading(false);
    }
  };

  const busy =
    loading || demoLoading;

  return (
    <div className="auth-page auth-login-page">
      {showFundModal && (
        <FundWalletModal
          onDone={() =>
            navigate("/dashboard")
          }
        />
      )}

      <div className="auth-background-grid" />

      <section className="auth-showcase">
        <header className="auth-showcase-header">
          <Logo />

          <span className="auth-live-pill">
            <i />
            MARKET DATA LIVE
          </span>
        </header>

        <div className="auth-index-strip">
          {INDEX_CARDS.map((index) => (
            <article key={index.name}>
              <span>{index.name}</span>

              <strong className="sf-number">
                {index.value}
              </strong>

              <small
                className={
                  index.positive
                    ? "positive"
                    : "negative"
                }
              >
                {index.change}
              </small>
            </article>
          ))}
        </div>

        <div className="auth-showcase-content">
          <span className="auth-showcase-label">
            <Sparkles size={13} />
            MARKET INTELLIGENCE PLATFORM
          </span>

          <h1>
            Understand the market.
            <br />
            Practice every decision.
          </h1>

          <p>
            Stockify combines live market
            quotes, simulated trading,
            portfolio analytics and AI-powered
            educational insights in one focused
            workspace.
          </p>

          <div className="auth-feature-grid">
            {FEATURES.map(
              ({
                icon: Icon,
                title,
                description,
              }) => (
                <article key={title}>
                  <span>
                    <Icon size={16} />
                  </span>

                  <div>
                    <strong>{title}</strong>

                    <small>
                      {description}
                    </small>
                  </div>
                </article>
              )
            )}
          </div>
        </div>

        <div className="auth-market-visual">
          <div className="auth-chart-grid" />

          <svg
            viewBox="0 0 900 240"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="authChartGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#a855f7"
                  stopOpacity="0.32"
                />

                <stop
                  offset="100%"
                  stopColor="#a855f7"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            <path
              d="M0 185 C85 150 125 176 192 132 C265 84 325 148 390 113 C460 75 500 122 560 82 C640 28 705 92 770 58 C820 32 855 42 900 21 L900 240 L0 240 Z"
              fill="url(#authChartGradient)"
            />

            <path
              d="M0 185 C85 150 125 176 192 132 C265 84 325 148 390 113 C460 75 500 122 560 82 C640 28 705 92 770 58 C820 32 855 42 900 21"
              fill="none"
              stroke="#b66bff"
              strokeWidth="3"
            />
          </svg>

          <div className="auth-chart-badge">
            <TrendingUp size={14} />

            <div>
              <span>Simulated portfolio</span>
              <strong>+12.48%</strong>
            </div>
          </div>
        </div>

        <div className="auth-ticker">
          <div>
            {[...MARKET_TICKER, ...MARKET_TICKER].map(
              (stock, index) => (
                <span
                  key={`${stock.symbol}-${index}`}
                >
                  <strong>
                    {stock.symbol}
                  </strong>

                  <i className="sf-number">
                    {stock.price}
                  </i>

                  <small
                    className={
                      stock.positive
                        ? "positive"
                        : "negative"
                    }
                  >
                    {stock.positive ? (
                      <TrendingUp size={11} />
                    ) : (
                      <TrendingDown
                        size={11}
                      />
                    )}

                    {stock.change}
                  </small>
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-mobile-logo">
          <Logo />
        </div>

        <div className="auth-form-card">
          <div className="auth-form-heading">
            <span>WELCOME BACK</span>

            <h2>Sign in to Stockify</h2>

            <p>
              Continue to your portfolio and
              market workspace.
            </p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={15} />

              <span>{error}</span>
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <label className="auth-field">
              <span>Email or username</span>

              <div>
                <Globe2 size={15} />

                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(event) =>
                    setEmailOrUsername(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="username"
                  disabled={busy}
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Password</span>

              <div>
                <ShieldCheck size={15} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={busy}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </label>

            <div className="auth-form-options">
              <span>
                Secure JWT authentication
              </span>
            </div>

            <button
              type="submit"
              className="auth-primary-button"
              disabled={busy}
            >
              {loading ? (
                <span className="auth-button-spinner" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or explore first</span>
          </div>

          <button
            type="button"
            className="auth-demo-button"
            onClick={() =>
              void handleDemoLogin()
            }
            disabled={busy}
          >
            {demoLoading ? (
              <span className="auth-button-spinner" />
            ) : (
              <>
                <Zap size={15} />
                Open demo account
              </>
            )}
          </button>

          <div className="auth-account-card">
  <div className="auth-account-card-heading">
    <div>
      <span>NEW TO STOCKIFY?</span>

      <h3>
        Build your first simulated portfolio
      </h3>
    </div>

    <Link
      to="/signup"
      className="auth-account-card-link"
    >
      Create account
      <ArrowRight size={14} />
    </Link>
  </div>

  <p>
    Practice investing with virtual funds,
    live market context and portfolio
    analytics—without risking real money.
  </p>

  <div className="auth-account-benefits">
    <span>
      <ShieldCheck size={13} />
      Risk-free trading
    </span>

    <span>
      <BarChart3 size={13} />
      Portfolio analytics
    </span>

    <span>
      <Sparkles size={13} />
      AI research tools
    </span>
  </div>
</div>

<p className="auth-legal-copy">
  Educational simulation only. Stockify does
  not execute real financial transactions.
</p>
        </div>
      </section>
    </div>
  );
}