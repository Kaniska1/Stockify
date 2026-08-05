import { Link } from "react-router";
import stockifyLogo from "../../../assets/stockify-logo.svg";

interface LogoProps {
  to?: string;
  compact?: boolean;
  showTagline?: boolean;
}

export default function Logo({
  to = "/",
  compact = false,
  showTagline = true,
}: LogoProps) {
  const content = (
    <span
      className={`sf-logo ${
        compact ? "sf-logo-compact" : ""
      }`}
    >
      <span className="sf-logo-mark">
        <img
          src={stockifyLogo}
          alt=""
          aria-hidden="true"
        />
      </span>

      {!compact && (
        <>
          <span className="sf-logo-word">
            Stockify
          </span>

          {showTagline && (
            <>
              <span
                className="sf-logo-divider"
                aria-hidden="true"
              />

              <span className="sf-logo-tagline">
                Market intelligence
              </span>
            </>
          )}
        </>
      )}
    </span>
  );

  return to ? (
    <Link
      to={to}
      className="sf-logo-link"
      aria-label="Stockify home"
    >
      {content}
    </Link>
  ) : (
    content
  );
}