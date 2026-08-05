import { Skeleton } from "../ui/skeleton";

export default function StockDetailSkeleton() {
  return (
    <div className="stock-detail-loading">
      <Skeleton className="h-3 w-20" />

      <div className="stock-detail-loading-header">
        <div className="stock-detail-loading-identity">
          <Skeleton className="h-14 w-14 rounded-2xl" />

          <div>
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="mt-3 h-8 w-52" />
            <Skeleton className="mt-3 h-2.5 w-32" />
          </div>
        </div>

        <div className="stock-detail-loading-actions">
          <Skeleton className="h-10 w-20 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      <div className="stock-detail-loading-grid">
        <div className="stock-detail-loading-chart">
          <div className="stock-detail-loading-chart-heading">
            <div>
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="mt-3 h-10 w-36" />
              <Skeleton className="mt-3 h-2.5 w-28" />
            </div>

            <Skeleton className="h-9 w-56 rounded-xl" />
          </div>

          <Skeleton className="mt-6 h-[360px] w-full rounded-2xl" />
        </div>

        <div className="stock-detail-loading-stats">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-5 w-32" />

          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="stock-detail-loading-stat-row"
              >
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}