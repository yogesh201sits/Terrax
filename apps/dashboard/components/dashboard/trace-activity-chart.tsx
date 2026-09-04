"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import type { TraceSummary } from "@/types/traces";

type Props = {
  traces: TraceSummary[];
};

type ActivityPoint = {
  time: string;
  traces: number;
};

const chartConfig = {
  traces: {
    label: "Traces",
  },
} satisfies ChartConfig;

function buildActivityData(
  traces: TraceSummary[],
): ActivityPoint[] {
  const buckets = new Map<string, number>();

  for (const trace of traces) {
    const date = new Date(trace.createdAt);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hour = date.getHours();

    const key = `${year}-${month}-${day}-${hour}`;

    buckets.set(
      key,
      (buckets.get(key) ?? 0) + 1,
    );
  }

  return Array.from(buckets.entries())
    .sort(([first], [second]) =>
      first.localeCompare(second),
    )
    .map(([key, count]) => {
      const [year, month, day, hour] = key
        .split("-")
        .map(Number);

      const date = new Date(
        year,
        month,
        day,
        hour,
      );

      return {
        time: date.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "numeric",
        }),
        traces: count,
      };
    });
}

export function TraceActivityChart({ traces }: Props) {
  const chartData = buildActivityData(traces);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trace Activity</CardTitle>

        <CardDescription>
          Number of traces processed over time
        </CardDescription>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No trace activity available.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[280px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 20,
                right: 20,
                top: 15,
                bottom: 20,
              }}
            >
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Time",
                  position: "insideBottom",
                  offset: -10,
                }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Number of Traces",
                  angle: -90,
                  position: "insideLeft",
                  offset: 5,
                }}
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />

              <Area
                dataKey="traces"
                type="monotone"
                fill="var(--color-traces)"
                fillOpacity={0.15}
                stroke="var(--color-traces)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}