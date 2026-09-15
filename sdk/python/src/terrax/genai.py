from typing import Any

from opentelemetry import trace

from .config import resolve_config
from .redaction import redact_data
from .serialization import serialize_messages


def _current_span():
    return trace.get_current_span()


def set_input(
    messages: list[dict[str, Any]],
    *,
    redact: list[str] | None = None,
    max_size: int | None = None,
) -> None:
    span = _current_span()

    if not span.is_recording():
        return

    config = resolve_config(
        redact=redact,
        max_input_size=max_size,
    )

    value: Any = messages

    if config.redact:
        value = redact_data(
            value,
            config.redact,
        )

    span.set_attribute(
        "gen_ai.input.messages",
        serialize_messages(
            value,
            max_size=config.max_input_size,
        ),
    )


def set_output(
    messages: list[dict[str, Any]],
    *,
    redact: list[str] | None = None,
    max_size: int | None = None,
) -> None:
    span = _current_span()

    if not span.is_recording():
        return

    config = resolve_config(
        redact=redact,
        max_output_size=max_size,
    )

    value: Any = messages

    if config.redact:
        value = redact_data(
            value,
            config.redact,
        )

    span.set_attribute(
        "gen_ai.output.messages",
        serialize_messages(
            value,
            max_size=config.max_output_size,
        ),
    )
    