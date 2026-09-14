import inspect
from functools import wraps
from typing import Any, Callable, TypeVar, overload

from opentelemetry.trace import Status, StatusCode

from .otel import get_tracer
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
    capture_input: bool = False,
    capture_output: bool = False,
    attributes: dict[str, Any] | None = None,
) -> Callable[[F], F]:
    ...


def observe(
    func: F | None = None,
    *,
    name: str | None = None,
    capture_input: bool = False,
    capture_output: bool = False,
    attributes: dict[str, Any] | None = None,
):
    def decorator(fn: F) -> F:
        span_name = name or fn.__name__

        if inspect.iscoroutinefunction(fn):

            @wraps(fn)
            async def async_wrapper(*args: Any, **kwargs: Any):
                tracer = get_tracer()

                with tracer.start_as_current_span(span_name) as span:
                    if attributes:
                        for key, value in attributes.items():
                            span.set_attribute(key, value)

                    if capture_input:
                        inputs = bind_arguments(
                            fn,
                            args,
                            kwargs,
                        )

                        span.set_attribute(
                            "terrax.input",
                            safe_serialize(inputs),
                        )

                    try:
                        result = await fn(*args, **kwargs)

                        if capture_output:
                            span.set_attribute(
                                "terrax.output",
                                safe_serialize(result),
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
        def sync_wrapper(*args: Any, **kwargs: Any):
            tracer = get_tracer()

            with tracer.start_as_current_span(span_name) as span:
                if attributes:
                    for key, value in attributes.items():
                        span.set_attribute(key, value)

                if capture_input:
                    inputs = bind_arguments(
                        fn,
                        args,
                        kwargs,
                    )

                    span.set_attribute(
                        "terrax.input",
                        safe_serialize(inputs),
                    )

                try:
                    result = fn(*args, **kwargs)

                    if capture_output:
                        span.set_attribute(
                            "terrax.output",
                            safe_serialize(result),
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