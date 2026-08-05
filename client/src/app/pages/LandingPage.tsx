import { Link } from "react-router";
import { getStockLogo } from "../lib/getStockLogo";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

import {
  Badge,
  Button,
  Container,
  GlassPanel,
  Logo,
} from "../components/ui";

const chartData = [
  54, 58, 55, 61, 64, 62, 68, 72, 69, 75, 78,
  76, 83, 88, 85, 92, 98, 95, 103, 108, 114,
].map((value, index) => ({ index, value }));

const movers = [
  { symbol: "AAPL", name: "Apple", price: "$208.38", change: "+1.45%" },
  { symbol: "NVDA", name: "NVIDIA", price: "$182.61", change: "+2.34%" },
  { symbol: "MSFT", name: "Microsoft", price: "$504.72", change: "+0.67%" },
];

const features = [
  {
    icon: ChartNoAxesCombined,
    title: "Real-time markets",
    copy: "Live quotes, market movers and intelligent tracking in one focused workspace.",
  },
  {
    icon: Bot,
    title: "AI research",
    copy: "Ask questions, compare stocks and analyze portfolio risk with contextual AI.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Portfolio clarity",
    copy: "Track holdings, allocation, returns and activity without the dashboard clutter.",
  },
  {
    icon: ShieldCheck,
    title: "Built for confidence",
    copy: "Secure accounts, protected routes and persistent data backed by MongoDB.",
  },
];

export default function LandingPage() {
  return (
    <div className="sf-landing-page">
      <div className="sf-background-grid" aria-hidden="true" />
      <div className="sf-orb sf-orb-one" aria-hidden="true" />
      <div className="sf-orb sf-orb-two" aria-hidden="true" />

      <header className="sf-landing-header">
        <Container className="sf-landing-nav">
          <Logo />

          <nav className="sf-nav-links" aria-label="Primary navigation">
            <a href="#features">Features</a>
            <Link to="/stocks">Markets</Link>
            <a href="#ai">AI Research</a>
            <a href="#about">About</a>
          </nav>

          <div className="sf-nav-actions">
            <Link to="/login" className="sf-login-link">
              Log in
            </Link>
            <Button
              href="/signup"
              size="sm"
              className="sf-nav-cta"
            >
              Get started
              <ArrowRight size={13} />
            </Button>
          </div>
        </Container>
      </header>

      <main>
        <section className="sf-hero-section">
          <Container className="sf-hero-layout">
            <div className="sf-hero-copy">
              <div className="sf-hero-badge-row">
                <Badge
                  variant="purple"
                  size="sm"
                  className="sf-landing-new-badge"
                >
                  New
                </Badge>
                <span>Live market data powered by Finnhub</span>
                <ArrowRight size={14} />
              </div>

              <h1 className="sf-hero-title">
                Invest smarter.
                <br />
                Trade <span>better.</span>
              </h1>

              <p className="sf-hero-description">
                Live market intelligence, portfolio analytics and AI-powered research—built into one focused investing workspace.
              </p>

              <div className="sf-hero-actions">
                <Button
                  to="/signup"
                  size="lg"
                  className="sf-hero-primary-action"
                >
                  <span>Start investing free</span>
                  <ArrowRight size={16} />
                </Button>

                <Button
                  to="/stocks"
                  size="lg"
                  variant="ghost"
                  className="sf-hero-secondary-action"
                >
                  Explore markets
                  <ArrowRight size={15} />
                </Button>
              </div>

              <div className="sf-trust-row">
                <span><ShieldCheck size={15} /> Secure by design</span>
                <span><ChartNoAxesCombined size={15} /> Real-time quotes</span>
                <span><Sparkles size={15} /> AI-powered insights</span>
              </div>
            </div>

            <div className="sf-hero-market-column">
              <GlassPanel glow className="sf-market-card">
                <div className="sf-market-card-heading">
                  <div>
                    <span className="sf-eyebrow">NASDAQ · AAPL</span>
                    <h2>$208.38</h2>
                  </div>
                  <span className="sf-live-pill"><i /> LIVE</span>
                </div>

                <div className="sf-market-change">
                  <TrendingUp size={15} /> +1.45% today
                </div>

                <div className="sf-market-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="landingChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#b56cff" stopOpacity={0.48} />
                          <stop offset="100%" stopColor="#b56cff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#c084fc"
                        strokeWidth={3}
                        fill="url(#landingChart)"
                        dot={false}
                        isAnimationActive
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="sf-market-ranges">
                  <span className="active">1D</span>
                  <span>1W</span>
                  <span>1M</span>
                  <span>3M</span>
                  <span>1Y</span>
                </div>
              </GlassPanel>

              <GlassPanel className="sf-movers-card">
                <div className="sf-movers-heading">
                  <span>Market movers</span>
                  <Link to="/stocks">View all</Link>
                </div>

                {movers.map((item) => (
                  <div className="sf-mover-row" key={item.symbol}>
                    <div className="sf-mover-company">
                      <span className="sf-mover-avatar">{item.symbol.slice(0, 1)}</span>
                      <span><strong>{item.symbol}</strong><small>{item.name}</small></span>
                    </div>
                    <span className="sf-number">{item.price}</span>
                    <span className="sf-positive">{item.change}</span>
                  </div>
                ))}
              </GlassPanel>
            </div>
          </Container>
        </section>

        <section className="sf-feature-ribbon" id="features">
          <div className="sf-horizon-arc" aria-hidden="true" />
          <Container>
            <div className="sf-ribbon-kicker">SMART INVESTING, SIMPLIFIED</div>
            <div className="sf-feature-grid">
              {features.map(({ icon: Icon, title, copy }) => (
                <article className="sf-feature-item" key={title}>
                  <span className="sf-feature-icon"><Icon size={18} /></span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="sf-ai-section" id="ai">
          <Container className="sf-ai-layout">
            <div>
              <span className="sf-section-kicker">STOCKIFY AI</span>
              <h2>Research without the noise.</h2>
              <p>
                Ask portfolio-aware questions, compare companies and surface concentration risk without leaving your investing workspace.
              </p>
              <Button
                to="/assistant"
                variant="ghost"
                className="sf-ai-link-button"
              >
                Explore AI research
                <ArrowRight size={15} />
              </Button>
            </div>

            <GlassPanel glow className="sf-ai-preview">
              <div className="sf-ai-preview-top">
                <span className="sf-ai-icon"><Sparkles size={16} /></span>
                <div><strong>Portfolio insight</strong><small>Generated from your holdings</small></div>
              </div>
              <p>
                Your portfolio is highly concentrated in technology. Consider reducing single-sector exposure and putting idle cash to work gradually.
              </p>
              <div className="sf-ai-scores">
                <span><small>Diversification</small><strong>64</strong></span>
                <span><small>Cash use</small><strong>41</strong></span>
                <span><small>Risk</small><strong>Moderate</strong></span>
              </div>
            </GlassPanel>
          </Container>
        </section>
      </main>

      <footer className="sf-landing-footer" id="about">
        <Container className="sf-footer-layout">
          <Logo />
          <p>Market intelligence for modern investors.</p>
          <span>© {new Date().getFullYear()} Stockify</span>
        </Container>
      </footer>
    </div>
  );
}
