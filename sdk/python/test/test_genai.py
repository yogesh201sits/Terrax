from opentelemetry import trace

from terrax import set_input, set_output


def test_set_input(setup_tracing):
    tracer = trace.get_tracer("test")

    messages = [
        {
            "role": "user",
            "content": "Hello Terrax",
        }
    ]

    with tracer.start_as_current_span("llm"):
        set_input(messages)

    exported = setup_tracing.get_finished_spans()

    assert len(exported) == 1

    value = exported[0].attributes["gen_ai.input.messages"]

    assert "Hello Terrax" in value
    assert '"role": "user"' in value


def test_set_output(setup_tracing):
    tracer = trace.get_tracer("test")

    messages = [
        {
            "role": "assistant",
            "content": "Hello!",
        }
    ]

    with tracer.start_as_current_span("llm"):
        set_output(messages)

    exported = setup_tracing.get_finished_spans()

    assert len(exported) == 1

    value = exported[0].attributes["gen_ai.output.messages"]

    assert "Hello!" in value
    assert '"role": "assistant"' in value

def test_set_input_redacts_sensitive_data(setup_tracing):
    tracer = trace.get_tracer("test")

    messages = [
        {
            "role": "user",
            "content": "my password is secret123",
            "password": "secret123",
        }
    ]

    with tracer.start_as_current_span("llm"):
        set_input(
            messages,
            redact=["password"],
        )

    exported = setup_tracing.get_finished_spans()

    assert len(exported) == 1

    value = exported[0].attributes["gen_ai.input.messages"]

    assert '"password": "[REDACTED]"' in value
    assert "my password is secret123" in value
def test_set_output_respects_max_size(setup_tracing):
    tracer = trace.get_tracer("test")

    messages = [
        {
            "role": "assistant",
            "content": "A" * 1000,
        }
    ]

    with tracer.start_as_current_span("llm"):
        set_output(
            messages,
            max_size=100,
        )

    exported = setup_tracing.get_finished_spans()

    assert len(exported) == 1

    value = exported[0].attributes["gen_ai.output.messages"]

    assert len(value) <= 100
    assert value.endswith("...<truncated>")


def test_helpers_do_not_fail_without_active_span():
    set_input(
        [
            {
                "role": "user",
                "content": "hello",
            }
        ]
    )

    set_output(
        [
            {
                "role": "assistant",
                "content": "hello",
            }
        ]
    )
