import asyncio

from config import initialize_terrax

from terrax import (
    event,
    observe,
    set_attribute,
    set_input,
    set_model,
    set_operation,
    set_output,
    set_provider,
    set_response,
    set_usage,
    shutdown,
    span,
    tool,
    llm,
    workflow,
)


initialize_terrax()


# ---------------------------------------------------------
# Child spans
# ---------------------------------------------------------

@observe(
    name="capture_test",
    capture_input=True,
    capture_output=True,
    redact=["password", "token"],
)
def capture_test(
    name: str,
    password: str,
    token: str,
):
    return {
        "name": name,
        "token": token,
    }


@tool
def search_tool(query: str):
    event(
        "tool.started",
        attributes={
            "query": query,
        },
    )

    result = {
        "query": query,
        "results": [
            "OpenTelemetry",
            "OTLP",
        ],
    }

    event(
        "tool.completed",
        attributes={
            "result_count": 2,
        },
    )

    return result


@llm
def llm_call(query: str, context: dict):
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
        input_tokens=100,
        output_tokens=50,
        reasoning_tokens=10,
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
        response_id="sdk-test-response",
        model="gpt-4o",
        finish_reasons=["stop"],
    )

    return response


@workflow
def semantic_workflow(query: str):
    search_result = search_tool(query)

    return llm_call(
        query,
        search_result,
    )


@observe(name="async_test")
async def async_test():
    await asyncio.sleep(0.01)
    return "async works"


@observe(
    name="nested_parent",
    capture_input=True,
    capture_output=True,
)
def nested_parent():
    return nested_child()


@observe(
    name="nested_child",
    capture_input=True,
    capture_output=True,
)
def nested_child():
    return {
        "nested": True,
    }


def manual_span_test():
    with span(
        "manual_tool",
        kind="tool",
        attributes={
            "tool.name": "manual-test-tool",
        },
    ) as current:
        current.set_attribute(
            "manual.test",
            "working",
        )

        event(
            "manual.span.event",
            attributes={
                "status": "success",
            },
        )

        return "manual span works"


def current_span_test():
    set_attribute(
        "test.current_span",
        "working",
    )

    return "current span works"


def error_test():
    raise ValueError("Expected SDK test error")


# ---------------------------------------------------------
# ONE ROOT TRACE
# ---------------------------------------------------------

@observe(
    name="terrax_sdk_full_validation",
    capture_input=True,
    capture_output=True,
    attributes={
        "test.type": "full-sdk-validation",
        "test.version": "1",
    },
)
async def full_sdk_test():
    print("\n=== Terrax SDK Full Validation ===\n")

    # 1. Basic execution
    print("1. Basic observe")
    basic_result = "basic observe works"
    print(basic_result)

    # 2. Input / output capture + redaction
    print("\n2. Capture + redaction")
    capture_result = capture_test(
        name="Yogesh",
        password="SUPER_SECRET_PASSWORD",
        token="SUPER_SECRET_TOKEN",
    )
    print(capture_result)

    # 3. Custom attributes
    print("\n3. Custom attributes")
    set_attribute(
        "test.custom",
        "custom attribute works",
    )

    # 4. Events
    print("\n4. Events")

    event(
        "sdk.test.started",
        attributes={
            "step": "events",
        },
    )

    event(
        "sdk.test.metadata",
        attributes={
            "nested": {
                "value": True,
            },
        },
    )

    # 5. Manual span
    print("\n5. Manual span")
    print(manual_span_test())

    # 6. Semantic workflow
    print("\n6. Workflow → Tool → LLM")

    workflow_result = semantic_workflow(
        "What is OpenTelemetry?"
    )

    print(workflow_result)

    # 7. Nested observe
    print("\n7. Nested spans")

    nested_result = nested_parent()

    print(nested_result)

    # 8. Current span
    print("\n8. Current span")
    print(current_span_test())

    # 9. Async
    print("\n9. Async")
    async_result = await async_test()

    print(async_result)

    # 10. Error handling
    print("\n10. Error handling")

    try:
        error_test()
    except ValueError as error:
        print(f"Exception propagated correctly: {error}")

    # 11. Completion event
    event(
        "sdk.test.completed",
        attributes={
            "status": "success",
        },
    )

    result = {
        "status": "passed",
        "tests": 11,
    }

    print("\n=== SDK Validation Complete ===")

    return result


try:
    result = asyncio.run(full_sdk_test())

    print("\nFINAL RESULT:")
    print(result)

finally:
    shutdown()