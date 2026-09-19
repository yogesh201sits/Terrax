"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { AnalyticsTrendPoint } from "@/lib/api/analytics";

interface AnalyticsTrendProps {
  data: AnalyticsTrendPoint[];
  title?: string;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDuration(value: number) {
  if (value < 1000) {
    return `${Math.round(value)}ms`;
  }

  return `${(value / 1000).toFixed(1)}s`;
}

export function AnalyticsTrend({
  data,
  title = "Execution Trend",
}: AnalyticsTrendProps) {
  if (data.length === 0) {
    return (
      <Card className="rounded-lg border shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No activity in the selected period.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((point) => ({
    ...point,
    label: formatDate(point.timestamp),
  }));

  return (
    <Card className="rounded-lg border shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-medium">
            {title}
          </CardTitle>

          <p className="mt-1 text-xs text-muted-foreground">
            Agent activity over time
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-2 pb-4 sm:px-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 12,
                right: 12,
                left: -12,
                bottom: 4,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                fontSize={11}
                className="fill-muted-foreground"
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                fontSize={11}
                className="fill-muted-foreground"
              />

              <Tooltip
                cursor={{
                  className: "stroke-border",
                }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const point = payload[0]?.payload as
                    | AnalyticsTrendPoint & { label: string }
                    | undefined;

                  if (!point) {
                    return null;
                  }

                  return (
                    <div className="min-w-[160px] rounded-md border bg-background p-3 text-xs shadow-md">
                      <p className="mb-2 font-medium">
                        {label}
                      </p>

                      <div className="space-y-1.5">
                        <div className="flex justify-between gap-6">
                          <span className="text-muted-foreground">
                            Runs
                          </span>
                          <span className="font-medium">
                            {point.runs?.toLocaleString() ?? 0}
                          </span>
                        </div>

                        <div className="flex justify-between gap-6">
                          <span className="text-muted-foreground">
                            Successful
                          </span>
                          <span className="font-medium">
                            {point.successfulRuns?.toLocaleString() ?? 0}
                          </span>
                        </div>

                        <div className="flex justify-between gap-6">
                          <span className="text-muted-foreground">
                            Failed
                          </span>
                          <span className="font-medium">
                            {point.failedRuns?.toLocaleString() ?? 0}
                          </span>
                        </div>

                        <div className="flex justify-between gap-6">
                          <span className="text-muted-foreground">
                            Avg duration
                          </span>
                          <span className="font-medium">
                            {formatDuration(point.avgDuration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              <Line
                type="monotone"
                dataKey="runs"
                stroke="currentColor"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                }}
                className="text-foreground"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}