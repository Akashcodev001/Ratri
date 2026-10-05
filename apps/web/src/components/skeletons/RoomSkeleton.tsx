import { Skeleton, SkeletonAvatar, SkeletonButton } from "../ui/skeleton";

export function RoomSkeleton() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[hsl(var(--bg))] text-[hsl(var(--text))] overflow-hidden">
      
      {/* Sub-header Skeleton */}
      <div className="h-12 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-4 w-32 rounded hidden sm:block" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonButton className="h-8 w-16 rounded-md" />
          <SkeletonButton className="h-8 w-24 rounded-md hidden sm:block" />
          <SkeletonButton className="h-8 w-16 rounded-md" />
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Stage Container Skeleton */}
        <main className="flex-1 flex flex-col p-4 overflow-y-auto justify-between bg-[hsl(var(--surface-sunken))] relative">
          
          {/* Top Control Bar Skeleton */}
          <div className="mb-3 flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <SkeletonButton className="h-9 w-32 rounded-md" />
          </div>

          {/* Main Stage Viewport Skeleton (Layout-shift safe container) */}
          <div className="flex-1 flex items-center justify-center rounded-xl p-2 border border-[hsl(var(--border))] relative bg-black/60 min-h-[350px]">
            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              <div className="aspect-video bg-[hsl(var(--surface-elevated))] rounded-xl animate-shimmer relative overflow-hidden flex flex-col items-center justify-center p-4">
                <SkeletonAvatar size="lg" className="mb-2" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="aspect-video bg-[hsl(var(--surface-elevated))] rounded-xl animate-shimmer relative overflow-hidden flex flex-col items-center justify-center p-4 hidden sm:flex">
                <SkeletonAvatar size="lg" className="mb-2" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </div>
          </div>

          {/* Bottom Dock Control Skeleton */}
          <div className="mt-3 h-14 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <SkeletonButton className="h-8 w-20 rounded-md" />
              <SkeletonButton className="h-8 w-20 rounded-md" />
              <SkeletonButton className="h-8 w-28 rounded-md" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
          </div>

        </main>

        {/* Side Chat Drawer Skeleton */}
        <aside className="w-80 border-l border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col h-full shrink-0 hidden lg:flex">
          <div className="p-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <div className="p-3 border-b border-[hsl(var(--border))] space-y-2">
            <Skeleton className="h-7 w-full rounded" />
            <Skeleton className="h-7 w-full rounded" />
          </div>
          <div className="flex-1 p-3 space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="p-3 border-t border-[hsl(var(--border))] flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <SkeletonButton className="h-9 w-10 rounded-md" />
          </div>
        </aside>

      </div>

    </div>
  );
}
