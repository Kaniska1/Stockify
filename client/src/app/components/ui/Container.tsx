import type { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Container({ children, className = "", ...props }: ContainerProps) {
  return (
    <div className={`sf-container ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
