from opentelemetry import trace
from opentelemetry.trace import NoOpTracerProvider
from opentelemetry.exporter.otlp.proto.http.trace_exporter import (
    OTLPSpanExporter,
)
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from .config import get_config


_tracer_provider: TracerProvider | None = None


def initialize_otel() -> TracerProvider:
    global _tracer_provider

    if _tracer_provider is not None:
        return _tracer_provider

    config = get_config()

    current_provider = trace.get_tracer_provider()

    if not isinstance(current_provider, NoOpTracerProvider):
        return current_provider

    resource = Resource.create(
        {
            "service.name": config.service_name,
            "service.version": config.service_version,
            "deployment.environment": config.environment,
        }
    )

    provider = TracerProvider(resource=resource)

    exporter = OTLPSpanExporter(
        endpoint=config.endpoint,
        headers={
            "Authorization": f"Bearer {config.api_key}",
        },
    )

    processor = BatchSpanProcessor(exporter)

    provider.add_span_processor(processor)

    trace.set_tracer_provider(provider)

    _tracer_provider = provider

    return provider


def get_tracer():
    return trace.get_tracer("terrax")


def get_current_span():
    return trace.get_current_span()


def shutdown_otel() -> None:
    global _tracer_provider

    if _tracer_provider is None:
        return

    _tracer_provider.shutdown()

    _tracer_provider = None