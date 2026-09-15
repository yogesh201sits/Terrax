import pytest

import terrax.config as terrax_config
import terrax.otel as terrax_otel

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import (
    InMemorySpanExporter,
)


@pytest.fixture(autouse=True)
def reset_terrax_state():
    terrax_config._config = None
    terrax_otel._tracer_provider = None

    # Reset OTel's global provider for test isolation.
    trace._TRACER_PROVIDER = None
    trace._TRACER_PROVIDER_SET_ONCE = trace.Once()

    yield

    terrax_config._config = None
    terrax_otel._tracer_provider = None


@pytest.fixture
def setup_tracing():
    exporter = InMemorySpanExporter()

    provider = TracerProvider()

    provider.add_span_processor(
        SimpleSpanProcessor(exporter)
    )

    trace.set_tracer_provider(provider)

    return exporter
