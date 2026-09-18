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
  description,
  icon: Icon,
  trend,
  className,
}: AnalyticsStatProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border shadow-none",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {label}
            </p>

            <p className="text-2xl font-semibold tracking-tight">
              {value}
            </p>
          </div>

          <div className="flex size-8 items-center justify-center rounded-md border bg-muted/40">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>

        {(description || trend) && (
          <div className="mt-4 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.positive === false
                    ? "text-destructive"
                    : "text-emerald-600",
                )}
              >
                {trend.value}
              </span>
            )}

            {description && (
              <span className="text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}