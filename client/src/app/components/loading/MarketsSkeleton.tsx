import { Skeleton } from "../ui/skeleton";

export default function MarketsSkeleton() {
  return (
    <div className="markets-loading">
      <div className="markets-loading-heading">
        <div>
          <Skeleton className="h-2.5 w-28" />
          <Skeleton className="mt-3 h-9 w-52" />
          <Skeleton className="mt-3 h-2.5 w-80 max-w-full" />
        </div>

        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="markets-loading-summary">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="markets-loading-summary-card"
            >
              <Skeleton className="h-9 w-9 rounded-xl" />

              <div>
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="mt-3 h-6 w-20" />
                <Skeleton className="mt-2 h-2 w-24" />
              </div>
            </div>
          )
        )}
      </div>

      <div className="markets-loading-toolbar">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      <div className="markets-loading-list">
        {Array.from({ length: 8 }).map(
          (_, index) => (
            <div
              key={index}
              className="markets-loading-row"
            >
              <Skeleton className="h-10 w-10 rounded-xl" />

              <div className="markets-loading-company">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-2 w-36" />
              </div>

              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          )
        )}
      </div>
    </div>
  );
}