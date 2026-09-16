from config import initialize_terrax
from terrax import (
    observe,
    set_model,
    set_provider,
    set_operation,
    set_usage,
    set_response,
    set_input,
    set_output,
    shutdown,
)

initialize_terrax()


@observe(name="llm_call", kind="llm")
def call_llm(prompt: str):
    set_provider("openai")
    set_model("gpt-4o")
    set_operation("chat")

    set_input([
        {
            "role": "user",
            "content": prompt,
        }
    ])

    set_usage(
        input_tokens=120,
        output_tokens=80,
        reasoning_tokens=20,
    )

    set_response(
        response_id="resp_123",
        model="gpt-4o",
        finish_reasons=["stop"],
    )

    response = "OpenTelemetry is an observability framework."

    set_output([
        {
            "role": "assistant",
            "content": response,
        }
    ])

    return response


result = call_llm("What is OpenTelemetry?")

print(result)

shutdown()