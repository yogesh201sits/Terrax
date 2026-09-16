import asyncio
from typing import Any

from config import initialize_terrax
from terrax import (
    SpanType,
    current_span,
    event,
    observe,
    observe_agent,
    observe_embedding,
    observe_llm,
    observe_retriever,
    observe_tool,
    observe_workflow,
    set_attribute,
    set_error,
    set_model,
    set_operation,
    set_provider,
    set_response,
    set_usage,
    span,
)


@observe(
    name="generic_function",
    capture_input=True,
    capture_output=True,
)
def generic_function(name: str, value: int) -> dict[str, Any]:
    return {"message": f"Hello {name}", "value": value}


@observe_tool(
    name="search_database",
    capture_input=True,
    capture_output=True,
)
def search_database(query: str) -> dict[str, Any]:
    return {
        "query": query,
        "results": [
            {"id": 1, "title": "OpenTelemetry"},
            {"id": 2, "title": "Terrax"},
        ],
    }


@observe_llm(
    name="llm_call",
    model="gpt-test-model",
    provider="test-provider",
    capture_input=True,
    capture_output=True,
)
def llm_call(prompt: str) -> dict[str, Any]:
    set_model("gpt-test-model")
    set_provider("test-provider")
    set_operation("chat")

    set_usage(
        input_tokens=120,
        output_tokens=80,
        reasoning_tokens=20,
    )

    set_response(
        response_id="resp_terrax_test_001",
        model="gpt-test-model",
        finish_reasons=["stop"],
    )

    return {
        "message": f"Generated response for: {prompt}",
        "finish_reason": "stop",
    }


@observe_workflow(
    name="research_workflow",
    capture_input=True,
    capture_output=True,
)
def research_workflow(query: str) -> dict[str, Any]:
    search = search_database(query)
    response = llm_call(f"Summarize: {search}")

    return {
        "query": query,
        "search": search,
        "response": response,
    }


@observe_agent(
    name="research_agent",
    agent_name="terrax-research-agent",
    agent_version="1.0.0",
    capture_input=True,
    capture_output=True,
)
def research_agent(query: str) -> dict[str, Any]:
    return research_workflow(query)


@observe_retriever(
    name="document_retriever",
    capture_input=True,
    capture_output=True,
)
def document_retriever(query: str) -> list[dict[str, Any]]:
    return [
        {
            "id": "doc-1",
            "content": "OpenTelemetry provides observability APIs.",
        },
        {
            "id": "doc-2",
            "content": "Terrax provides AI agent observability.",
        },
    ]


@observe_embedding(
    name="document_embedding",
    model="test-embedding-model",
    capture_input=True,
    capture_output=True,
)
def document_embedding(texts: list[str]) -> list[list[float]]:
    return [
        [0.12, 0.34, 0.56],
        [0.78, 0.90, 0.12],
    ]


def manual_span_test() -> dict[str, Any]:
    with span(
        "manual_semantic_span",
        kind=SpanType.GENERIC,
    ) as current:
        current.set_attribute(
            "manual.attribute",
            "hello",
        )

        current.set_attributes(
            {
                "manual.number": 123,
                "manual.boolean": True,
            }
        )

        current.set_model("manual-model")
        current.set_provider("manual-provider")

        current.set_usage(
            input_tokens=10,
            output_tokens=20,
        )

        current.set_response(
            response_id="manual-response",
            model="manual-model",
            finish_reasons=["stop"],
        )

        current.add_event(
            "manual_event",
            attributes={
                "source": "full-sdk-test",
                "value": "event works",
            },
        )

    return {"status": "manual span completed"}


@observe(name="current_span_helpers")
def current_span_helpers() -> dict[str, Any]:
    current_span().set_attribute(
        "current_span.test",
        "works",
    )

    set_attribute(
        "helper.attribute",
        "works",
    )

    set_model("helper-model")
    set_provider("helper-provider")
    set_operation("helper-operation")

    set_usage(
        input_tokens=50,
        output_tokens=25,
        reasoning_tokens=5,
    )

    set_response(
        response_id="helper-response",
        model="helper-model",
        finish_reasons=["stop"],
    )

    event(
        "helper_event",
        attributes={
            "source": "current-span-helper-test",
        },
    )

    return {"status": "helpers completed"}


@observe(name="nested_parent")
def nested_parent() -> dict[str, Any]:
    return {
        "parent": True,
        "child": nested_child(),
    }


@observe(name="nested_child")
def nested_child() -> dict[str, Any]:
    return {"child": True}


@observe(name="error_test")
def error_test() -> None:
    try:
        raise ValueError("Intentional Terrax SDK test error")
    except ValueError as error:
        set_error(str(error))

        event(
            "handled_error",
            attributes={
                "error_type": type(error).__name__,
                "handled": True,
            },
        )


@observe(
    name="async_function",
    capture_input=True,
    capture_output=True,
)
async def async_function(value: str) -> dict[str, Any]:
    await asyncio.sleep(0.05)

    return {
        "async": True,
        "value": value,
    }


@observe(name="event_test")
def event_test() -> dict[str, str]:
    event(
        "workflow_started",
        attributes={"stage": "start"},
    )

    event(
        "workflow_progress",
        attributes={
            "stage": "middle",
            "progress": 50,
        },
    )

    event(
        "workflow_completed",
        attributes={
            "stage": "end",
            "success": True,
        },
    )

    return {"status": "events completed"}


@observe(
    name="terrax_full_sdk_validation",
    capture_input=True,
    capture_output=True,
    attributes={
        "test.name": "full-sdk-validation",
        "test.version": "1.0",
    },
)
async def run_full_sdk_test() -> dict[str, Any]:
    results: dict[str, Any] = {}

    results["generic"] = generic_function(
        "Yogesh",
        22,
    )

    results["agent"] = research_agent(
        "What is OpenTelemetry?",
    )

    documents = document_retriever(
        "OpenTelemetry observability",
    )

    results["retriever"] = documents

    results["embedding"] = document_embedding(
        [doc["content"] for doc in documents],
    )

    results["manual_span"] = manual_span_test()

    results["current_span"] = current_span_helpers()

    results["nested"] = nested_parent()

    results["events"] = event_test()

    error_test()

    # Async span stays inside the root trace.
    results["async"] = await async_function(
        "async-test",
    )

    return results


async def main() -> None:
    initialize_terrax()

    print("Starting complete Terrax SDK validation...")

    result = await run_full_sdk_test()

    print("\nValidation completed.")
    print("\nResult:")
    print(result)

    print("\nCheck the Terrax dashboard for:")
    print("  terrax_full_sdk_validation")


if __name__ == "__main__":
    asyncio.run(main())