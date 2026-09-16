from config import initialize_terrax

from terrax import (
    observe,
    set_input,
    set_output,
    set_model,
    set_provider,
    set_operation,
    set_usage,
    set_response,
    shutdown,
)

initialize_terrax()


@observe(name="llm_call", kind="llm")
def call_llm(query: str):
    set_provider("openai")
    set_model("gpt-4o")
    set_operation("chat")

    set_input([
        {
            "role": "user",
            "parts": [
                {
                    "type": "text",
                    "content": query,
                }
            ],
        }
    ])

    set_usage(
        input_tokens=120,
        output_tokens=80,
        reasoning_tokens=20,
    )

    response = "OpenTelemetry is an observability framework."

    set_output([
        {
            "role": "assistant",
            "parts": [
                {
                    "type": "text",
                    "content": response,
                }
            ],
            "finish_reason": "stop",
        }
    ])

    set_response(
        response_id="resp_123",
        model="gpt-4o",
        finish_reasons=["stop"],
    )

    return response


result = call_llm("What is OpenTelemetry?")

print(result)

shutdown()