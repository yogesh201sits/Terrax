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

  return (
    <div className="h-fit rounded-lg border">
      <div className="border-b px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-semibold">
              {span.name}
            </h2>

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

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          <InfoItem
            label="Duration"
            value={formatDuration(span.durationMs)}
          />

          <InfoItem
            label="Framework"
            value={span.framework ?? "—"}
          />

          {span.provider && (
            <InfoItem
              label="Provider"
              value={span.provider}
            />
          )}

          {span.model && (
            <InfoItem
              label="Model"
              value={span.model}
            />
          )}
        </div>

        {span.type === "llm" && (
          <TokenStats span={span} />
        )}

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

        {span.prompt !== undefined && (
          <JsonSection
            label="Prompt"
            value={span.prompt}
          />
        )}

        {span.completion !== undefined && (
          <JsonSection
            label="Completion"
            value={span.completion}
          />
        )}

        {span.errorMessage && (
          <div>
            <p className="mb-2 text-xs font-medium text-destructive">
              Error
            </p>

            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed whitespace-pre-wrap">
              {span.errorMessage}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function TokenStats({
  span,
}: {
  span: TraceTreeNode["span"];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Token Usage
      </p>

      <div className="grid grid-cols-3 gap-2">
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
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}