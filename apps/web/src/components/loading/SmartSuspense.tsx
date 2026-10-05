import React, { Suspense, useState, useEffect } from "react";
import { LOADING_CONFIG } from "../../config/loading";

interface SmartSuspenseProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

function DelayedFallback({ fallback }: { fallback: React.ReactNode }) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    // Only display skeleton fallback if loading exceeds the threshold (150ms)
    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, LOADING_CONFIG.skeletonDelay);

    return () => clearTimeout(timer);
  }, []);

  if (!showSkeleton) {
    return null;
  }

  return <>{fallback}</>;
}

export function SmartSuspense({ fallback, children }: SmartSuspenseProps) {
  return (
    <Suspense fallback={<DelayedFallback fallback={fallback} />}>
      {children}
    </Suspense>
  );
}
