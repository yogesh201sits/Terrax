import pytest

from opentelemetry import trace

from terrax import span
from opentelemetry.trace import StatusCode


def test_span_creates_span(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    with span("retrieve"):
        pass

    spans = exporter.get_finished_spans()

    assert len(spans) == 1
    assert spans[0].name == "retrieve"


def test_span_sets_type(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    with span("retrieve", kind="retriever"):
        pass

    spans = exporter.get_finished_spans()

    assert len(spans) == 1
    assert spans[0].attributes["terrax.span.type"] == "retriever"


def test_span_sets_attributes(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    with span(
        "retrieve",
        attributes={
            "query.type": "semantic",
            "limit": 5,
        },
    ):
        pass

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span_data = spans[0]

    assert span_data.attributes["query.type"] == "semantic"
    assert span_data.attributes["limit"] == 5


def test_span_nested(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    with span("agent"):
        with span("retrieve"):
            pass

    spans = exporter.get_finished_spans()

    assert len(spans) == 2

    spans_by_name = {
        item.name: item
        for item in spans
    }

    root = spans_by_name["agent"]
    child = spans_by_name["retrieve"]

    assert child.parent is not None
    assert child.parent.span_id == root.context.span_id


def test_span_records_exception(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    with pytest.raises(
        ValueError,
        match="Something went wrong",
    ):
        with span("retrieve"):
            raise ValueError("Something went wrong")

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span_data = spans[0]

    assert span_data.status.status_code == (
        trace.StatusCode.ERROR
    )

    assert len(span_data.events) > 0


def test_span_set_attribute(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    with span("agent") as current:
        current.set_attribute(
            "query.length",
            10,
        )

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    assert spans[0].attributes["query.length"] == 10


def test_span_add_event(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    with span("agent") as current:
        current.add_event(
            "retrieval.completed",
            attributes={
                "document.count": 5,
            },
        )

    spans = exporter.get_finished_spans()

    assert len(spans) == 1
    assert len(spans[0].events) == 1

    event = spans[0].events[0]

    assert event.name == "retrieval.completed"
    assert event.attributes["document.count"] == 5
def test_span_sets_sdk_metadata(setup_tracing):
    with span("test_span"):
        pass

    spans = setup_tracing.get_finished_spans()

    assert len(spans) == 1

    attributes = spans[0].attributes

    assert attributes["terrax.sdk.name"] == "terrax"
    assert attributes["terrax.sdk.version"] == "0.1.0"
def test_span_set_attributes(setup_tracing):
    with span("test_span") as current_span:
        current_span.set_attributes({
            "foo": "bar",
            "count": 10,
        })

    spans = setup_tracing.get_finished_spans()

    assert len(spans) == 1

    attributes = spans[0].attributes

    assert attributes["foo"] == "bar"
    assert attributes["count"] == 10
def test_span_record_exception(setup_tracing):
    error = ValueError("something went wrong")

    with span("test_span") as current_span:
        current_span.record_exception(error)

    spans = setup_tracing.get_finished_spans()

    assert len(spans) == 1

    events = spans[0].events

    assert any(
        event.name == "exception"
        for event in events
    )
def test_span_set_status(setup_tracing):
    with span("test_span") as current_span:
        current_span.set_status(
            StatusCode.ERROR,
            "Something failed",
        )

    spans = setup_tracing.get_finished_spans()

    assert len(spans) == 1

    assert spans[0].status.status_code == StatusCode.ERROR
    assert spans[0].status.description == "Something failed"
