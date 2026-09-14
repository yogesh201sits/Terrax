from typing import Any, Callable, TypeVar, overload

from .observe import observe
from .semantic import SpanType


F = TypeVar("F", bound=Callable[..., Any])


@overload
def tool(func: F) -> F:
    ...


@overload
def tool(
    *,
    name: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    attributes: dict[str, Any] | None = None,
) -> Callable[[F], F]:
    ...


def tool(
    func: F | None = None,
    *,
    name: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    attributes: dict[str, Any] | None = None,
):
    decorator = observe(
        name=name,
        kind=SpanType.TOOL,
        capture_input=capture_input,
        capture_output=capture_output,
        redact=redact,
        attributes=attributes,
    )

    if func is not None:
        return decorator(func)

    return decorator


@overload
def workflow(func: F) -> F:
    ...


@overload
def workflow(
    *,
    name: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    attributes: dict[str, Any] | None = None,
) -> Callable[[F], F]:
    ...


def workflow(
    func: F | None = None,
    *,
    name: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    attributes: dict[str, Any] | None = None,
):
    decorator = observe(
        name=name,
        kind=SpanType.WORKFLOW,
        capture_input=capture_input,
        capture_output=capture_output,
        redact=redact,
        attributes=attributes,
    )

    if func is not None:
        return decorator(func)

    return decorator