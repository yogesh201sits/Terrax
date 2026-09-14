from typing import Any

from .otel import get_current_span


def event(
    name: str,
    *,
    attributes: dict[str, Any] | None = None,
) -> None:
    span = get_current_span()

    if span is None or not span.is_recording():
        return

    span.add_event(
        name,
        attributes=attributes,
    )