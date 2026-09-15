from typing import Any

from opentelemetry import trace

from .config import resolve_config
from .redaction import redact_data
from .serialization import safe_serialize


def event(
    name: str,
    *,
    attributes: dict[str, Any] | None = None,
    redact: list[str] | None = None,
) -> None:
    span = trace.get_current_span()

    if not span.is_recording():
        return

    if not attributes:
        span.add_event(name)
        return

    config = resolve_config(redact=redact)

    value: Any = attributes

    if config.redact:
        value = redact_data(
            value,
            config.redact,
        )

    normalized_attributes: dict[str, Any] = {}

    for key, item in value.items():
        if isinstance(item, (str, int, float, bool)):
            normalized_attributes[key] = item
        else:
            normalized_attributes[key] = safe_serialize(item)

    span.add_event(
        name,
        attributes=normalized_attributes,
    )