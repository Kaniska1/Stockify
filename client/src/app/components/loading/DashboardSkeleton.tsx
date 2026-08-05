import { Skeleton } from "../ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="dashboard-loading">
      <div className="dashboard-loading-cards">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="dashboard-loading-card"
            >
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-2.5 w-3/5" />
            </div>
          )
        )}
      </div>

      <div className="dashboard-loading-chart">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-[360px] w-full rounded-2xl" />
      </div>
    </div>
  );
}