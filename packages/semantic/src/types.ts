export type SemanticType =
  | "workflow"
  | "workflow_node"
  | "llm"
  | "tool"
  | "generic";

export interface RawSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string | null;

  name: string;

  startTime: string;
  endTime: string;

  status?: string;

  attributes: Record<string, unknown>;

  events?: unknown[];
  resource?: Record<string, unknown>;
}

export interface SemanticSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string | null;

  type: SemanticType;

  name: string;

  framework?: string;

  provider?: string;
  model?: string;

  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;

  startTime: string;
  endTime: string;

  attributes: Record<string, unknown>;
}