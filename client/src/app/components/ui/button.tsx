import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  to?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  className = "",
  ...props
}: ButtonProps) {
  const classes = `sf-button sf-button-${variant} sf-button-${size} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
