from .client import init
from .config import TerraxConfig, configure, get_config
from .decorators import (
    observe_agent,
    observe_embedding,
    observe_llm,
    observe_retriever,
    observe_tool,
    observe_workflow,
)
from .events import event
from .genai import set_input, set_output
from .observe import observe
from .otel import (
    get_current_span,
    get_tracer,
    initialize_otel,
    shutdown_otel,
)
from .semantic import SpanType
from .semantic_helpers import (
    set_attribute,
    set_error,
    set_model,
    set_operation,
    set_provider,
    set_response,
    set_usage,
)
from .spans import Span, span


current_span = get_current_span

shutdown = shutdown_otel


# Backward-compatible aliases.
llm = observe_llm
tool = observe_tool
workflow = observe_workflow
agent = observe_agent
retriever = observe_retriever
embedding = observe_embedding


__all__ = [
    # Configuration
    "TerraxConfig",
    "configure",
    "get_config",

    # OpenTelemetry
    "initialize_otel",
    "get_tracer",
    "current_span",

    # Core instrumentation
    "observe",

    # Semantic decorators
    "observe_agent",
    "observe_embedding",
    "observe_llm",
    "observe_retriever",
    "observe_tool",
    "observe_workflow",

    # Backward-compatible decorators
    "agent",
    "embedding",
    "llm",
    "retriever",
    "tool",
    "workflow",

    # Semantic types
    "SpanType",

    # Events
    "event",

    # Manual spans
    "Span",
    "span",

    # GenAI helpers
    "set_input",
    "set_output",
    "set_model",
    "set_provider",
    "set_operation",
    "set_response",
    "set_usage",

    # Generic helpers
    "set_attribute",
    "set_error",

    # Lifecycle
    "init",
    "shutdown_otel",
    "shutdown",
]
