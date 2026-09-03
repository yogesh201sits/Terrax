export type TraceSummary = {
  traceId: string;
  name: string;
  startTime: string | null;
  endTime: string | null;
  durationMs: number;
  spanCount: number;
  llmCalls: number;
  toolCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  status: string;
  createdAt: string;
};

export type TracesResponse = {
  traces: TraceSummary[];
};