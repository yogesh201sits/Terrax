import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Spinner className="size-8 text-[#777777]" />
    </div>
  );
}