from typing import Any

from opentelemetry import trace


def _current_span():
    return trace.get_current_span()


def set_model(model: str) -> None:
    span = _current_span()

    if not span.is_recording():
        return

    span.set_attribute(
        "gen_ai.request.model",
        model,
    )


def set_provider(provider: str) -> None:
    span = _current_span()

    if not span.is_recording():
        return

    span.set_attribute(
        "gen_ai.provider.name",
        provider,
    )


def set_usage(
    *,
    input_tokens: int | None = None,
    output_tokens: int | None = None,
    reasoning_tokens: int | None = None,
) -> None:
    span = _current_span()

    if not span.is_recording():
        return

    if input_tokens is not None:
        span.set_attribute(
            "gen_ai.usage.input_tokens",
            input_tokens,
        )

    if output_tokens is not None:
        span.set_attribute(
            "gen_ai.usage.output_tokens",
            output_tokens,
        )

    if reasoning_tokens is not None:
        span.set_attribute(
            "gen_ai.usage.reasoning.output_tokens",
            reasoning_tokens,
        )


def set_response(
    *,
    response_id: str | None = None,
    model: str | None = None,
    finish_reasons: list[str] | None = None,
) -> None:
    span = _current_span()

    if not span.is_recording():
        return

    if response_id is not None:
        span.set_attribute(
            "gen_ai.response.id",
            response_id,
        )

    if model is not None:
        span.set_attribute(
            "gen_ai.response.model",
            model,
        )

    if finish_reasons is not None:
        span.set_attribute(
            "gen_ai.response.finish_reasons",
            finish_reasons,
        )


def set_attribute(
    key: str,
    value: Any,
) -> None:
    span = _current_span()

    if not span.is_recording():
        return

    span.set_attribute(
        key,
        value,
    )
