import type {
  NormalizedResource,
  NormalizedSpan,
  NormalizedTrace,
} from "./types";

function attributesToRecord(
  attributes: Array<{
    key: string;
    value?: {
      stringValue?: string;
      boolValue?: boolean;
      intValue?: string | number;
      doubleValue?: number;
      bytesValue?: string;
      arrayValue?: unknown;
      kvlistValue?: unknown;
    };
  }> = [],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const attribute of attributes) {
    const value = attribute.value;

    if (!value) {
      continue;
    }

    if (value.stringValue !== undefined) {
      result[attribute.key] = value.stringValue;
    } else if (value.boolValue !== undefined) {
      result[attribute.key] = value.boolValue;
    } else if (value.intValue !== undefined) {
      result[attribute.key] = Number(value.intValue);
    } else if (value.doubleValue !== undefined) {
      result[attribute.key] = value.doubleValue;
    } else if (value.bytesValue !== undefined) {
      result[attribute.key] = value.bytesValue;
    } else if (value.arrayValue !== undefined) {
      result[attribute.key] = value.arrayValue;
    } else if (value.kvlistValue !== undefined) {
      result[attribute.key] = value.kvlistValue;
    }
  }

  return result;
}

function unixNanoToDate(value: string | number | undefined): Date {
  if (value === undefined) {
    throw new Error("Missing OTLP timestamp");
  }

  return new Date(Number(value) / 1_000_000);
}

function normalizeStatus(status: {
  code?: number;
  message?: string;
} | undefined) {
  return {
    code: status?.code ?? 0,
    message: status?.message ?? "",
  };
}

export function normalizeTraces(
  request: any,
): NormalizedTrace[] {
  const traces: NormalizedTrace[] = [];

  for (const resourceSpan of request.resourceSpans ?? []) {
    const resource: NormalizedResource = {
      attributes: attributesToRecord(
        resourceSpan.resource?.attributes,
      ),
    };

    for (const scopeSpan of resourceSpan.scopeSpans ?? []) {
      for (const span of scopeSpan.spans ?? []) {
        const normalizedSpan: NormalizedSpan = {
          traceId: span.traceId,
          spanId: span.spanId,
          parentSpanId: span.parentSpanId || null,

          name: span.name,

          startTime: unixNanoToDate(span.startTimeUnixNano),
          endTime: unixNanoToDate(span.endTimeUnixNano),

          status: normalizeStatus(span.status),

          attributes: attributesToRecord(span.attributes),

          events: span.events ?? [],

          resource,
        };

        let trace = traces.find(
          (item) => item.traceId === normalizedSpan.traceId,
        );

        if (!trace) {
          trace = {
            traceId: normalizedSpan.traceId,
            spans: [],
          };

          traces.push(trace);
        }

        trace.spans.push(normalizedSpan);
      }
    }
  }

  return traces;
}