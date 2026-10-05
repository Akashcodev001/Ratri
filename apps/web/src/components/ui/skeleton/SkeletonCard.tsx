import { Skeleton } from "./Skeleton";

interface SkeletonCardProps {
  children?: React.ReactNode;
  className?: string;
}

export function SkeletonCard({ children, className = "" }: SkeletonCardProps) {
  return (
    <div className={`rat-card p-6 border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] ${className}`}>
      {children || <Skeleton className="w-full h-32 rounded-xl" />}
    </div>
  );
}
