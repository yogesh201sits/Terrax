import os

from terrax import init, observe, shutdown


init(
    api_key=os.getenv("TERRAX_API_KEY"),
    endpoint="http://localhost:3000/v1/traces",
)


@observe(capture_input=True, capture_output=True)
def run_agent(query: str):
    return {
        "answer": f"Processed: {query}",
    }


result = run_agent("hello")

print(result)

shutdown()