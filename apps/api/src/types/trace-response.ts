import type { SemanticSpan } from "@terrax/semantic";

export interface TraceSpanResponse {
  traceId: string;

  spanId: string;

  parentSpanId: string | null;

  type: SemanticSpan["type"];

  name: string;

  framework?: string;

  provider?: string;

  model?: string;

  startTime: string;

  endTime: string;

  durationMs: number;

  inputTokens?: number;

  outputTokens?: number;

  totalTokens?: number;

  toolInput?: unknown;
  
  toolOutput?: unknown;

  reasoningTokens?: number;

  errorType?: string;
  errorMessage?: string;

  prompt?: unknown;

  completion?: unknown;

  toolCalls?: unknown[];

  status?: string;
}

export interface TraceTreeNodeResponse {
  span: TraceSpanResponse;

  children: TraceTreeNodeResponse[];
}

export interface TraceResponse {
  traceId: string;

  createdAt: Date;

  tree: {
    traceId: string;

    roots: TraceTreeNodeResponse[];
  };
}