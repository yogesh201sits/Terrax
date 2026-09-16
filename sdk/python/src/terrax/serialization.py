import json
from typing import Any


DEFAULT_MAX_SIZE = 10_000
TRUNCATED_SUFFIX = "...<truncated>"


def bind_arguments(
    func: Any,
    args: tuple[Any, ...],
    kwargs: dict[str, Any],
) -> dict[str, Any]:
    import inspect

    signature = inspect.signature(func)
    bound = signature.bind(*args, **kwargs)
    bound.apply_defaults()

    return dict(bound.arguments)


def safe_serialize(
    value: Any,
    *,
    max_size: int = DEFAULT_MAX_SIZE,
) -> str:
    """
    Safely serialize a Python value for telemetry.

    Serialization must never raise an exception that breaks
    the user's application.
    """

    try:
        normalized = _normalize(value)

        serialized = json.dumps(
            normalized,
            ensure_ascii=False,
            default=str,
        )

    except Exception:
        try:
            serialized = json.dumps(
                repr(value),
                ensure_ascii=False,
            )
        except Exception:
            serialized = '"<serialization_failed>"'

    return _truncate(
        serialized,
        max_size=max_size,
    )


def serialize_messages(
    messages: list[dict[str, Any]],
    *,
    max_size: int = DEFAULT_MAX_SIZE,
) -> str:
    """
    Safely serialize GenAI messages for telemetry.

    Uses the same normalization and truncation pipeline
    as regular Terrax payload serialization.
    """
    return safe_serialize(
        messages,
        max_size=max_size,
    )


def _normalize(
    value: Any,
    *,
    seen: set[int] | None = None,
) -> Any:
    if seen is None:
        seen = set()

    if value is None:
        return None

    if isinstance(
        value,
        (str, int, float, bool),
    ):
        return value

    object_id = id(value)

    if object_id in seen:
        return "<circular_reference>"

    if isinstance(value, dict):
        seen.add(object_id)

        try:
            return {
                str(key): _normalize(
                    item,
                    seen=seen,
                )
                for key, item in value.items()
            }
        finally:
            seen.remove(object_id)

    if isinstance(
        value,
        (list, tuple, set, frozenset),
    ):
        seen.add(object_id)

        try:
            return [
                _normalize(
                    item,
                    seen=seen,
                )
                for item in value
            ]
        finally:
            seen.remove(object_id)

    return repr(value)


def _truncate(
    value: str,
    *,
    max_size: int,
) -> str:
    if max_size <= 0:
        return ""

    if len(value) <= max_size:
        return value

    suffix_length = len(TRUNCATED_SUFFIX)

    if max_size <= suffix_length:
        return TRUNCATED_SUFFIX[:max_size]

    return (
        value[: max_size - suffix_length]
        + TRUNCATED_SUFFIX
    )
