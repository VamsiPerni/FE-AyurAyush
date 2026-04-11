const Skeleton = ({ className = '' }) => (
  <div className={`bg-neutral-200 dark:bg-dark-elevated rounded-lg animate-pulse ${className}`} />
);

const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white dark:bg-dark-card rounded-2xl border border-neutral-100 dark:border-dark-border p-5 ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-dark-card rounded-2xl border border-neutral-100 dark:border-dark-border p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
    ))}
  </div>
);

const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white dark:bg-dark-card rounded-2xl border border-neutral-100 dark:border-dark-border overflow-hidden">
    <div className="border-b border-neutral-100 dark:border-dark-border bg-neutral-50/50 dark:bg-dark-surface/50 p-4 flex gap-4">
      {Array.from({ length: columns }).map((_, i) => <Skeleton key={i} className="h-4 flex-1" />)}
    </div>
    <div className="divide-y divide-neutral-50 dark:divide-dark-border-subtle">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4">
          {Array.from({ length: columns }).map((_, j) => <Skeleton key={j} className="h-4 flex-1" />)}
        </div>
      ))}
    </div>
  </div>
);

export { Skeleton, CardSkeleton, StatsSkeleton, TableSkeleton };
export default Skeleton;
