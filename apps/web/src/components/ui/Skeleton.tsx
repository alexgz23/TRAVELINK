import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  className,
  ...props
}: SkeletonProps) {
  const baseStyles = 'bg-gray-200 dark:bg-gray-700';

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
    none: '',
  };

  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '200px'),
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], animations[animation], className)}
      style={style}
      {...props}
    />
  );
}

// Pre-built skeleton components
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Skeleton height="200px" className="rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="50%" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="20%" />
        </div>
      </div>
    </div>
  );
}

export function ExperienceCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Skeleton height="250px" className="rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton variant="text" width="80%" height="24px" />
        <Skeleton variant="text" width="60%" />
        <div className="flex items-center gap-4 mt-4">
          <Skeleton variant="text" width="80px" />
          <Skeleton variant="text" width="100px" />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton variant="circular" width="48px" height="48px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="text" width="20%" />
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="15%" />
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="10%" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-6 mb-6">
        <Skeleton variant="circular" width="96px" height="96px" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="40%" height="24px" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="95%" />
      </div>
    </div>
  );
}
