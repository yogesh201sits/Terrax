from config import initialize_terrax
from terrax import observe, shutdown, current_span


initialize_terrax()


@observe(
    name="capture_test",
    capture_input=True,
    capture_output=True,
)
def process_user(
    name: str,
    age: int = 21,
    role: str = "developer",
):
    span = current_span()

    print("SPAN RECORDING:", span.is_recording())

    return {
        "message": f"Hello {name}",
        "profile": {
            "age": age,
            "role": role,
        },
        "skills": [
            "Python",
            "OpenTelemetry",
            "AI",
        ],
    }


result = process_user(
    name="Yogesh",
    age=22,
)

print("RESULT:")
print(result)

shutdown()