import json
from typing import Any


DEFAULT_MAX_SIZE = 10_000


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
    Safely serialize a Python value into a JSON string.

    The result is always a string so it can safely be stored
    as an OpenTelemetry span attribute.
    """

    seen: set[int] = set()

    def normalize(obj: Any) -> Any:
        if obj is None:
            return None

        if isinstance(obj, (str, int, float, bool)):
            return obj

        object_id = id(obj)

        if object_id in seen:
            return "<circular_reference>"

        if isinstance(obj, dict):
            seen.add(object_id)

            result = {
                str(key): normalize(value)
                for key, value in obj.items()
            }

            seen.remove(object_id)

            return result

        if isinstance(obj, (list, tuple, set)):
            seen.add(object_id)

            result = [
                normalize(item)
                for item in obj
            ]

            seen.remove(object_id)

            return result

        return repr(obj)

    normalized = normalize(value)

    try:
        serialized = json.dumps(
            normalized,
            ensure_ascii=False,
            default=str,
        )
    except Exception:
        serialized = json.dumps(
            repr(value),
            ensure_ascii=False,
        )

    if len(serialized) > max_size:
        serialized = (
            serialized[:max_size]
            + "...<truncated>"
        )

    return serialized