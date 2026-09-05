import { cn } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";

function Spinner({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export function SpinnerCustom() {
  return (
    <div className="flex items-center gap-4">
      <Spinner className="size-6 text-[#777777]" />
    </div>
  );
}

export { Spinner };