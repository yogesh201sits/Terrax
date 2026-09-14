from terrax import shutdown_otel


def test_shutdown_without_initialization():
    shutdown_otel()

def test_initialize_otel_reuses_existing_provider(
    setup_tracing,
):
    from opentelemetry import trace

    from terrax import configure, initialize_otel

    configure(api_key="test-key")

    existing_provider = trace.get_tracer_provider()

    provider = initialize_otel()

    assert provider is existing_provider