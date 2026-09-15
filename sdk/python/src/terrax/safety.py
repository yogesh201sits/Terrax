from typing import Any, Callable


def safe_telemetry(
    operation: Callable[[], Any],
) -> Any | None:
    """
    Execute a telemetry operation without affecting
    the user's application.
    """
    try:
        return operation()
    except Exception:
        return None