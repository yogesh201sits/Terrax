from config import initialize_terrax
from terrax import observe, shutdown

initialize_terrax()


@observe(
    name="failing_agent",
    capture_input=True,
    capture_output=True,
)
def run_agent(query: str):
    raise ValueError("Something went wrong in the agent")


try:
    run_agent("test error handling")
except ValueError as error:
    print(f"Application caught: {error}")


shutdown()