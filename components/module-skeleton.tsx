import { Skeleton } from "@/components/ui/skeleton";

export function ModuleSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-[300px] rounded-xl w-full" />
        </div>
        <div className="lg:col-span-1 space-y-4">
          <Skeleton className="h-[300px] rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}

export function TodoSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-3 lg:gap-6 lg:p-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-[130px] rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-[130px] rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-[100px] rounded-xl" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:overflow-hidden">
        {/* Left Side: List */}
        <div className="lg:w-[60%] space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>

        {/* Right Side: Analytics */}
        <div className="lg:w-[40%] space-y-4">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
