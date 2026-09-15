import os
from dataclasses import dataclass


DEFAULT_MAX_INPUT_SIZE = 10_000
DEFAULT_MAX_OUTPUT_SIZE = 10_000


@dataclass
class TerraxConfig:
    api_key: str
    endpoint: str
    service_name: str = "terrax-python"
    service_version: str = "0.1.0"
    environment: str = "development"
    capture_input: bool = False
    capture_output: bool = False
    redact: list[str] | None = None
    max_input_size: int = DEFAULT_MAX_INPUT_SIZE
    max_output_size: int = DEFAULT_MAX_OUTPUT_SIZE


@dataclass(frozen=True)
class ResolvedConfig:
    capture_input: bool
    capture_output: bool
    redact: list[str] | None
    max_input_size: int
    max_output_size: int


_config: TerraxConfig | None = None


def _parse_bool(
    value: str | None,
    default: bool = False,
) -> bool:
    if value is None:
        return default

    return value.strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


def configure(
    *,
    api_key: str | None = None,
    endpoint: str | None = None,
    service_name: str | None = None,
    service_version: str | None = None,
    environment: str | None = None,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    max_input_size: int | None = None,
    max_output_size: int | None = None,
) -> TerraxConfig:
    global _config

    api_key = api_key or os.getenv("TERRAX_API_KEY")

    endpoint = endpoint or os.getenv(
        "TERRAX_ENDPOINT",
        "http://localhost:3000/v1/traces",
    )

    if not api_key:
        raise ValueError(
            "Terrax API key is required. "
            "Pass api_key to configure() or set TERRAX_API_KEY."
        )

    if capture_input is None:
        capture_input = _parse_bool(
            os.getenv("TERRAX_CAPTURE_INPUT"),
            False,
        )

    if capture_output is None:
        capture_output = _parse_bool(
            os.getenv("TERRAX_CAPTURE_OUTPUT"),
            False,
        )

    if redact is None:
        redact_env = os.getenv("TERRAX_REDACT")

        if redact_env:
            redact = [
                key.strip()
                for key in redact_env.split(",")
                if key.strip()
            ]

    if max_input_size is None:
        max_input_size = int(
            os.getenv(
                "TERRAX_MAX_INPUT_SIZE",
                str(DEFAULT_MAX_INPUT_SIZE),
            )
        )

    if max_output_size is None:
        max_output_size = int(
            os.getenv(
                "TERRAX_MAX_OUTPUT_SIZE",
                str(DEFAULT_MAX_OUTPUT_SIZE),
            )
        )

    if max_input_size < 0:
        raise ValueError(
            "max_input_size must be greater than or equal to 0."
        )

    if max_output_size < 0:
        raise ValueError(
            "max_output_size must be greater than or equal to 0."
        )

    _config = TerraxConfig(
        api_key=api_key,
        endpoint=endpoint,
        service_name=(
            service_name
            or os.getenv(
                "TERRAX_SERVICE_NAME",
                "terrax-python",
            )
        ),
        service_version=(
            service_version
            or os.getenv(
                "TERRAX_SERVICE_VERSION",
                "0.1.0",
            )
        ),
        environment=(
            environment
            or os.getenv(
                "TERRAX_ENVIRONMENT",
                "development",
            )
        ),
        capture_input=capture_input,
        capture_output=capture_output,
        redact=redact,
        max_input_size=max_input_size,
        max_output_size=max_output_size,
    )

    return _config


def get_config() -> TerraxConfig:
    if _config is None:
        raise RuntimeError(
            "Terrax is not configured. Call configure() first."
        )

    return _config


def resolve_config(
    *,
    capture_input: bool | None = None,
    capture_output: bool | None = None,
    redact: list[str] | None = None,
    max_input_size: int | None = None,
    max_output_size: int | None = None,
) -> ResolvedConfig:
    try:
        config = get_config()
    except RuntimeError:
        config = None

    resolved_input_size = (
        max_input_size
        if max_input_size is not None
        else config.max_input_size
        if config is not None
        else DEFAULT_MAX_INPUT_SIZE
    )

    resolved_output_size = (
        max_output_size
        if max_output_size is not None
        else config.max_output_size
        if config is not None
        else DEFAULT_MAX_OUTPUT_SIZE
    )

    if resolved_input_size < 0:
        raise ValueError(
            "max_input_size must be greater than or equal to 0."
        )

    if resolved_output_size < 0:
        raise ValueError(
            "max_output_size must be greater than or equal to 0."
        )

    return ResolvedConfig(
        capture_input=(
            capture_input
            if capture_input is not None
            else config.capture_input
            if config is not None
            else False
        ),
        capture_output=(
            capture_output
            if capture_output is not None
            else config.capture_output
            if config is not None
            else False
        ),
        redact=(
            redact
            if redact is not None
            else config.redact
            if config is not None
            else None
        ),
        max_input_size=resolved_input_size,
        max_output_size=resolved_output_size,
    )
