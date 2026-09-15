from opentelemetry import trace

from terrax import (
    set_attribute,
    set_model,
    set_provider,
    set_response,
    set_usage,
)


def test_set_model(setup_tracing):
    tracer = trace.get_tracer("test")

    with tracer.start_as_current_span("llm") as span:
        set_model("gpt-4o")

    exported = setup_tracing.get_finished_spans()

    assert len(exported) == 1
    assert exported[0].attributes["gen_ai.request.model"] == "gpt-4o"


def test_set_provider(setup_tracing):
    tracer = trace.get_tracer("test")

    with tracer.start_as_current_span("llm") as span:
        set_provider("openai")

    exported = setup_tracing.get_finished_spans()

    assert len(exported) == 1
    assert exported[0].attributes["gen_ai.provider.name"] == "openai"


def test_set_usage(setup_tracing):
    tracer = trace.get_tracer("test")

    with tracer.start_as_current_span("llm"):
        set_usage(
            input_tokens=120,
            output_tokens=80,
            reasoning_tokens=20,
        )

    exported = setup_tracing.get_finished_spans()

    assert len(exported) == 1

    attributes = exported[0].attributes

    assert attributes["gen_ai.usage.input_tokens"] == 120
    assert attributes["gen_ai.usage.output_tokens"] == 80
    assert attributes["gen_ai.usage.reasoning.output_tokens"] == 20


def test_set_response(setup_tracing):
    tracer = trace.get_tracer("test")

    with tracer.start_as_current_span("llm"):
        set_response(
            response_id="resp_123",
            model="gpt-4o-2026",
            finish_reasons=["stop"],
        )

    exported = setup_tracing.get_finished_spans()

    assert len(exported) == 1

    attributes = exported[0].attributes

    assert attributes["gen_ai.response.id"] == "resp_123"
    assert attributes["gen_ai.response.model"] == "gpt-4o-2026"
    assert attributes["gen_ai.response.finish_reasons"] == ("stop",)


def test_set_attribute(setup_tracing):
    tracer = trace.get_tracer("test")

    with tracer.start_as_current_span("agent"):
        set_attribute(
            "agent.name",
            "research-agent",
        )

    exported = setup_tracing.get_finished_spans()

    assert len(exported) == 1
    assert (
        exported[0].attributes["agent.name"]
        == "research-agent"
    )
def test_helpers_do_not_fail_without_active_span():
    set_model("gpt-4o")
    set_provider("openai")

    set_usage(
        input_tokens=10,
        output_tokens=20,
    )

    set_response(
        response_id="resp_123",
        model="gpt-4o",
        finish_reasons=["stop"],
    )

    set_attribute(
        "test.attribute",
        "value",
    )
