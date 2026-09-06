import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-5">
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Trace Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 w-full">
            {/* Title + Status */}
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>

            {/* Trace ID */}
            <div className="mt-3">
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Timing */}
        <div className="mt-3 flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-px w-8" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="ml-1 h-3 w-16" />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 space-y-4">
        <Skeleton className="h-5 w-24" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>

      {/* Execution */}
      <div className="mb-6 space-y-4">
        <Skeleton className="h-5 w-28" />

        <div className="rounded-lg border p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-[90%]" />
          <Skeleton className="h-10 w-[80%]" />
          <Skeleton className="h-10 w-[70%]" />
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Graph */}
      <div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
