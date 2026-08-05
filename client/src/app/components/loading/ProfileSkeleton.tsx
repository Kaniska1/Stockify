import { Skeleton } from "../ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="profile-loading">
      <div>
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="mt-3 h-9 w-40" />
        <Skeleton className="mt-3 h-2.5 w-80 max-w-full" />
      </div>

      <div className="profile-loading-identity">
        <Skeleton className="h-20 w-20 rounded-2xl" />

        <div className="profile-loading-identity-copy">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-3 h-7 w-44" />
          <Skeleton className="mt-3 h-2.5 w-56" />
          <Skeleton className="mt-2 h-2 w-32" />
        </div>

        <Skeleton className="h-16 w-44 rounded-xl" />
      </div>

      <div className="profile-loading-stats">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <Skeleton
              key={index}
              className="h-28 w-full rounded-2xl"
            />
          )
        )}
      </div>

      <div className="profile-loading-layout">
        <div className="profile-loading-tabs">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </div>
    </div>
  );
}