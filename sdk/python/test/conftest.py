import pytest

import terrax.config as terrax_config
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import (
    InMemorySpanExporter,
)


@pytest.fixture(scope="session")
def setup_tracing():
    exporter = InMemorySpanExporter()

    provider = TracerProvider()

    provider.add_span_processor(
        SimpleSpanProcessor(exporter)
    )

    trace.set_tracer_provider(provider)

    return exporter


@pytest.fixture(autouse=True)
def reset_terrax_config():
    terrax_config._config = None

    yield

    terrax_config._config = None