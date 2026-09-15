from config import initialize_terrax
from terrax import (
    observe,
    tool,
    llm,
    event,
    set_provider,
    set_model,
    set_operation,
    set_usage,
    set_response,
    set_input,
    set_output,
    shutdown,
)

initialize_terrax()


@tool
def search_documents(query: str):
    event(
        "search.started",
        attributes={"query": query},
    )

    results = [
        "OpenTelemetry provides distributed tracing.",
        "OTLP is OpenTelemetry's telemetry protocol.",
        "Terrax uses OpenTelemetry for AI agent observability.",
    ]

    event(
        "search.completed",
        attributes={"result_count": len(results)},
    )

    return results


@llm
def generate_answer(query: str, context: list[str]):
    set_provider("openai")
    set_model("gpt-4o")
    set_operation("chat")

    set_input([
        {
            "role": "user",
            "content": query,
        }
    ])

    set_usage(
        input_tokens=150,
        output_tokens=80,
        reasoning_tokens=20,
    )

    answer = (
        "OpenTelemetry is an open-source observability "
        "framework for collecting telemetry such as traces, "
        "metrics, and logs."
    )

    set_output([
        {
            "role": "assistant",
            "content": answer,
        }
    ])

    set_response(
        response_id="response_123",
        model="gpt-4o",
        finish_reasons=["stop"],
    )

    return answer


@observe(
    name="research_agent",
    capture_input=True,
    capture_output=True,
    attributes={
        "agent.name": "research-agent",
        "agent.version": "1.0",
    },
)
def run_agent(query: str):
    event(
        "agent.started",
        attributes={"query": query},
    )

    documents = search_documents(query)

    answer = generate_answer(
        query,
        documents,
    )

    event(
        "agent.completed",
        attributes={
            "documents": len(documents),
        },
    )

    return {
        "answer": answer,
        "sources": len(documents),
    }


try:
    result = run_agent(
        "What is OpenTelemetry?"
    )

    print("RESULT:")
    print(result)

finally:
    shutdown()