from config import initialize_terrax
from terrax import observe, shutdown

initialize_terrax()


@observe(name="fetch_data", capture_input=True, capture_output=True)
def fetch_data(query: str):
    return {
        "query": query,
        "data": ["result-1", "result-2"],
    }


@observe(name="process_data", capture_input=True, capture_output=True)
def process_data(data: dict):
    return {
        "count": len(data["data"]),
        "processed": True,
    }


@observe(name="agent", capture_input=True, capture_output=True)
def run_agent(query: str):
    data = fetch_data(query)
    result = process_data(data)

    return result


result = run_agent("test nested tracing")

print(result)

shutdown()