import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";

import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import FundWalletModal from "../components/FundWalletModal";
import Logo from "../components/ui/Logo";
import { useAuth } from "../context/AuthContext";

interface SignupForm {
  name: string;
  email: string;
  username: string;
  password: string;
  confirm: string;
}

interface PasswordCheck {
  label: string;
  valid: boolean;
}

const FEATURES = [
  {
    icon: Activity,
    title: "Practice with live context",
    description:
      "Use current market quotes inside a simulated trading environment.",
  },
  {
    icon: BarChart3,
    title: "Track every position",
    description:
      "Monitor allocation, performance, transactions and portfolio risk.",
  },
  {
    icon: Sparkles,
    title: "Research with AI",
    description:
      "Ask personalized questions about your portfolio and investing concepts.",
  },
  {
    icon: ShieldCheck,
    title: "No real-money risk",
    description:
      "Learn how trading works before putting actual capital on the line.",
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

function PasswordStrength({
  password,
}: {
  password: string;
}) {
  const checks: PasswordCheck[] = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Number",
      valid: /\d/.test(password),
    },
    {
      label: "Special character",
      valid: /[^a-zA-Z0-9]/.test(
        password
      ),
    },
  ];

  const score = checks.filter(
    (check) => check.valid
  ).length;

  const strengthLabel =
    score === 4
      ? "Strong"
      : score === 3
        ? "Good"
        : score === 2
          ? "Fair"
          : "Weak";

  if (!password) {
    return null;
  }

  return (
    <div className="auth-password-strength">
      <div className="auth-strength-heading">
        <span>Password strength</span>

        <strong
          className={`auth-strength-label auth-strength-${score}`}
        >
          {strengthLabel}
        </strong>
      </div>

      <div className="auth-strength-track">
        {[1, 2, 3, 4].map((item) => (
          <span
            key={item}
            className={
              item <= score
                ? `auth-strength-active auth-strength-${score}`
                : ""
            }
          />
        ))}
      </div>

      <div className="auth-password-checks">
        {checks.map((check) => (
          <span
            key={check.label}
            className={
              check.valid
                ? "auth-password-check-valid"
                : ""
            }
          >
            <i>
              {check.valid && (
                <Check size={9} />
              )}
            </i>

            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] =
    useState<SignupForm>({
      name: "",
      email: "",
      username: "",
      password: "",
      confirm: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showFundModal, setShowFundModal] =
    useState(false);

  const passwordChecks = useMemo(
    () => ({
      longEnough:
        form.password.length >= 8,
      uppercase:
        /[A-Z]/.test(form.password),
      number:
        /\d/.test(form.password),
      special:
        /[^a-zA-Z0-9]/.test(
          form.password
        ),
    }),
    [form.password]
  );

  const passwordIsStrong =
    Object.values(passwordChecks).every(
      Boolean
    );

  const updateField =
    (field: keyof SignupForm) =>
    (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email
      .trim()
      .toLowerCase();
    const username =
      form.username.trim();

    if (
      !name ||
      !email ||
      !username ||
      !form.password ||
      !form.confirm
    ) {
      setError(
        "Complete every field before creating your account."
      );

      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError(
        "Enter a valid email address."
      );

      return;
    }

    if (username.length < 3) {
      setError(
        "Your username must contain at least 3 characters."
      );

      return;
    }

    if (
      !/^[a-zA-Z0-9_]+$/.test(username)
    ) {
      setError(
        "Your username may contain only letters, numbers and underscores."
      );

      return;
    }

    if (!passwordIsStrong) {
      setError(
        "Use at least 8 characters with an uppercase letter, number and special character."
      );

      return;
    }

    if (
      form.password !== form.confirm
    ) {
      setError(
        "The passwords do not match."
      );

      return;
    }

    setLoading(true);

    try {
      await signup(
        name,
        email,
        username,
        form.password
      );

      toast.success(
        "Your Stockify account is ready"
      );

      setShowFundModal(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-signup-page">
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
            BUILD YOUR MARKET SKILLS
          </span>

          <h1>
            Learn the market.
            <br />
            Without paying tuition to it.
          </h1>

          <p>
            Create a Stockify account and
            practise investing with simulated
            funds, real quote context,
            portfolio analytics and AI-powered
            educational research.
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
                id="signupChartGradient"
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
              d="M0 192 C70 166 118 181 176 145 C238 106 282 140 346 112 C414 82 459 113 522 89 C591 62 644 76 711 43 C777 12 831 47 900 22 L900 240 L0 240 Z"
              fill="url(#signupChartGradient)"
            />

            <path
              d="M0 192 C70 166 118 181 176 145 C238 106 282 140 346 112 C414 82 459 113 522 89 C591 62 644 76 711 43 C777 12 831 47 900 22"
              fill="none"
              stroke="#b66bff"
              strokeWidth="3"
            />
          </svg>

          <div className="auth-chart-badge">
            <Zap size={14} />

            <div>
              <span>New account balance</span>

              <strong>$100,000 demo</strong>
            </div>
          </div>
        </div>

        <div className="auth-ticker">
          <div>
            {[
              ...MARKET_TICKER,
              ...MARKET_TICKER,
            ].map((stock, index) => (
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
                    <TrendingDown size={11} />
                  )}

                  {stock.change}
                </small>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-mobile-logo">
          <Logo />
        </div>

        <div className="auth-form-card auth-signup-card">
          <div className="auth-form-heading">
            <span>CREATE YOUR ACCOUNT</span>

            <h2>Start trading smarter</h2>

            <p>
              Build a simulated portfolio and
              learn how markets behave.
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
            <div className="auth-form-grid">
              <label className="auth-field">
                <span>Full name</span>

                <div>
                  <User size={15} />

                  <input
                    type="text"
                    value={form.name}
                    onChange={updateField(
                      "name"
                    )}
                    placeholder="John Doe"
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>
              </label>

              <label className="auth-field">
                <span>Username</span>

                <div>
                  <User size={15} />

                  <input
                    type="text"
                    value={form.username}
                    onChange={updateField(
                      "username"
                    )}
                    placeholder="johndoe"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </label>
            </div>

            <label className="auth-field">
              <span>Email address</span>

              <div>
                <Mail size={15} />

                <input
                  type="email"
                  value={form.email}
                  onChange={updateField(
                    "email"
                  )}
                  placeholder="john@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Password</span>

              <div>
                <Lock size={15} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={form.password}
                  onChange={updateField(
                    "password"
                  )}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  disabled={loading}
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

              <PasswordStrength
                password={form.password}
              />
            </label>

            <label className="auth-field">
              <span>Confirm password</span>

              <div>
                <ShieldCheck size={15} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={form.confirm}
                  onChange={updateField(
                    "confirm"
                  )}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="auth-primary-button"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-button-spinner" />
              ) : (
                <>
                  Create account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="auth-account-link">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>

          <p className="auth-legal-copy">
            By creating an account, you agree
            to use Stockify as an educational
            simulated-trading application.
          </p>
        </div>
      </section>
    </div>
  );
}