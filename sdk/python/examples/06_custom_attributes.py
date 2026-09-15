from config import initialize_terrax
from terrax import observe, shutdown

initialize_terrax()


@observe(
    name="research_agent",
    attributes={
        "agent.type": "research",
        "agent.version": "v2",
        "experiment": "custom-attributes",
    },
)
def run_agent(query: str):
    return {
        "answer": f"Result for: {query}",
    }


result = run_agent("What is OpenTelemetry?")

print(result)

shutdown()