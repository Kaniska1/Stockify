import { Skeleton } from "../ui/skeleton";

export default function PortfolioAnalyzerSkeleton() {
  return (
    <div className="analyzer-loading">
      <div className="analyzer-loading-heading">
        <div>
          <Skeleton className="h-2.5 w-28" />
          <Skeleton className="mt-3 h-9 w-60" />
          <Skeleton className="mt-3 h-2.5 w-96 max-w-full" />
        </div>

        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>

      <div className="analyzer-loading-summary">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="analyzer-loading-summary-card"
            >
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="mt-3 h-8 w-24" />
              <Skeleton className="mt-2 h-2 w-28" />
            </div>
          )
        )}
      </div>

      <div className="analyzer-loading-hero">
        <div className="analyzer-loading-score">
          <Skeleton className="h-40 w-40 rounded-full" />

          <div className="analyzer-loading-score-copy">
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="mt-3 h-7 w-52" />
            <Skeleton className="mt-3 h-2.5 w-full" />
            <Skeleton className="mt-2 h-2.5 w-4/5" />
          </div>
        </div>

        <Skeleton className="h-[220px] w-full rounded-2xl" />
      </div>

      <div className="analyzer-loading-cards">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <Skeleton
              key={index}
              className="h-40 w-full rounded-2xl"
            />
          )
        )}
      </div>
    </div>
  );
}