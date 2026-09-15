from .config import TerraxConfig, configure, get_config
from .decorators import llm, tool, workflow
from .observe import observe
from .otel import (
    get_current_span,
    get_tracer,
    initialize_otel,
    shutdown_otel,
)
from .semantic import SpanType
from .events import event
from .client import init
from .spans import Span, span
from .semantic_helpers import (
    set_attribute,
    set_model,
    set_provider,
    set_response,
    set_usage,
)


current_span = get_current_span

shutdown = shutdown_otel


__all__ = [
    "TerraxConfig",
    "SpanType",
    "configure",
    "get_config",
    "initialize_otel",
    "get_tracer",
    "current_span",
    "observe",
    "llm",
    "tool",
    "workflow",
    "event",
    "shutdown_otel",
    "shutdown",
    "init",
    "Span",
    "span",
    "set_attribute",
    "set_model",
    "set_provider",
    "set_response",
    "set_usage",
]
