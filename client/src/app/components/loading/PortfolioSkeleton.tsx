import { Skeleton } from "../ui/skeleton";

export default function PortfolioSkeleton() {
  return (
    <div className="portfolio-loading">
      <div className="portfolio-loading-heading">
        <div>
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-3 h-9 w-44" />
          <Skeleton className="mt-3 h-2.5 w-72 max-w-full" />
        </div>

        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      <div className="portfolio-loading-summary">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="portfolio-loading-summary-card"
            >
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="mt-3 h-8 w-28" />
              <Skeleton className="mt-3 h-2 w-16" />
            </div>
          )
        )}
      </div>

      <div className="portfolio-loading-layout">
        <div className="portfolio-loading-table">
          <div className="portfolio-loading-table-header">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>

          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="portfolio-loading-row"
              >
                <Skeleton className="h-10 w-10 rounded-xl" />

                <div className="portfolio-loading-company">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-2 w-32" />
                </div>

                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            )
          )}
        </div>

        <div className="portfolio-loading-side">
          <Skeleton className="h-[260px] w-full rounded-2xl" />
          <Skeleton className="h-[190px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}