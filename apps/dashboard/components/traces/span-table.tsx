"use client";

import Link from "next/link";
import {
  AlertCircle,
  Bot,
  Braces,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileCode2,
  GitBranch,
  Globe,
  Hash,
  Search,
  Sparkles,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  TraceSpan,
  TraceTreeNode,
} from "@/types/trace-detail";

type SpanTableProps = {
  spans: TraceSpan[];
  projectId: string;
};

type SpanType = TraceSpan["type"];

type FilterValue =
  | "all"
  | SpanType;

const TYPE_CONFIG: Record<
  SpanType,
  {
    label: string;
    icon: typeof Bot;
  }
> = {
  workflow: {
    label: "Workflow",
    icon: GitBranch,
  },
  workflow_node: {
    label: "Workflow Node",
    icon: Zap,
  },
  llm: {
    label: "LLM",
    icon: Sparkles,
  },
  tool: {
    label: "Tool",
    icon: Wrench,
  },
  generic: {
    label: "Generic",
    icon: Braces,
  },
};

export function SpanTable({
  spans,
  projectId,
}: SpanTableProps) {
  const [selectedSpanId, setSelectedSpanId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<FilterValue>("all");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "ok" | "error">("all");

  const [selectedIds, setSelectedIds] =
    useState<Set<string>>(new Set());

  const selectedSpan = useMemo(
    () =>
      spans.find(
        (span) => span.spanId === selectedSpanId,
      ) ?? null,
    [spans, selectedSpanId],
  );

  const filteredSpans = useMemo(() => {
    const query = search.trim().toLowerCase();

    return spans.filter((span) => {
      const matchesSearch =
        !query ||
        span.name.toLowerCase().includes(query) ||
        span.spanId.toLowerCase().includes(query) ||
        span.traceId.toLowerCase().includes(query) ||
        span.provider?.toLowerCase().includes(query) ||
        span.model?.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "all" ||
        span.type === typeFilter;

      const isError = Boolean(
        span.errorMessage ||
          span.errorType ||
          span.status?.toLowerCase() === "error" ||
          span.status?.toLowerCase() === "failed",
      );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "error" && isError) ||
        (statusFilter === "ok" && !isError);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    spans,
    search,
    typeFilter,
    statusFilter,
  ]);

  const allFilteredSelected =
    filteredSpans.length > 0 &&
    filteredSpans.every((span) =>
      selectedIds.has(span.spanId),
    );

  function toggleSpan(spanId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(spanId)) {
        next.delete(spanId);
      } else {
        next.add(spanId);
      }

      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (allFilteredSelected) {
        filteredSpans.forEach((span) =>
          next.delete(span.spanId),
        );
      } else {
        filteredSpans.forEach((span) =>
          next.add(span.spanId),
        );
      }

      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* ------------------------------------------------------------------ */}
      {/* Toolbar                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="border-b">
        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold">
              Spans
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Individual operations across your AI
              agent executions.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {filteredSpans.length}{" "}
              {filteredSpans.length === 1
                ? "span"
                : "spans"}
            </span>

            {selectedIds.size > 0 && (
              <>
                <span className="text-muted-foreground/40">
                  ·
                </span>

                <span className="font-medium text-foreground">
                  {selectedIds.size} selected
                </span>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 border-t bg-muted/10 px-4 py-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1 md:max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search spans..."
              className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
            />
          </div>

          {/* Type */}
          <FilterSelect
            value={typeFilter}
            onChange={(value) =>
              setTypeFilter(value as FilterValue)
            }
            options={[
              { value: "all", label: "All types" },
              {
                value: "workflow",
                label: "Workflow",
              },
              {
                value: "workflow_node",
                label: "Workflow node",
              },
              {
                value: "llm",
                label: "LLM",
              },
              {
                value: "tool",
                label: "Tool",
              },
              {
                value: "generic",
                label: "Generic",
              },
            ]}
          />

          {/* Status */}
          <FilterSelect
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(
                value as "all" | "ok" | "error",
              )
            }
            options={[
              {
                value: "all",
                label: "All status",
              },
              {
                value: "ok",
                label: "Successful",
              },
              {
                value: "error",
                label: "Errors",
              },
            ]}
          />

          {(search ||
            typeFilter !== "all" ||
            statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="relative">
        <div
          className={[
            "overflow-x-auto transition-[margin] duration-200",
            selectedSpan
              ? "lg:ml-[420px]"
              : "",
          ].join(" ")}
        >
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b bg-muted/20 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="w-10 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={[
                      "flex size-4 items-center justify-center rounded border transition-colors",
                      allFilteredSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:border-foreground/40",
                    ].join(" ")}
                    aria-label="Select all spans"
                  >
                    {allFilteredSelected && (
                      <Check className="size-3" />
                    )}
                  </button>
                </th>

                <th className="px-3 py-2.5">
                  Span
                </th>

                <th className="px-3 py-2.5">
                  Type
                </th>

                <th className="px-3 py-2.5">
                  Status
                </th>

                <th className="px-3 py-2.5">
                  Model
                </th>

                <th className="px-3 py-2.5 text-right">
                  Tokens
                </th>

                <th className="px-3 py-2.5 text-right">
                  Duration
                </th>

                <th className="px-3 py-2.5">
                  Trace
                </th>

                <th className="px-4 py-2.5">
                  Started
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSpans.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-16 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-muted/20">
                        <Search className="size-4 text-muted-foreground" />
                      </div>

                      <p className="text-sm font-medium">
                        No spans found
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Try changing your search or
                        filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSpans.map((span) => {
                  const isSelected =
                    span.spanId === selectedSpanId;

                  const isChecked =
                    selectedIds.has(span.spanId);

                  return (
                    <SpanRow
                      key={span.spanId}
                      span={span}
                      projectId={projectId}
                      selected={isSelected}
                      checked={isChecked}
                      onSelect={() =>
                        setSelectedSpanId(
                          span.spanId,
                        )
                      }
                      onToggle={() =>
                        toggleSpan(span.spanId)
                      }
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Left detail panel                                               */}
        {/* ---------------------------------------------------------------- */}

        {selectedSpan && (
          <SpanDetailPanel
            span={selectedSpan}
            projectId={projectId}
            onClose={() =>
              setSelectedSpanId(null)
            }
          />
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Row                                                                        */
/* ========================================================================== */

function SpanRow({
  span,
  projectId,
  selected,
  checked,
  onSelect,
  onToggle,
}: {
  span: TraceSpan;
  projectId: string;
  selected: boolean;
  checked: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const isError = getSpanError(span);

  const typeConfig =
    TYPE_CONFIG[span.type];

  const Icon = typeConfig.icon;

  return (
    <tr
      className={[
        "group border-b last:border-0 transition-colors",
        selected
          ? "bg-muted/60"
          : "hover:bg-muted/30",
      ].join(" ")}
    >
      {/* Checkbox */}
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          className={[
            "flex size-4 items-center justify-center rounded border transition-colors",
            checked
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background hover:border-foreground/40",
          ].join(" ")}
          aria-label={`Select ${span.name}`}
        >
          {checked && (
            <Check className="size-3" />
          )}
        </button>
      </td>

      {/* Span */}
      <td className="px-3 py-3">
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 max-w-[280px] items-center gap-2 text-left"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background">
            <Icon className="size-3.5 text-muted-foreground" />
          </span>

          <span className="min-w-0">
            <span className="block truncate text-xs font-medium text-foreground group-hover:underline group-hover:underline-offset-2">
              {span.name}
            </span>

            <span className="mt-0.5 block truncate font-mono text-[9px] text-muted-foreground">
              {span.spanId}
            </span>
          </span>
        </button>
      </td>

      {/* Type */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center rounded-md border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground">
          {typeConfig.label}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <StatusCell error={isError} />
      </td>

      {/* Model */}
      <td className="max-w-[180px] px-3 py-3">
        {span.model ? (
          <div className="min-w-0">
            <div className="truncate text-xs font-medium">
              {span.model}
            </div>

            {span.provider && (
              <div className="mt-0.5 truncate text-[9px] text-muted-foreground">
                {span.provider}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50">
            —
          </span>
        )}
      </td>

      {/* Tokens */}
      <td className="px-3 py-3 text-right">
        {span.totalTokens !== undefined ? (
          <span className="font-mono text-xs tabular-nums">
            {formatNumber(span.totalTokens)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">
            —
          </span>
        )}
      </td>

      {/* Duration */}
      <td className="px-3 py-3 text-right">
        <span className="font-mono text-xs tabular-nums">
          {formatDuration(span.durationMs)}
        </span>
      </td>

      {/* Trace */}
      <td className="px-3 py-3">
        <Link
          href={`/traces/${encodeURIComponent(
            span.traceId,
          )}?projectId=${encodeURIComponent(
            projectId,
          )}`}
          onClick={(event) =>
            event.stopPropagation()
          }
          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 font-mono text-[9px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Hash className="size-3" />

          {shortId(span.traceId)}
        </Link>
      </td>

      {/* Started */}
      <td className="whitespace-nowrap px-4 py-3">
        <span className="text-[10px] text-muted-foreground">
          {formatRelativeTime(span.startTime)}
        </span>
      </td>
    </tr>
  );
}

/* ========================================================================== */
/* Detail Panel                                                               */
/* ========================================================================== */

function SpanDetailPanel({
  span,
  projectId,
  onClose,
}: {
  span: TraceSpan;
  projectId: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<
    "overview" | "input" | "output" | "details"
  >("overview");

  const isError = getSpanError(span);

  return (
    <aside className="absolute inset-y-0 left-0 z-20 w-full border-r bg-background shadow-xl lg:w-[420px]">
      {/* Header */}
      <div className="flex h-[72px] items-start justify-between border-b px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/20">
              {(() => {
                const Icon =
                  TYPE_CONFIG[span.type].icon;

                return (
                  <Icon className="size-3.5 text-muted-foreground" />
                );
              })()}
            </span>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">
                {span.name}
              </h3>

              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                {TYPE_CONFIG[span.type].label}

                {span.model
                  ? ` · ${span.model}`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="ml-3 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close span details"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-3">
        <DetailTab
          active={tab === "overview"}
          onClick={() => setTab("overview")}
        >
          Overview
        </DetailTab>

        <DetailTab
          active={tab === "input"}
          onClick={() => setTab("input")}
        >
          Input
        </DetailTab>

        <DetailTab
          active={tab === "output"}
          onClick={() => setTab("output")}
        >
          Output
        </DetailTab>

        <DetailTab
          active={tab === "details"}
          onClick={() => setTab("details")}
        >
          Details
        </DetailTab>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-113px)] overflow-y-auto">
        {tab === "overview" && (
          <OverviewContent
            span={span}
            isError={isError}
          />
        )}

        {tab === "input" && (
          <JsonPanel
            title={
              span.type === "tool"
                ? "Tool input"
                : "Prompt"
            }
            value={span.prompt ?? span.toolInput}
            emptyLabel="No input captured."
          />
        )}

        {tab === "output" && (
          <JsonPanel
            title={
              span.type === "tool"
                ? "Tool output"
                : "Completion"
            }
            value={
              span.completion ??
              span.toolOutput
            }
            emptyLabel="No output captured."
          />
        )}

        {tab === "details" && (
          <DetailsContent span={span} />
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-3">
        <Link
          href={`/traces/${encodeURIComponent(
            span.traceId,
          )}?projectId=${encodeURIComponent(
            projectId,
          )}`}
          className="flex h-8 items-center justify-center gap-2 rounded-md border bg-background text-xs font-medium transition-colors hover:bg-muted"
        >
          Open trace
          <ExternalLink className="size-3.5" />
        </Link>
      </div>
    </aside>
  );
}

/* ========================================================================== */
/* Overview                                                                   */
/* ========================================================================== */

function OverviewContent({
  span,
  isError,
}: {
  span: TraceSpan;
  isError: boolean;
}) {
  return (
    <div className="space-y-5 p-4 pb-20">
      <section>
        <SectionLabel>
          Execution
        </SectionLabel>

        <div className="overflow-hidden rounded-md border">
          <InfoRow
            label="Status"
            value={
              <StatusCell error={isError} />
            }
          />

          <InfoRow
            label="Duration"
            value={
              <span className="font-mono text-xs">
                {formatDuration(
                  span.durationMs,
                )}
              </span>
            }
          />

          <InfoRow
            label="Started"
            value={
              <span className="text-xs">
                {formatDateTime(
                  span.startTime,
                )}
              </span>
            }
          />

          <InfoRow
            label="Type"
            value={
              <span className="text-xs">
                {TYPE_CONFIG[span.type].label}
              </span>
            }
          />
        </div>
      </section>

      {(span.model ||
        span.provider ||
        span.totalTokens !== undefined) && (
        <section>
          <SectionLabel>
            Generation
          </SectionLabel>

          <div className="overflow-hidden rounded-md border">
            {span.provider && (
              <InfoRow
                label="Provider"
                value={
                  <span className="text-xs">
                    {span.provider}
                  </span>
                }
              />
            )}

            {span.model && (
              <InfoRow
                label="Model"
                value={
                  <span className="text-xs font-medium">
                    {span.model}
                  </span>
                }
              />
            )}

            {span.totalTokens !== undefined && (
              <InfoRow
                label="Total tokens"
                value={
                  <span className="font-mono text-xs tabular-nums">
                    {formatNumber(
                      span.totalTokens,
                    )}
                  </span>
                }
              />
            )}

            {span.inputTokens !== undefined && (
              <InfoRow
                label="Input tokens"
                value={
                  <span className="font-mono text-xs tabular-nums">
                    {formatNumber(
                      span.inputTokens,
                    )}
                  </span>
                }
              />
            )}

            {span.outputTokens !== undefined && (
              <InfoRow
                label="Output tokens"
                value={
                  <span className="font-mono text-xs tabular-nums">
                    {formatNumber(
                      span.outputTokens,
                    )}
                  </span>
                }
              />
            )}

            {span.reasoningTokens !==
              undefined && (
              <InfoRow
                label="Reasoning tokens"
                value={
                  <span className="font-mono text-xs tabular-nums">
                    {formatNumber(
                      span.reasoningTokens,
                    )}
                  </span>
                }
              />
            )}
          </div>
        </section>
      )}

      {span.toolCalls &&
        span.toolCalls.length > 0 && (
          <section>
            <SectionLabel>
              Tool calls
            </SectionLabel>

            <div className="rounded-md border p-3">
              <span className="font-mono text-xs tabular-nums">
                {span.toolCalls.length}
              </span>

              <span className="ml-1.5 text-xs text-muted-foreground">
                {span.toolCalls.length === 1
                  ? "tool call"
                  : "tool calls"}
              </span>
            </div>
          </section>
        )}

      {isError && (
        <section>
          <SectionLabel>
            Error
          </SectionLabel>

          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
            {span.errorType && (
              <div className="mb-1 text-xs font-semibold text-destructive">
                {span.errorType}
              </div>
            )}

            {span.errorMessage && (
              <p className="whitespace-pre-wrap break-words text-xs leading-5 text-destructive/90">
                {span.errorMessage}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ========================================================================== */
/* Details                                                                    */
/* ========================================================================== */

function DetailsContent({
  span,
}: {
  span: TraceSpan;
}) {
  return (
    <div className="space-y-5 p-4 pb-20">
      <section>
        <SectionLabel>
          Identifiers
        </SectionLabel>

        <div className="overflow-hidden rounded-md border">
          <CopyInfoRow
            label="Span ID"
            value={span.spanId}
          />

          <CopyInfoRow
            label="Parent span ID"
            value={
              span.parentSpanId ?? "Root span"
            }
          />

          <CopyInfoRow
            label="Trace ID"
            value={span.traceId}
          />
        </div>
      </section>

      {span.framework && (
        <section>
          <SectionLabel>
            Framework
          </SectionLabel>

          <div className="rounded-md border px-3 py-2.5 text-xs">
            {span.framework}
          </div>
        </section>
      )}

      <section>
        <SectionLabel>
          Attributes
        </SectionLabel>

        {Object.keys(span.attributes).length ===
        0 ? (
          <div className="rounded-md border px-3 py-4 text-center text-xs text-muted-foreground">
            No attributes captured.
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border">
            {Object.entries(
              span.attributes,
            ).map(([key, value]) => (
              <AttributeRow
                key={key}
                name={key}
                value={value}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ========================================================================== */
/* JSON                                                                       */
/* ========================================================================== */

function JsonPanel({
  title,
  value,
  emptyLabel,
}: {
  title: string;
  value: unknown;
  emptyLabel: string;
}) {
  const [query, setQuery] = useState("");

  if (
    value === undefined ||
    value === null
  ) {
    return (
      <div className="p-4">
        <SectionLabel>{title}</SectionLabel>

        <div className="rounded-md border px-3 py-8 text-center text-xs text-muted-foreground">
          {emptyLabel}
        </div>
      </div>
    );
  }

  const formatted = formatJson(value);

  const visible =
    query.trim().length === 0
      ? formatted
      : formatted
          .split("\n")
          .filter((line) =>
            line
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .join("\n");

  return (
    <div className="p-4 pb-20">
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>{title}</SectionLabel>

        <button
          type="button"
          onClick={() =>
            navigator.clipboard.writeText(
              formatted,
            )
          }
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Copy"
        >
          <Copy className="size-3.5" />
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />

        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search..."
          className="h-7 w-full rounded-md border bg-background pl-7 pr-2 text-[10px] outline-none focus:border-foreground/30"
        />
      </div>

      <pre className="max-h-[calc(100vh-240px)] overflow-auto rounded-md border bg-muted/20 p-3 font-mono text-[10px] leading-5 text-foreground/80">
        {visible || "No matching content."}
      </pre>
    </div>
  );
}

/* ========================================================================== */
/* Small Components                                                           */
/* ========================================================================== */

function DetailTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative px-2.5 py-2.5 text-[10px] font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}

      {active && (
        <span className="absolute inset-x-1 bottom-0 h-px bg-foreground" />
      )}
    </button>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-4 border-b px-3 last:border-b-0">
      <span className="text-[10px] text-muted-foreground">
        {label}
      </span>

      <span className="text-right">
        {value}
      </span>
    </div>
  );
}

function CopyInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-9 items-center gap-3 border-b px-3 last:border-b-0">
      <span className="w-24 shrink-0 text-[10px] text-muted-foreground">
        {label}
      </span>

      <span
        className="min-w-0 flex-1 truncate font-mono text-[9px]"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function AttributeRow({
  name,
  value,
}: {
  name: string;
  value: unknown;
}) {
  return (
    <div className="border-b px-3 py-2.5 last:border-b-0">
      <div className="mb-1 break-all font-mono text-[9px] font-medium text-muted-foreground">
        {name}
      </div>

      <div className="break-words font-mono text-[10px] leading-4">
        {formatValue(value)}
      </div>
    </div>
  );
}

function StatusCell({
  error,
}: {
  error: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 text-[10px] font-medium",
        error
          ? "text-destructive"
          : "text-emerald-600 dark:text-emerald-400",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          error
            ? "bg-destructive"
            : "bg-emerald-500",
        ].join(" ")}
      />

      {error ? "Error" : "OK"}
    </span>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-8 appearance-none rounded-md border bg-background py-0 pl-2.5 pr-7 text-xs outline-none transition-colors hover:bg-muted/30 focus:border-foreground/30"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

function getSpanError(span: TraceSpan) {
  return Boolean(
    span.errorMessage ||
      span.errorType ||
      span.status?.toLowerCase() === "error" ||
      span.status?.toLowerCase() === "failed",
  );
}

function formatDuration(
  durationMs: number,
) {
  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  if (durationMs < 60_000) {
    return `${(durationMs / 1000).toFixed(2)}s`;
  }

  const minutes = Math.floor(
    durationMs / 60_000,
  );

  const seconds =
    (durationMs % 60_000) / 1000;

  return `${minutes}m ${seconds.toFixed(1)}s`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function shortId(value: string) {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  const diff = Date.now() - timestamp;

  if (diff < 60_000) {
    return `${Math.max(
      1,
      Math.floor(diff / 1000),
    )}s ago`;
  }

  if (diff < 3_600_000) {
    return `${Math.floor(
      diff / 60_000,
    )}m ago`;
  }

  if (diff < 86_400_000) {
    return `${Math.floor(
      diff / 3_600_000,
    )}h ago`;
  }

  return new Date(value).toLocaleDateString();
}

function formatJson(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(
      value,
      null,
      2,
    );
  } catch {
    return String(value);
  }
}

function formatValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Optional helper if you later want to flatten a tree
 * inside this component.
 */
export function flattenSpanTree(
  roots: TraceTreeNode[],
): TraceSpan[] {
  const result: TraceSpan[] = [];

  function visit(node: TraceTreeNode) {
    result.push(node.span);

    for (const child of node.children) {
      visit(child);
    }
  }

  for (const root of roots) {
    visit(root);
  }

  return result;
}