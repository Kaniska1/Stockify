import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  BarChart3,
  Bell,
  Bookmark,
  Bot,
  Brain,
  Briefcase,
  ChevronRight,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router";

import CommandPalette from "./CommandPalette";
import FundWalletModal from "./FundWalletModal";
import NotificationDropdown from "./NotificationDropdown";
import Logo from "./ui/Logo";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  description: string;
  path: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Dashboard",
        description: "Account overview",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Markets",
        description: "Browse stocks",
        path: "/stocks",
        icon: TrendingUp,
      },
      {
        label: "Watchlist",
        description: "Saved companies",
        path: "/watchlist",
        icon: Bookmark,
      },
      {
        label: "Portfolio",
        description: "Positions and returns",
        path: "/portfolio",
        icon: Briefcase,
      },
      {
        label: "Transactions",
        description: "Trading history",
        path: "/transactions",
        icon: History,
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        label: "AI Assistant",
        description: "Ask Stockify AI",
        path: "/assistant",
        icon: Bot,
      },
      {
        label: "Portfolio Analyzer",
        description: "AI risk report",
        path: "/portfolio-analyzer",
        icon: Brain,
      },
      {
        label: "Market Analysis",
        description: "Breadth and sectors",
        path: "/market",
        icon: BarChart3,
      },
    ],
  },
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

export default function Layout({
  children,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [commandOpen, setCommandOpen] =
    useState(false);

  const [fundModalOpen, setFundModalOpen] =
    useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const { user, logout } = useAuth();
  const { walletBalance } = useApp();
  const { unreadCount } = useNotifications();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleShortcut = (
      event: KeyboardEvent
    ) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setCommandOpen(true);
      }
    };

    window.addEventListener(
      "keydown",
      handleShortcut
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleShortcut
      );
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const isRouteActive = (
    path: string
  ): boolean =>
    location.pathname === path ||
    location.pathname.startsWith(
      `${path}/`
    );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="app-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`app-sidebar ${
          sidebarOpen
            ? "app-sidebar-open"
            : ""
        }`}
      >
        <header className="app-sidebar-header">
          <Logo />

          <button
            type="button"
            className="app-sidebar-close"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </header>

        <div className="app-sidebar-scroll">
          <nav className="app-navigation">
            {NAV_GROUPS.map((group) => (
              <section
                key={group.label}
                className="app-nav-group"
              >
                <span className="app-nav-label">
                  {group.label}
                </span>

                <div className="app-nav-list">
                  {group.items.map(
                    ({
                      label,
                      description,
                      path,
                      icon: Icon,
                    }) => {
                      const active =
                        isRouteActive(path);

                      return (
                        <Link
                          key={path}
                          to={path}
                          className={`app-nav-item ${
                            active
                              ? "app-nav-item-active"
                              : ""
                          }`}
                        >
                          <span className="app-nav-icon">
                            <Icon size={17} />
                          </span>

                          <span className="app-nav-copy">
                            <strong>
                              {label}
                            </strong>

                            <small>
                              {description}
                            </small>
                          </span>

                          {active && (
                            <ChevronRight
                              size={14}
                              className="app-nav-chevron"
                            />
                          )}
                        </Link>
                      );
                    }
                  )}
                </div>
              </section>
            ))}
          </nav>

          <section className="app-wallet-card">
            <div className="app-wallet-heading">
              <span className="app-wallet-icon">
                <Wallet size={15} />
              </span>

              <div>
                <span>
                  AVAILABLE CASH
                </span>

                <small>
                  Simulated wallet
                </small>
              </div>
            </div>

            <strong className="sf-number">
              {formatCurrency(
                walletBalance
              )}
            </strong>

            <button
              type="button"
              onClick={() =>
                setFundModalOpen(true)
              }
            >
              <Plus size={13} />
              Add funds
            </button>
          </section>
        </div>

        <footer className="app-sidebar-footer">
          <Link
            to="/profile"
            className="app-sidebar-profile"
          >
            <span className="app-profile-avatar">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                />
              ) : (
                initials
              )}
            </span>

            <span className="app-profile-copy">
              <strong>
                {user?.name ??
                  "Stockify User"}
              </strong>

              <small>
                @
                {user?.username ??
                  "investor"}
              </small>
            </span>
          </Link>

          <button
            type="button"
            className="app-logout-button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </footer>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button
            type="button"
            className="app-mobile-menu"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            className="app-search-trigger"
            onClick={() =>
              setCommandOpen(true)
            }
          >
            <Search size={15} />

            <span>
              Search stocks, pages and tools
            </span>

            <kbd>
              <span>⌘</span>K
            </kbd>
          </button>

          <div className="app-topbar-actions">
            <button
              type="button"
              className="app-wallet-mobile-button"
              onClick={() =>
                setFundModalOpen(true)
              }
            >
              <Wallet size={15} />

              <span className="sf-number">
                {formatCurrency(
                  walletBalance
                )}
              </span>

              <Plus size={13} />
            </button>

            <div className="app-notification-wrap">
              <button
                type="button"
                className={`app-icon-button ${
                  notificationsOpen
                    ? "app-icon-button-active"
                    : ""
                }`}
                onClick={() =>
                  setNotificationsOpen(
                    (current) => !current
                  )
                }
                aria-label="Notifications"
              >
                <Bell size={17} />

                {unreadCount > 0 && (
                  <span className="app-notification-count">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                open={notificationsOpen}
                onClose={() =>
                  setNotificationsOpen(
                    false
                  )
                }
              />
            </div>

            <Link
              to="/profile"
              className="app-topbar-profile"
              aria-label="Open profile"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                />
              ) : (
                initials
              )}
            </Link>
          </div>
        </header>

        <main className="app-content">
          {children}
        </main>
      </div>

      {fundModalOpen && (
        <FundWalletModal
          onDone={() =>
            setFundModalOpen(false)
          }
        />
      )}

      <CommandPalette
        open={commandOpen}
        onClose={() =>
          setCommandOpen(false)
        }
      />
    </div>
  );
}