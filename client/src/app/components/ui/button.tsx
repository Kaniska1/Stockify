import type { ReactNode } from "react";

type BadgeVariant =
  | "neutral"
  | "purple"
  | "success"
  | "danger"
  | "warning"
  | "info";

type BadgeSize =
  | "sm"
  | "md";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "sf-badge",
        `sf-badge-${variant}`,
        `sf-badge-${size}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {dot && (
        <span className="sf-badge-dot" />
      )}

      {children}
    </span>
  );
}