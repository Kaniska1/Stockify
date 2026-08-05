import { Skeleton } from "../ui/skeleton";

export default function AISkeleton() {
  return (
    <div className="ai-loading">
      <div className="ai-loading-heading">
        <div>
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-3 h-9 w-56" />
          <Skeleton className="mt-3 h-2.5 w-80 max-w-full" />
        </div>

        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      <div className="ai-loading-layout">
        <aside className="ai-loading-sidebar">
          <Skeleton className="h-12 w-full rounded-xl" />

          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="ai-loading-prompt"
              >
                <Skeleton className="h-8 w-8 rounded-lg" />

                <div className="ai-loading-prompt-copy">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="mt-2 h-2 w-full" />
                </div>
              </div>
            )
          )}
        </aside>

        <section className="ai-loading-chat">
          <div className="ai-loading-messages">
            <div className="ai-loading-message ai-loading-message-user">
              <Skeleton className="h-16 w-3/5 rounded-2xl" />
            </div>

            <div className="ai-loading-message">
              <Skeleton className="h-36 w-4/5 rounded-2xl" />
            </div>

            <div className="ai-loading-message ai-loading-message-user">
              <Skeleton className="h-14 w-1/2 rounded-2xl" />
            </div>

            <div className="ai-loading-message">
              <Skeleton className="h-44 w-5/6 rounded-2xl" />
            </div>
          </div>

          <div className="ai-loading-input">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </section>
      </div>
    </div>
  );
}