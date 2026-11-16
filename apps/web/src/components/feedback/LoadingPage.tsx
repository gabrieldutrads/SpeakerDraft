import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Loading Page (Suspense fallback for lazy routes)
   ========================================================================== */

export function LoadingPage({ className, message = 'Carregando...' }: { className?: string; message?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[400px] p-6', className)} role="status" aria-live="polite">
      <div className="relative mb-4">
        <div className="spinner-lg mx-auto" aria-hidden="true" />
      </div>
      <p className="text-secondary text-center max-w-sm">{message}</p>
    </div>
  );
}

/* ==========================================================================
   Page Skeleton (for content loading states)
   ========================================================================== */

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-label="Loading content">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-4 w-64 rounded" />
        </div>
        <div className="skeleton h-10 w-24 rounded-lg" />
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   Card Skeleton
   ========================================================================== */

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card p-4 space-y-3', className)} aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-1">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="skeleton h-32 w-full rounded-lg" />
      <div className="flex items-center gap-2">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-24 rounded ml-auto" />
      </div>
    </div>
  );
}

/* ==========================================================================
   List Skeleton
   ========================================================================== */

export function ListSkeleton({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} aria-busy="true" aria-label="Loading list">
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 card">
          <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1 min-w-0">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   Table Skeleton
   ========================================================================== */

export function TableSkeleton({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn('card overflow-hidden', className)} aria-busy="true" aria-label="Loading table">
      {/* Header skeleton */}
      <div className="grid gap-4 p-4 border-b border-border" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="skeleton h-4 w-3/4 rounded" />
        ))}
      </div>

      {/* Row skeletons */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <div key={colIndex} className="skeleton h-5 w-full rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   Button Loading State
   ========================================================================== */

export function LoadingButton({
  loading = false,
  children,
  className,
  spinnerSize = 'sm',
  ...props
}: {
  loading?: boolean;
  children: ReactNode;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  [key: string]: unknown;
}) {
  return (
    <button
      className={cn('btn relative', className)}
      disabled={loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="flex items-center justify-center gap-2">
          <span className={cn('spinner', spinnerSize !== 'md' && `spinner-${spinnerSize}`)} aria-hidden="true" />
          <span className="sr-only">Loading...</span>
        </span>
      )}
      {!loading && children}
    </button>
  );
}

/* ==========================================================================
   Inline Loading
   ========================================================================== */

export function InlineLoading({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <span className={cn('spinner inline-block', size !== 'md' && `spinner-${size}`, className)} aria-hidden="true" />
  );
}

/* ==========================================================================
   Full Screen Loading
   ========================================================================== */

export function FullScreenLoading({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="text-center">
        <div className="spinner-lg mx-auto mb-4" aria-hidden="true" />
        <p className="text-secondary">{message}</p>
      </div>
    </div>
  );
}