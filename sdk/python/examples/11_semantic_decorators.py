from config import initialize_terrax
from terrax import (
    initialize_otel,
    tool,
    llm,
    workflow,
    set_model,
    set_provider,
    set_usage,
    shutdown,
)

initialize_terrax()


@tool
def search_web(query: str):
    return {
        "query": query,
        "results": ["OpenTelemetry", "OpenTracing"],
    }


@llm
def generate_answer(prompt: str):
    set_provider("openai")
    set_model("gpt-4o")
    set_usage(
        input_tokens=100,
        output_tokens=50,
    )

    return "OpenTelemetry is an observability framework."


@workflow
def research_workflow(query: str):
    search_result = search_web(query)

    answer = generate_answer(
        f"Answer using: {search_result}"
    )

    return answer


result = research_workflow(
    "What is OpenTelemetry?"
)

print(result)

shutdown()