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
    max_input_size: int | None = None,
    max_output_size: int | None = None,
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
    max_input_size: int | None = None,
    max_output_size: int | None = None,
    attributes: dict[str, Any] | None = None,
):
    decorator = observe(
        name=name,
        kind=SpanType.TOOL,
        capture_input=capture_input,
        capture_output=capture_output,
        redact=redact,
        max_input_size=max_input_size,
        max_output_size=max_output_size,
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
    max_input_size: int | None = None,
    max_output_size: int | None = None,
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
    max_input_size: int | None = None,
    max_output_size: int | None = None,
    attributes: dict[str, Any] | None = None,
):
    decorator = observe(
        name=name,
        kind=SpanType.WORKFLOW,
        capture_input=capture_input,
        capture_output=capture_output,
        redact=redact,
        max_input_size=max_input_size,
        max_output_size=max_output_size,
        attributes=attributes,
    )

    if func is not None:
        return decorator(func)

    return decorator


@overload
def llm(func: F) -> F:
    ...


@overload
def llm(
    *,
    model: str | None = None,
    provider: str | None = None,
    name: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    max_input_size: int | None = None,
    max_output_size: int | None = None,
    attributes: dict[str, Any] | None = None,
) -> Callable[[F], F]:
    ...


def llm(
    func: F | None = None,
    *,
    model: str | None = None,
    provider: str | None = None,
    name: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    max_input_size: int | None = None,
    max_output_size: int | None = None,
    attributes: dict[str, Any] | None = None,
):
    llm_attributes: dict[str, Any] = {}

    if model is not None:
        llm_attributes["gen_ai.request.model"] = model

    if provider is not None:
        llm_attributes["gen_ai.provider.name"] = provider

    if attributes:
        llm_attributes.update(attributes)

    decorator = observe(
        name=name,
        kind=SpanType.LLM,
        capture_input=capture_input,
        capture_output=capture_output,
        redact=redact,
        max_input_size=max_input_size,
        max_output_size=max_output_size,
        attributes=llm_attributes,
    )

    if func is not None:
        return decorator(func)

    return decorator

