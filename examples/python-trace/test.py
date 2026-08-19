from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter


resource = Resource.create({
    "service.name": "terrax-test"
})

provider = TracerProvider(resource=resource)

exporter = OTLPSpanExporter(
    endpoint="http://localhost:3000/v1/traces",
    headers={
        "Authorization": "Bearer terrax_test_key"
    },
)

processor = BatchSpanProcessor(exporter)

provider.add_span_processor(processor)

trace.set_tracer_provider(provider)

tracer = trace.get_tracer("terrax-test")


with tracer.start_as_current_span("root"):
    with tracer.start_as_current_span("operation-1"):
        print("operation-1")

    with tracer.start_as_current_span("operation-2"):
        print("operation-2")


provider.force_flush()

print("Trace exported")