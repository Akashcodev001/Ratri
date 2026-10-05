import { Skeleton, SkeletonText, SkeletonButton, SkeletonCard } from "../ui/skeleton";

export function HomeSkeleton() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl mx-auto space-y-12">
      
      {/* Hero Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto">
        
        {/* Left Column Skeleton */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 sm:h-14 rounded-xl" />
            <Skeleton className="h-12 w-1/2 sm:h-14 rounded-xl" />
            <SkeletonText lines={2} className="max-w-xl pt-2" />
          </div>

          {/* Creation Card Skeleton */}
          <SkeletonCard className="space-y-5">
            <Skeleton className="h-4 w-36 rounded" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <SkeletonButton className="h-12 w-full rounded-xl" />
          </SkeletonCard>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-6 space-y-6">
          <SkeletonCard className="space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <SkeletonButton className="h-11 w-full rounded-xl" />
          </SkeletonCard>

          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>

      </div>

      {/* Feature Section Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[hsl(var(--border))] pt-8">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>

    </div>
  );
}
