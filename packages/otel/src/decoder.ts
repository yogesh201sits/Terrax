import { fileURLToPath } from "node:url";
import protobuf from "protobufjs";

const protoPath = fileURLToPath(
  new URL(
    "../proto/opentelemetry/proto/collector/trace/v1/trace_service.proto",
    import.meta.url,
  ),
);

const root = await protobuf.load(protoPath);

const ExportTraceServiceRequest = root.lookupType(
  "opentelemetry.proto.collector.trace.v1.ExportTraceServiceRequest",
);

export function decodeTraces(payload: Uint8Array) {
  const message = ExportTraceServiceRequest.decode(payload);

  return ExportTraceServiceRequest.toObject(message, {
    longs: String,
    enums: Number,
    bytes: String,
  });
}