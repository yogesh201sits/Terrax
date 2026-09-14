from typing import Any


REDACTED = "[REDACTED]"


def redact_data(
    value: Any,
    keys: list[str],
) -> Any:
    key_set = {key.lower() for key in keys}

    def redact(obj: Any) -> Any:
        if isinstance(obj, dict):
            return {
                str(key): (
                    REDACTED
                    if str(key).lower() in key_set
                    else redact(item)
                )
                for key, item in obj.items()
            }

        if isinstance(obj, list):
            return [redact(item) for item in obj]

        if isinstance(obj, tuple):
            return tuple(redact(item) for item in obj)

        if isinstance(obj, set):
            return {redact(item) for item in obj}

        return obj

    return redact(value)