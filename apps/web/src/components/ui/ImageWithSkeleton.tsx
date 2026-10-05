import React, { useState } from "react";
import { Skeleton } from "./skeleton/Skeleton";

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  containerClassName?: string;
}

export function ImageWithSkeleton({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  fallbackText = "Image unavailable",
  ...props
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {(!loaded && !error) && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-inherit z-10" />
      )}
      
      {error ? (
        <div className="w-full h-full min-h-[100px] bg-[hsl(var(--surface-sunken))] border border-[hsl(var(--border))] rounded-lg flex items-center justify-center p-3 text-center text-xs text-[hsl(var(--text-muted))]">
          <span>{fallbackText}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
