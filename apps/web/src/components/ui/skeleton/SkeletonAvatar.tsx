import { Skeleton } from "./Skeleton";

interface SkeletonAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

export function SkeletonAvatar({ size = "md", className = "" }: SkeletonAvatarProps) {
  return (
    <Skeleton
      className={`rounded-full shrink-0 ${SIZE_CLASSES[size]} ${className}`}
    />
  );
}
