import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-24" />

        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      {/* Trace table */}
      <div className="space-y-3">
        {/* Table header */}
        <div className="flex items-center gap-4 rounded-lg border px-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Rows */}
        <div className="rounded-lg border">
          <div className="flex items-center gap-4 border-b px-4 py-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex items-center gap-4 border-b px-4 py-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex items-center gap-4 border-b px-4 py-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex items-center gap-4 border-b px-4 py-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex items-center gap-4 px-4 py-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
