import type { HTMLAttributes, ReactNode } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
}

export default function GlassPanel({
  children,
  glow = false,
  className = "",
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={`sf-glass-panel ${glow ? "sf-glass-panel-glow" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
