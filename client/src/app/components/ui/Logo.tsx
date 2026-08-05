import { TrendingUp } from "lucide-react";
import { Link } from "react-router";

interface LogoProps {
  to?: string;
  compact?: boolean;
}

export default function Logo({ to = "/", compact = false }: LogoProps) {
  const content = (
    <span className="sf-logo">
      <span className="sf-logo-mark" aria-hidden="true">
        <TrendingUp size={compact ? 14 : 17} strokeWidth={2.4} />
      </span>
      {!compact && <span className="sf-logo-word">Stockify</span>}
    </span>
  );

  return to ? (
    <Link to={to} className="sf-logo-link" aria-label="Stockify home">
      {content}
    </Link>
  ) : (
    content
  );
}
