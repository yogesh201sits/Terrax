from terrax import event, observe


def test_event_is_recorded(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @observe()
    def run_agent():
        event("agent.started")

    run_agent()

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert len(span.events) == 1
    assert span.events[0].name == "agent.started"


def test_event_attributes_are_recorded(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @observe()
    def run_agent():
        event(
            "tool.called",
            attributes={
                "tool.name": "search",
                "query": "OpenTelemetry",
            },
        )

    run_agent()

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    event_data = spans[0].events[0]

    assert event_data.name == "tool.called"
    assert event_data.attributes["tool.name"] == "search"
    assert event_data.attributes["query"] == "OpenTelemetry"


def test_event_outside_span_does_not_fail():
    event("something.happened")
def test_event_redacts_attributes(setup_tracing):
    from opentelemetry import trace

    from terrax import event

    tracer = trace.get_tracer("test")

    with tracer.start_as_current_span("agent"):
        event(
            "tool.called",
            attributes={
                "tool": "search",
                "password": "secret123",
            },
            redact=["password"],
        )

    exported = setup_tracing.get_finished_spans()

    assert len(exported) == 1

    events = exported[0].events

    assert len(events) == 1

    attributes = events[0].attributes

    assert attributes["tool"] == "search"
    assert attributes["password"] == "[REDACTED]"