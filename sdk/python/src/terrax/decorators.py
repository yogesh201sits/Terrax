from typing import Any, Callable, TypeVar, overload

from .observe import observe
from .semantic import SpanType


F = TypeVar("F", bound=Callable[..., Any])


# =========================================================
# OBSERVE TOOL
# =========================================================

@overload
def observe_tool(func: F) -> F:
    ...


@overload
def observe_tool(
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


def observe_tool(
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
    def decorator(fn: F) -> F:
        tool_name = name or fn.__name__

        tool_attributes: dict[str, Any] = {
            "gen_ai.operation.name": "execute_tool",
            "gen_ai.tool.name": tool_name,
            "gen_ai.tool.type": "function",
        }

        if attributes:
            tool_attributes.update(attributes)

        return observe(
            name=tool_name,
            kind=SpanType.TOOL,
            capture_input=capture_input,
            capture_output=capture_output,
            redact=redact,
            max_input_size=max_input_size,
            max_output_size=max_output_size,
            input_attribute="gen_ai.tool.call.arguments",
            output_attribute="gen_ai.tool.call.result",
            attributes=tool_attributes,
        )(fn)

    if func is not None:
        return decorator(func)

    return decorator


# =========================================================
# OBSERVE WORKFLOW
# =========================================================

@overload
def observe_workflow(func: F) -> F:
    ...


@overload
def observe_workflow(
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


def observe_workflow(
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
    def decorator(fn: F) -> F:
        workflow_name = name or fn.__name__

        workflow_attributes: dict[str, Any] = {
            "gen_ai.operation.name": "invoke_workflow",
            "gen_ai.workflow.name": workflow_name,
        }

        if attributes:
            workflow_attributes.update(attributes)

        return observe(
            name=workflow_name,
            kind=SpanType.WORKFLOW,
            capture_input=capture_input,
            capture_output=capture_output,
            redact=redact,
            max_input_size=max_input_size,
            max_output_size=max_output_size,
            attributes=workflow_attributes,
        )(fn)

    if func is not None:
        return decorator(func)

    return decorator


# =========================================================
# OBSERVE LLM
# =========================================================

@overload
def observe_llm(func: F) -> F:
    ...


@overload
def observe_llm(
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


def observe_llm(
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
    llm_attributes: dict[str, Any] = {
        "gen_ai.operation.name": "chat",
    }

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


# =========================================================
# OBSERVE AGENT
# =========================================================

@overload
def observe_agent(func: F) -> F:
    ...


@overload
def observe_agent(
    *,
    name: str | None = None,
    agent_name: str | None = None,
    agent_version: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    max_input_size: int | None = None,
    max_output_size: int | None = None,
    attributes: dict[str, Any] | None = None,
) -> Callable[[F], F]:
    ...


def observe_agent(
    func: F | None = None,
    *,
    name: str | None = None,
    agent_name: str | None = None,
    agent_version: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    max_input_size: int | None = None,
    max_output_size: int | None = None,
    attributes: dict[str, Any] | None = None,
):
    def decorator(fn: F) -> F:
        resolved_agent_name = agent_name or name or fn.__name__

        agent_attributes: dict[str, Any] = {
            "gen_ai.operation.name": "invoke_agent",
            "gen_ai.agent.name": resolved_agent_name,
        }

        if agent_version is not None:
            agent_attributes["gen_ai.agent.version"] = agent_version

        if attributes:
            agent_attributes.update(attributes)

        return observe(
            name=name or resolved_agent_name,
            kind=SpanType.AGENT,
            capture_input=capture_input,
            capture_output=capture_output,
            redact=redact,
            max_input_size=max_input_size,
            max_output_size=max_output_size,
            attributes=agent_attributes,
        )(fn)

    if func is not None:
        return decorator(func)

    return decorator


# =========================================================
# OBSERVE RETRIEVER
# =========================================================

@overload
def observe_retriever(func: F) -> F:
    ...


@overload
def observe_retriever(
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


def observe_retriever(
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
    def decorator(fn: F) -> F:
        retriever_name = name or fn.__name__

        retriever_attributes: dict[str, Any] = {
            "gen_ai.operation.name": "retrieval",
        }

        if attributes:
            retriever_attributes.update(attributes)

        return observe(
            name=retriever_name,
            kind=SpanType.RETRIEVER,
            capture_input=capture_input,
            capture_output=capture_output,
            redact=redact,
            max_input_size=max_input_size,
            max_output_size=max_output_size,
            attributes=retriever_attributes,
        )(fn)

    if func is not None:
        return decorator(func)

    return decorator


# =========================================================
# OBSERVE EMBEDDING
# =========================================================

@overload
def observe_embedding(func: F) -> F:
    ...


@overload
def observe_embedding(
    *,
    model: str | None = None,
    name: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    max_input_size: int | None = None,
    max_output_size: int | None = None,
    attributes: dict[str, Any] | None = None,
) -> Callable[[F], F]:
    ...


def observe_embedding(
    func: F | None = None,
    *,
    model: str | None = None,
    name: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    max_input_size: int | None = None,
    max_output_size: int | None = None,
    attributes: dict[str, Any] | None = None,
):
    embedding_attributes: dict[str, Any] = {
        "gen_ai.operation.name": "embeddings",
    }

    if model is not None:
        embedding_attributes["gen_ai.request.model"] = model

    if attributes:
        embedding_attributes.update(attributes)

    decorator = observe(
        name=name,
        kind=SpanType.EMBEDDING,
        capture_input=capture_input,
        capture_output=capture_output,
        redact=redact,
        max_input_size=max_input_size,
        max_output_size=max_output_size,
        attributes=embedding_attributes,
    )

    if func is not None:
        return decorator(func)

    return decorator


# =========================================================
# BACKWARD COMPATIBILITY
# =========================================================

llm = observe_llm
tool = observe_tool
workflow = observe_workflow
agent = observe_agent
retriever = observe_retriever
embedding = observe_embedding