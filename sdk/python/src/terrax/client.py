from .config import TerraxConfig, configure
from .otel import initialize_otel


def init(
    *,
    api_key: str | None = None,
    endpoint: str | None = None,
    service_name: str | None = None,
    service_version: str | None = None,
    environment: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
) -> TerraxConfig:
    config = configure(
        api_key=api_key,
        endpoint=endpoint,
        service_name=service_name,
        service_version=service_version,
        environment=environment,
        capture_input=capture_input,
        capture_output=capture_output,
        redact=redact,
    )

    initialize_otel()

    return config


def ensure_initialized() -> None:
    try:
        from .config import get_config

        get_config()
    except RuntimeError:
        try:
            configure()
        except ValueError:
            return

    initialize_otel()