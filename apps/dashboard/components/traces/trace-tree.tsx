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
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="rounded-lg border">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Execution</h2>
        </div>

        <div className="p-4">
          {roots.map((root) => (
            <TraceTreeNodeView
              key={root.span.spanId}
              node={root}
              depth={0}
              selectedSpanId={selectedNode?.span.spanId}
              onSelect={setSelectedNode}
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
};

function TraceTreeNodeView({
  node,
  depth,
  selectedSpanId,
  onSelect,
}: NodeProps) {
  const [expanded, setExpanded] = useState(true);

  const { span } = node;
  const hasChildren = node.children.length > 0;
  const isError = Boolean(span.errorMessage);
  const isSelected = selectedSpanId === span.spanId;

  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/50 ${
          isSelected ? "bg-muted" : ""
        }`}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex size-5 items-center justify-center text-xs text-muted-foreground"
          >
            {expanded ? "▼" : "▶"}
          </button>
        ) : (
          <span className="size-5" />
        )}

        <button
          type="button"
          onClick={() => onSelect(node)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="truncate font-medium">
            {span.name}
          </span>

          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {span.type}
          </span>

          {span.provider && (
            <span className="text-xs text-muted-foreground">
              {span.provider}
            </span>
          )}

          {span.model && (
            <span className="max-w-[180px] truncate text-xs text-muted-foreground">
              {span.model}
            </span>
          )}
        </button>

        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDuration(span.durationMs)}
        </span>

        {isError && (
          <span className="text-xs font-medium text-destructive">
            ERROR
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TraceTreeNodeView
              key={child.span.spanId}
              node={child}
              depth={depth + 1}
              selectedSpanId={selectedSpanId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SpanDetails({
  node,
}: {
  node: TraceTreeNode | null;
}) {
  if (!node) {
    return (
      <div className="rounded-lg border">
        <div className="p-6 text-center text-sm text-muted-foreground">
          Select a span to inspect its details.
        </div>
      </div>
    );
  }

  const { span } = node;

  return (
    <div className="h-fit rounded-lg border">
      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">{span.name}</h2>
            <p className="text-xs text-muted-foreground">
              {span.type}
            </p>
          </div>

          {span.errorMessage && (
            <span className="text-xs font-medium text-destructive">
              ERROR
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <DetailRow label="Duration">
          {formatDuration(span.durationMs)}
        </DetailRow>

        {span.framework && (
          <DetailRow label="Framework">
            {span.framework}
          </DetailRow>
        )}

        {span.provider && (
          <DetailRow label="Provider">
            {span.provider}
          </DetailRow>
        )}

        {span.model && (
          <DetailRow label="Model">
            {span.model}
          </DetailRow>
        )}

        {(span.inputTokens !== undefined ||
          span.outputTokens !== undefined ||
          span.totalTokens !== undefined) && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Tokens
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
        )}

        {span.toolInput !== undefined && (
          <JsonSection
            label="Tool Input"
            value={span.toolInput}
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

            <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
              {span.errorMessage}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{children}</p>
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
    <div className="rounded-md border p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">
        {value ?? 0}
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

      <pre className="max-h-60 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
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