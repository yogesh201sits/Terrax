import inspect
from functools import wraps
from typing import Any, Callable, TypeVar, overload

from opentelemetry.trace import Status, StatusCode

from .client import ensure_initialized
from .config import resolve_config
from .metadata import (
    set_common_metadata,
    set_function_metadata,
)
from .otel import get_tracer
from .redaction import redact_data
from .semantic import SpanType
from .serialization import bind_arguments, safe_serialize


F = TypeVar("F", bound=Callable[..., Any])


@overload
def observe(
    func: F,
) -> F:
    ...


@overload
def observe(
    *,
    name: str | None = None,
    kind: SpanType | str = SpanType.GENERIC,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    max_input_size: int | None = None,
    max_output_size: int | None = None,
    attributes: dict[str, Any] | None = None,
) -> Callable[[F], F]:
    ...


def observe(
    func: F | None = None,
    *,
    name: str | None = None,
    kind: SpanType | str = SpanType.GENERIC,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    max_input_size: int | None = None,
    max_output_size: int | None = None,
    attributes: dict[str, Any] | None = None,
):
    try:
        span_type = SpanType(kind)
    except ValueError:
        valid_kinds = ", ".join(
            item.value
            for item in SpanType
        )

        raise ValueError(
            f"Invalid span kind: {kind!r}. "
            f"Expected one of: {valid_kinds}"
        ) from None

    def decorator(fn: F) -> F:
        span_name = name or fn.__name__

        def configure_span(span: Any) -> None:
            set_common_metadata(span)

            span.set_attribute(
                "terrax.span.type",
                span_type.value,
            )

            set_function_metadata(
                span,
                function_name=fn.__name__,
                module_name=fn.__module__,
            )

            if attributes:
                for key, value in attributes.items():
                    span.set_attribute(
                        key,
                        value,
                    )

        if inspect.iscoroutinefunction(fn):

            @wraps(fn)
            async def async_wrapper(
                *args: Any,
                **kwargs: Any,
            ):
                ensure_initialized()

                resolved_config = resolve_config(
                    capture_input=capture_input,
                    capture_output=capture_output,
                    redact=redact,
                    max_input_size=max_input_size,
                    max_output_size=max_output_size,
                )

                tracer = get_tracer()

                with tracer.start_as_current_span(
                    span_name
                ) as span:
                    configure_span(span)

                    if resolved_config.capture_input:
                        inputs = bind_arguments(
                            fn,
                            args,
                            kwargs,
                        )

                        if resolved_config.redact:
                            inputs = redact_data(
                                inputs,
                                resolved_config.redact,
                            )

                        span.set_attribute(
                            "terrax.input",
                            safe_serialize(
                                inputs,
                                max_size=resolved_config.max_input_size,
                            ),
                        )

                    try:
                        result = await fn(
                            *args,
                            **kwargs,
                        )

                        if resolved_config.capture_output:
                            output = result

                            if resolved_config.redact:
                                output = redact_data(
                                    output,
                                    resolved_config.redact,
                                )

                            span.set_attribute(
                                "terrax.output",
                                safe_serialize(
                                    output,
                                    max_size=resolved_config.max_output_size,
                                ),
                            )

                        return result

                    except Exception as error:
                        span.record_exception(error)

                        span.set_status(
                            Status(StatusCode.ERROR)
                        )

                        raise

            return async_wrapper  # type: ignore[return-value]

        @wraps(fn)
        def sync_wrapper(
            *args: Any,
            **kwargs: Any,
        ):
            ensure_initialized()

            resolved_config = resolve_config(
                capture_input=capture_input,
                capture_output=capture_output,
                redact=redact,
                max_input_size=max_input_size,
                max_output_size=max_output_size,
            )

            tracer = get_tracer()

            with tracer.start_as_current_span(
                span_name
            ) as span:
                configure_span(span)

                if resolved_config.capture_input:
                    inputs = bind_arguments(
                        fn,
                        args,
                        kwargs,
                    )

                    if resolved_config.redact:
                        inputs = redact_data(
                            inputs,
                            resolved_config.redact,
                        )

                    span.set_attribute(
                        "terrax.input",
                        safe_serialize(
                            inputs,
                            max_size=resolved_config.max_input_size,
                        ),
                    )

                try:
                    result = fn(
                        *args,
                        **kwargs,
                    )

                    if resolved_config.capture_output:
                        output = result

                        if resolved_config.redact:
                            output = redact_data(
                                output,
                                resolved_config.redact,
                            )

                        span.set_attribute(
                            "terrax.output",
                            safe_serialize(
                                output,
                                max_size=resolved_config.max_output_size,
                            ),
                        )

                    return result

                except Exception as error:
                    span.record_exception(error)

                    span.set_status(
                        Status(StatusCode.ERROR)
                    )

                    raise

        return sync_wrapper  # type: ignore[return-value]

    if func is not None:
        return decorator(func)

    return decorator
