export interface NormalizedResource {
  attributes: Record<string, unknown>;
}

export interface NormalizedSpan {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;

  name: string;

  startTime: Date;
  endTime: Date;

  status: {
    code: number;
    message: string;
  };

  attributes: Record<string, unknown>;
  events: unknown[];
  resource: NormalizedResource;
}

export interface NormalizedTrace {
  traceId: string;
  spans: NormalizedSpan[];
}