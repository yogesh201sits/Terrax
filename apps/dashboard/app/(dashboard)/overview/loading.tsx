import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="min-h-full bg-[#f2f2f2] p-6">
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-[#777777]">
          <Spinner className="size-4" />
          <span>Loading overview...</span>
        </div>
      </div>
    </div>
  );
}