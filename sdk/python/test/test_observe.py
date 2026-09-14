import asyncio

import pytest
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    SimpleSpanProcessor,
)
from opentelemetry.sdk.trace.export.in_memory_span_exporter import (
    InMemorySpanExporter,
)

from terrax import observe


@pytest.fixture(scope="module")
def setup_tracing():
    exporter = InMemorySpanExporter()

    provider = TracerProvider()

    provider.add_span_processor(
        SimpleSpanProcessor(exporter)
    )

    trace.set_tracer_provider(provider)

    return exporter


def test_observe_creates_span(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @observe()
    def run_agent(query):
        return f"Answer: {query}"

    result = run_agent("Hello")

    assert result == "Answer: Hello"

    spans = exporter.get_finished_spans()

    assert len(spans) == 1
    assert spans[0].name == "run_agent"


def test_observe_custom_name(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @observe(name="agent.run")
    def run_agent(query):
        return query

    run_agent("Hello")

    spans = exporter.get_finished_spans()

    assert len(spans) == 1
    assert spans[0].name == "agent.run"


def test_observe_records_exception(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @observe()
    def failing_agent():
        raise ValueError("Something went wrong")

    with pytest.raises(
        ValueError,
        match="Something went wrong",
    ):
        failing_agent()

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert span.name == "failing_agent"
    assert span.status.status_code == trace.StatusCode.ERROR
    assert len(span.events) > 0


def test_observe_async(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @observe()
    async def async_agent(query):
        await asyncio.sleep(0.01)
        return f"Answer: {query}"

    result = asyncio.run(
        async_agent("Hello")
    )

    assert result == "Answer: Hello"

    spans = exporter.get_finished_spans()

    assert len(spans) == 1
    assert spans[0].name == "async_agent"


def test_observe_nested_spans(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @observe()
    def retrieve(query):
        return f"Documents for {query}"

    @observe()
    def generate(context):
        return f"Answer using {context}"

    @observe(name="agent.run")
    def run_agent(query):
        context = retrieve(query)
        return generate(context)

    result = run_agent("OpenTelemetry")

    assert result == (
        "Answer using Documents for OpenTelemetry"
    )

    spans = exporter.get_finished_spans()

    assert len(spans) == 3

    spans_by_name = {
        span.name: span
        for span in spans
    }

    assert "agent.run" in spans_by_name
    assert "retrieve" in spans_by_name
    assert "generate" in spans_by_name

    root = spans_by_name["agent.run"]
    retrieve_span = spans_by_name["retrieve"]
    generate_span = spans_by_name["generate"]

    assert retrieve_span.parent is not None
    assert (
        retrieve_span.parent.span_id
        == root.context.span_id
    )

    assert generate_span.parent is not None
    assert (
        generate_span.parent.span_id
        == root.context.span_id
    )


def test_observe_captures_input(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @observe(capture_input=True)
    def search(query, limit=10):
        return f"Results for {query}"

    result = search(
        "OpenTelemetry",
        limit=5,
    )

    assert result == "Results for OpenTelemetry"

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert span.attributes["terrax.input"] == (
    '{"query": "OpenTelemetry", "limit": 5}'
)


def test_observe_does_not_capture_input_by_default(
    setup_tracing,
):
    exporter = setup_tracing
    exporter.clear()

    @observe()
    def search(query, limit=10):
        return query

    search("OpenTelemetry", limit=5)

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert "terrax.input" not in span.attributes

def test_observe_captures_output(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @observe(capture_output=True)
    def search(query):
        return {
            "results": ["doc1", "doc2"],
            "count": 2,
        }

    result = search("OpenTelemetry")

    assert result == {
        "results": ["doc1", "doc2"],
        "count": 2,
    }

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert span.attributes["terrax.output"] == (
        '{"results": ["doc1", "doc2"], "count": 2}'
    )


def test_observe_captures_input_and_output(
    setup_tracing,
):
    exporter = setup_tracing
    exporter.clear()

    @observe(
        capture_input=True,
        capture_output=True,
    )
    def search(query, limit=10):
        return {
            "query": query,
            "limit": limit,
        }

    result = search(
        "OpenTelemetry",
        limit=5,
    )

    assert result == {
        "query": "OpenTelemetry",
        "limit": 5,
    }

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert span.attributes["terrax.input"] == (
        '{"query": "OpenTelemetry", "limit": 5}'
    )

    assert span.attributes["terrax.output"] == (
        '{"query": "OpenTelemetry", "limit": 5}'
    )


def test_observe_does_not_capture_output_by_default(
    setup_tracing,
):
    exporter = setup_tracing
    exporter.clear()

    @observe()
    def search():
        return {"result": "hello"}

    search()

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert "terrax.output" not in span.attributes


def test_observe_does_not_capture_output_on_error(
    setup_tracing,
):
    exporter = setup_tracing
    exporter.clear()

    @observe(capture_output=True)
    def failing_agent():
        raise ValueError("Something went wrong")

    with pytest.raises(
        ValueError,
        match="Something went wrong",
    ):
        failing_agent()

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert span.status.status_code == (
        trace.StatusCode.ERROR
    )

    assert "terrax.output" not in span.attributes


def test_observe_async_output(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @observe(capture_output=True)
    async def async_agent(query):
        await asyncio.sleep(0.01)

        return {
            "answer": query,
        }

    result = asyncio.run(
        async_agent("Hello")
    )

    assert result == {
        "answer": "Hello",
    }

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert span.attributes["terrax.output"] == (
        '{"answer": "Hello"}'
    )