"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    CalendarDays,
    Check,
    ChevronDown,
    RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { AnalyticsRange } from "@/lib/api/analytics";

interface AnalyticsHeaderProps {
    title: string;
    description: string;
    onRefresh?: () => void;
    refreshing?: boolean;
}

const ranges: {
    value: AnalyticsRange;
    label: string;
}[] = [
        {
            value: "24h",
            label: "Last 24 hours",
        },
        {
            value: "7d",
            label: "Last 7 days",
        },
        {
            value: "30d",
            label: "Last 30 days",
        },
        {
            value: "all",
            label: "All time",
        },
    ];

export function AnalyticsHeader({
    title,
    description,
    onRefresh,
    refreshing = false,
}: AnalyticsHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentRange =
        (searchParams.get("range") as AnalyticsRange | null) ?? "24h";

    const selectedRange =
        ranges.find((range) => range.value === currentRange) ?? ranges[0];

    function handleRangeChange(range: AnalyticsRange) {
        const params = new URLSearchParams(searchParams.toString());

        params.set("range", range);

        router.push(`?${params.toString()}`);
    }

    return (
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold tracking-tight">
                    {title}
                </h1>

                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger
                        render={
                            <Button
                                variant="outline"
                                className="h-9 min-w-[150px] justify-between gap-2 font-normal"
                            >
                                <span className="flex items-center gap-2">
                                    <CalendarDays className="size-4 text-muted-foreground" />
                                    {selectedRange.label}
                                </span>

                                <ChevronDown className="size-4 text-muted-foreground" />
                            </Button>
                        }
                    />

                    <PopoverContent
                        align="end"
                        className="w-[190px] p-1"
                    >
                        {ranges.map((range) => {
                            const selected = range.value === currentRange;

                            return (
                                <button
                                    key={range.value}
                                    type="button"
                                    onClick={() => handleRangeChange(range.value)}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm",
                                        "transition-colors hover:bg-muted",
                                        selected && "bg-muted",
                                    )}
                                >
                                    <span>{range.label}</span>

                                    {selected && (
                                        <Check className="size-4" />
                                    )}
                                </button>
                            );
                        })}
                    </PopoverContent>
                </Popover>

                {onRefresh && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9"
                        onClick={onRefresh}
                        disabled={refreshing}
                        aria-label="Refresh analytics"
                    >
                        <RefreshCw
                            className={cn(
                                "size-4",
                                refreshing && "animate-spin",
                            )}
                        />
                    </Button>
                )}
            </div>
        </div>
    );
}