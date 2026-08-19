import { fileURLToPath } from "node:url";
import path from "node:path";

import protobuf from "protobufjs";

const protoRoot = fileURLToPath(
  new URL("../proto", import.meta.url),
);

const protoPath = path.join(
  protoRoot,
  "collector",
  "trace",
  "v1",
  "trace_service.proto",
);

const root = new protobuf.Root();
root.resolvePath = (origin, target) => {
  const importPrefix = "opentelemetry/proto/";

  if (target.startsWith(importPrefix)) {
    return path.join(protoRoot, target.slice(importPrefix.length));
  }

  return path.resolve(path.dirname(origin), target);
};

await root.load(protoPath);

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