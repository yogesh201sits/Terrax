import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsStatProps {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
}

export function AnalyticsStat({
  label,
  value,
  icon: Icon,
  className,
}: AnalyticsStatProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border shadow-none",
        className,
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {label}
            </p>

            <p className="text-xl font-semibold tracking-tight">
              {value}
            </p>
          </div>

          <div className="flex size-8 items-center justify-center rounded-md border bg-muted/40">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}