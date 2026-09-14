import inspect
from functools import wraps
from typing import Any, Callable, TypeVar, overload

from opentelemetry.trace import Status, StatusCode

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
    capture_input: bool = False,
    capture_output: bool = False,
    redact: list[str] | None = None,
    attributes: dict[str, Any] | None = None,
) -> Callable[[F], F]:
    ...


def observe(
    func: F | None = None,
    *,
    name: str | None = None,
    kind: SpanType | str = SpanType.GENERIC,
    capture_input: bool = False,
    capture_output: bool = False,
    redact: list[str] | None = None,
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
            span.set_attribute(
                "terrax.span.type",
                span_type.value,
            )

            span.set_attribute(
                "terrax.function.name",
                fn.__name__,
            )

            if fn.__module__:
                span.set_attribute(
                    "terrax.function.module",
                    fn.__module__,
                )

            if attributes:
                for key, value in attributes.items():
                    span.set_attribute(key, value)

        if inspect.iscoroutinefunction(fn):

            @wraps(fn)
            async def async_wrapper(
                *args: Any,
                **kwargs: Any,
            ):
                tracer = get_tracer()

                with tracer.start_as_current_span(
                    span_name
                ) as span:
                    configure_span(span)

                    if capture_input:
                        inputs = bind_arguments(
                            fn,
                            args,
                            kwargs,
                        )

                        if redact:
                            inputs = redact_data(
                                inputs,
                                redact,
                            )

                        span.set_attribute(
                            "terrax.input",
                            safe_serialize(inputs),
                        )

                    try:
                        result = await fn(
                            *args,
                            **kwargs,
                        )

                        if capture_output:
                            output = result

                            if redact:
                                output = redact_data(
                                    output,
                                    redact,
                                )

                            span.set_attribute(
                                "terrax.output",
                                safe_serialize(output),
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
            tracer = get_tracer()

            with tracer.start_as_current_span(
                span_name
            ) as span:
                configure_span(span)

                if capture_input:
                    inputs = bind_arguments(
                        fn,
                        args,
                        kwargs,
                    )

                    if redact:
                        inputs = redact_data(
                            inputs,
                            redact,
                        )

                    span.set_attribute(
                        "terrax.input",
                        safe_serialize(inputs),
                    )

                try:
                    result = fn(
                        *args,
                        **kwargs,
                    )

                    if capture_output:
                        output = result

                        if redact:
                            output = redact_data(
                                output,
                                redact,
                            )

                        span.set_attribute(
                            "terrax.output",
                            safe_serialize(output),
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