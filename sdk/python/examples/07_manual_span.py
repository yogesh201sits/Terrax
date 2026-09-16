from config import initialize_terrax
from terrax import span, observe, shutdown

initialize_terrax()


@observe(name="research_agent")
def run_agent(query: str):
    with span(
        "database.search",
        kind="tool",
        attributes={
            "tool.name": "vector_search",
            "search.type": "semantic",
        },
    ) as current:
        current.set_attribute("query", query)

        results = [
            "OpenTelemetry is an observability framework.",
            "It provides traces, metrics, and logs.",
        ]

        current.set_attribute("result.count", len(results))

        return results


result = run_agent("What is OpenTelemetry?")

print(result)

shutdown()