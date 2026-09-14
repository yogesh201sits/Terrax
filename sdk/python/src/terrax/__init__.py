from .config import TerraxConfig, configure, get_config
from .observe import observe
from .otel import (
    get_current_span,
    get_tracer,
    initialize_otel,
)

current_span = get_current_span

__all__ = [
    "TerraxConfig",
    "configure",
    "get_config",
    "initialize_otel",
    "get_tracer",
    "current_span",
    "observe",
]