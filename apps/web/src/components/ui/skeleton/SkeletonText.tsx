import { Skeleton } from "./Skeleton";

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

const WIDTH_CLASSES = ["w-full", "w-11/12", "w-4/5", "w-3/4", "w-5/6"];

export function SkeletonText({ lines = 3, className = "" }: SkeletonTextProps) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        const widthClass = WIDTH_CLASSES[index % WIDTH_CLASSES.length];
        return (
          <Skeleton
            key={index}
            className={`h-3.5 ${index === lines - 1 && lines > 1 ? "w-2/3" : widthClass}`}
          />
        );
      })}
    </div>
  );
}
