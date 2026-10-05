import { Skeleton } from "./Skeleton";

interface SkeletonButtonProps {
  className?: string;
}

export function SkeletonButton({ className = "" }: SkeletonButtonProps) {
  return <Skeleton className={`h-9 w-24 rounded-md ${className}`} />;
}
