import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({
  className = "",
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`bg-[hsl(var(--surface-elevated))] rounded-lg ${
        shimmer ? "animate-shimmer" : ""
      } ${className}`}
      {...props}
    />
  );
}
