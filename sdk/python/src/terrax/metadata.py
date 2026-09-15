from typing import Any


SDK_NAME = "terrax"
SDK_VERSION = "0.1.0"


def set_common_metadata(span: Any) -> None:
    span.set_attribute(
        "terrax.sdk.name",
        SDK_NAME,
    )

    span.set_attribute(
        "terrax.sdk.version",
        SDK_VERSION,
    )


def set_function_metadata(
    span: Any,
    *,
    function_name: str,
    module_name: str | None = None,
) -> None:
    span.set_attribute(
        "terrax.function.name",
        function_name,
    )

    if module_name:
        span.set_attribute(
            "terrax.function.module",
            module_name,
        )