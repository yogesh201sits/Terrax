from terrax import observe, shutdown

from config import initialize_terrax


initialize_terrax()


@observe()
def greet(name: str):
    return f"Hello {name}"


print(greet("Yogesh"))

shutdown()