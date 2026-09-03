"use client";

import { useState } from "react";
import type { TraceTreeNode } from "@/types/trace-detail";

type Props = {
  roots: TraceTreeNode[];
};

export function TraceTree({ roots }: Props) {
  return (
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
          />
        ))}
      </div>
    </div>
  );
}

type NodeProps = {
  node: TraceTreeNode;
  depth: number;
};

function TraceTreeNodeView({ node, depth }: NodeProps) {
  const [expanded, setExpanded] = useState(true);

  const { span } = node;
  const hasChildren = node.children.length > 0;
  const isError = Boolean(span.errorMessage);

  return (
    <div>
      <div
        className="group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/50"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex size-5 items-center justify-center text-muted-foreground"
          >
            <span className="text-xs">
              {expanded ? "▼" : "▶"}
            </span>
          </button>
        ) : (
          <span className="size-5" />
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2">
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
            <span className="max-w-[220px] truncate text-xs text-muted-foreground">
              {span.model}
            </span>
          )}
        </div>

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
            />
          ))}
        </div>
      )}
    </div>
  );
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}