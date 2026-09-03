export type TraceSpan = {
  traceId: string;
  spanId: string;
  parentSpanId?: string | null;

  type:
    | "workflow"
    | "workflow_node"
    | "llm"
    | "tool"
    | "generic";

  name: string;

  framework?: string;
  provider?: string;
  model?: string;

  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;

  prompt?: unknown;
  completion?: unknown;

  toolCalls?: unknown[];
  toolInput?: unknown;
  toolOutput?: unknown;

  status?: string;
  errorType?: string;
  errorMessage?: string;

  startTime: string;
  endTime: string;
  durationMs: number;

  attributes: Record<string, unknown>;
};

export type TraceTreeNode = {
  span: TraceSpan;
  children: TraceTreeNode[];
};

export type TraceDetail = {
  traceId: string;
  createdAt: string;
  tree: {
    traceId: string;
    roots: TraceTreeNode[];
  };
};