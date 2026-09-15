from terrax import init, observe, shutdown


init(
    api_key="terrax_test_key",
    endpoint="http://localhost:3000/v1/traces",
)


@observe(
    name="research_agent",
    capture_input=True,
    capture_output=True,
)
def run_agent(query: str):
    return {
        "answer": f"Research result for: {query}",
        "sources": 3,
    }


result = run_agent("What is OpenTelemetry?")

print(result)

shutdown()