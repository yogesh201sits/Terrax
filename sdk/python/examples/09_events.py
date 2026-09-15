from config import initialize_terrax
from terrax import observe, event, shutdown

initialize_terrax()


@observe(name="agent_run")
def run_agent(query: str):
    event(
        "agent.started",
        attributes={
            "query": query,
            "agent.version": "v1",
        },
    )

    result = "Research completed"

    event(
        "agent.completed",
        attributes={
            "result": result,
            "result_count": 3,
        },
    )

    return result


result = run_agent("What is OpenTelemetry?")

print(result)

shutdown()