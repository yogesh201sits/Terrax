"use client";

import { useState } from "react";
import type { TraceTreeNode } from "@/types/trace-detail";

type Props = {
  roots: TraceTreeNode[];
};

export function TraceTree({ roots }: Props) {
  const [selectedNode, setSelectedNode] =
  useState<TraceTreeNode | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="rounded-lg border">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Execution</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Trace execution hierarchy
          </p>
        </div>

        <div className="p-3">
          {roots.map((root) => (
            <TraceTreeNodeView
              key={root.span.spanId}
              node={root}
              depth={0}
              selectedSpanId={selectedNode?.span.spanId}
              onSelect={setSelectedNode}
              isLast
            />
          ))}
        </div>
      </div>

      <SpanDetails node={selectedNode} />
    </div>
  );
}

type NodeProps = {
  node: TraceTreeNode;
  depth: number;
  selectedSpanId?: string;
  onSelect: (node: TraceTreeNode) => void;
  isLast: boolean;
};

function TraceTreeNodeView({
  node,
  depth,
  selectedSpanId,
  onSelect,
  isLast,
}: NodeProps) {
  const [expanded, setExpanded] = useState(true);

  const { span } = node;
  const hasChildren = node.children.length > 0;
  const isError = Boolean(span.errorMessage);
  const isSelected = selectedSpanId === span.spanId;

  return (
    <div className="relative">
      {depth > 0 && (
        <div
          className={`absolute left-3 top-0 w-px bg-border ${
            isLast ? "h-5" : "bottom-0"
          }`}
        />
      )}

      <div
        className="relative flex items-center"
        style={{
          paddingLeft: `${depth * 28}px`,
        }}
      >
        {depth > 0 && (
          <div className="absolute left-3 top-1/2 w-4 border-t border-border" />
        )}

        <div
          className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 transition-colors ${
            isSelected
              ? "bg-muted"
              : "hover:bg-muted/50"
          }`}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex size-5 shrink-0 items-center justify-center rounded text-xs text-muted-foreground hover:bg-background"
              aria-label={
                expanded ? "Collapse span" : "Expand span"
              }
            >
              {expanded ? "⌄" : "›"}
            </button>
          ) : (
            <span className="size-5 shrink-0" />
          )}

          <button
            type="button"
            onClick={() => onSelect(node)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <SpanIcon type={span.type} />

            <span className="truncate text-sm font-medium">
              {span.name}
            </span>

            <SpanType type={span.type} />

            {span.provider && (
              <span className="hidden text-xs text-muted-foreground md:inline">
                {span.provider}
              </span>
            )}

            {span.model && (
              <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground lg:inline">
                {span.model}
              </span>
            )}

            {span.type === "llm" &&
              span.totalTokens !== undefined && (
                <span className="hidden text-xs text-muted-foreground xl:inline">
                  {span.totalTokens} tokens
                </span>
              )}
          </button>

          <span className="shrink-0 text-xs text-muted-foreground">
            {formatDuration(span.durationMs)}
          </span>

          {isError && (
            <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium text-destructive">
              ERROR
            </span>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child, index) => (
            <TraceTreeNodeView
              key={child.span.spanId}
              node={child}
              depth={depth + 1}
              selectedSpanId={selectedSpanId}
              onSelect={onSelect}
              isLast={index === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SpanIcon({
  type,
}: {
  type: TraceTreeNode["span"]["type"];
}) {
  const icons = {
    workflow: "W",
    workflow_node: "N",
    llm: "L",
    tool: "T",
    generic: "S",
  };

  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded border text-[10px] font-semibold">
      {icons[type]}
    </span>
  );
}

function SpanType({
  type,
}: {
  type: TraceTreeNode["span"]["type"];
}) {
  return (
    <span className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
      {type}
    </span>
  );
}

function SpanDetails({
  node,
}: {
  node: TraceTreeNode | null;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "input" | "output" | "details"
  >("overview");

  if (!node) {
    return (
      <div className="h-fit rounded-lg border">
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Select a span to inspect its details.
          </p>
        </div>
      </div>
    );
  }

  const { span } = node;

  const tabs = [
    {
      id: "overview" as const,
      label: "Overview",
    },
    {
      id: "input" as const,
      label: "Input",
    },
    {
      id: "output" as const,
      label: "Output",
    },
    {
      id: "details" as const,
      label: "Details",
    },
  ];

  return (
    <div className="h-fit rounded-lg border">
      {/* Header */}
      <div className="border-b px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SpanIcon type={span.type} />

              <h2 className="truncate font-semibold">
                {span.name}
              </h2>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {span.type}
            </p>
          </div>

          {span.errorMessage && (
            <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium text-destructive">
              ERROR
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-3">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-3 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}

              {activeTab === tab.id && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {activeTab === "overview" && (
          <OverviewTab span={span} />
        )}

        {activeTab === "input" && (
          <InputTab span={span} />
        )}

        {activeTab === "output" && (
          <OutputTab span={span} />
        )}

        {activeTab === "details" && (
          <DetailsTab span={span} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  span,
}: {
  span: TraceTreeNode["span"];
}) {
  const isLLM = span.type === "llm";

  return (
    <div className="space-y-5">
      {/* Execution Info */}
      <div className="grid grid-cols-2 gap-4">
        <InfoItem
          label="Duration"
          value={formatDuration(span.durationMs)}
        />

        <InfoItem
          label="Status"
          value={span.errorMessage ? "ERROR" : "OK"}
        />

        {span.framework && (
          <InfoItem
            label="Framework"
            value={span.framework}
          />
        )}

        {span.provider && (
          <InfoItem
            label="Provider"
            value={span.provider}
          />
        )}

        {span.model && (
          <div className="col-span-2">
            <InfoItem
              label="Model"
              value={span.model}
            />
          </div>
        )}
      </div>

      {/* LLM Token Usage */}
      {isLLM && (
        <TokenStats span={span} />
      )}

      {/* Tool Calls */}
      {span.toolCalls &&
        span.toolCalls.length > 0 && (
          <JsonSection
            label="Tool Calls"
            value={span.toolCalls}
          />
        )}

      {span.type === "tool" && (
        <div className="space-y-4">
          {span.toolInput !== undefined && (
            <JsonSection
              label="Tool Input"
              value={span.toolInput}
            />
          )}

          {span.toolOutput !== undefined && (
            <JsonSection
              label="Tool Output"
              value={span.toolOutput}
            />
          )}
        </div>
      )}

      {/* Error */}
      {span.errorMessage && (
        <ErrorSection
          type={span.errorType}
          message={span.errorMessage}
        />
      )}
    </div>
  );
}

function InputTab({
  span,
}: {
  span: TraceTreeNode["span"];
}) {
  if (
    span.prompt === undefined &&
    span.toolInput === undefined
  ) {
    return <EmptyState label="No input recorded." />;
  }

  return (
    <div className="space-y-5">
      {span.prompt !== undefined && (
        <JsonSection
          label="Prompt"
          value={span.prompt}
        />
      )}

      {span.toolInput !== undefined && (
        <JsonSection
          label="Tool Input"
          value={span.toolInput}
        />
      )}
    </div>
  );
}

function OutputTab({
  span,
}: {
  span: TraceTreeNode["span"];
}) {
  if (
    span.completion === undefined &&
    span.toolOutput === undefined
  ) {
    return <EmptyState label="No output recorded." />;
  }

  return (
    <div className="space-y-5">
      {span.completion !== undefined && (
        <JsonSection
          label="Completion"
          value={span.completion}
        />
      )}

      {span.toolOutput !== undefined && (
        <JsonSection
          label="Tool Output"
          value={span.toolOutput}
        />
      )}
    </div>
  );
}

function DetailsTab({
  span,
}: {
  span: TraceTreeNode["span"];
}) {
  const attributes =
    span.attributes &&
    typeof span.attributes === "object"
      ? span.attributes
      : {};

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Span ID
        </p>

        <p className="break-all rounded-md bg-muted p-3 font-mono text-xs">
          {span.spanId}
        </p>
      </div>

      {span.parentSpanId && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Parent Span ID
          </p>

          <p className="break-all rounded-md bg-muted p-3 font-mono text-xs">
            {span.parentSpanId}
          </p>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Trace ID
        </p>

        <p className="break-all rounded-md bg-muted p-3 font-mono text-xs">
          {span.traceId}
        </p>
      </div>

      {Object.keys(attributes).length > 0 && (
        <JsonSection
          label="Attributes"
          value={attributes}
        />
      )}
    </div>
  );
}

function ErrorSection({
  type,
  message,
}: {
  type?: string;
  message: string;
}) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-semibold text-destructive">
          Error
        </span>

        {type && (
          <span className="font-mono text-[10px] text-muted-foreground">
            {type}
          </span>
        )}
      </div>

      <pre className="max-h-96 overflow-auto rounded-md bg-background p-3 text-xs leading-relaxed whitespace-pre-wrap">
        {message}
      </pre>
    </div>
  );
}

function EmptyState({
  label,
}: {
  label: string;
}) {
  return (
    <div className="rounded-md border border-dashed p-8 text-center">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function TokenStats({
  span,
}: {
  span: TraceTreeNode["span"];
}) {
  const hasReasoning =
    span.reasoningTokens !== undefined;

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Token Usage
      </p>

      <div
        className={`grid gap-2 ${
          hasReasoning
            ? "grid-cols-2 sm:grid-cols-4"
            : "grid-cols-3"
        }`}
      >
        <TokenStat
          label="Input"
          value={span.inputTokens}
        />

        <TokenStat
          label="Output"
          value={span.outputTokens}
        />

        <TokenStat
          label="Total"
          value={span.totalTokens}
        />

        {hasReasoning && (
          <TokenStat
            label="Reasoning"
            value={span.reasoningTokens}
          />
        )}
      </div>
    </div>
  );
}

function TokenStat({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  return (
    <div className="rounded-md border p-2.5">
      <p className="text-[11px] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value ?? 0}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

function JsonSection({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const entries =
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
      ? Object.entries(value as Record<string, unknown>)
      : [];

  const filteredEntries = entries.filter(([key]) =>
    key.toLowerCase().includes(search.toLowerCase()),
  );

  const visibleEntries = showAll
    ? filteredEntries
    : filteredEntries.slice(0, 6);

  return (
    <div className="rounded-md border">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-muted/40"
      >
        <div>
          <p className="text-xs font-medium">
            {label}
          </p>

          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {entries.length}{" "}
            {entries.length === 1 ? "field" : "fields"}
          </p>
        </div>

        <span className="text-xs text-muted-foreground">
          {open ? "−" : "+"}
        </span>
      </button>

      {/* Content */}
      {open && (
        <div className="border-t p-3">
          {entries.length === 0 ? (
            <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            <>
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setShowAll(true);
                }}
                placeholder="Search attributes..."
                className="mb-2 w-full rounded-md border bg-background px-3 py-2 text-xs outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
              />

              <div className="overflow-hidden rounded-md border">
                {visibleEntries.map(
                  ([key, attributeValue]) => (
                    <AttributeRow
                      key={key}
                      name={key}
                      value={attributeValue}
                    />
                  ),
                )}
              </div>

              {filteredEntries.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="mt-2 w-full rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted"
                >
                  {showAll
                    ? "Show less"
                    : `Show ${
                        filteredEntries.length - 6
                      } more`}
                </button>
              )}
            </>
          )}
        </div>
      )}
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
  const [expanded, setExpanded] = useState(false);

  const isObject =
    value !== null &&
    typeof value === "object";

  const displayValue = isObject
    ? JSON.stringify(value)
    : String(value);

  return (
    <div className="px-3 py-2.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-all font-mono text-[11px] text-muted-foreground">
            {name}
          </p>

          {!expanded && (
            <p className="mt-1 truncate text-xs">
              {displayValue}
            </p>
          )}

          {expanded && (
            <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-3 text-[11px] whitespace-pre-wrap">
              {JSON.stringify(value, null, 2)}
            </pre>
          )}
        </div>

        {isObject && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 rounded-md border px-2 py-1 text-[10px] hover:bg-muted"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        )}
      </div>
    </div>
  );
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}