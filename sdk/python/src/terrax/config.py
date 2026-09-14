import os
from dataclasses import dataclass


@dataclass
class TerraxConfig:
    api_key: str
    endpoint: str
    service_name: str = "terrax-python"
    service_version: str = "0.1.0"
    environment: str = "development"


_config: TerraxConfig | None = None


def configure(
    *,
    api_key: str | None = None,
    endpoint: str | None = None,
    service_name: str | None = None,
    service_version: str | None = None,
    environment: str | None = None,
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

    _config = TerraxConfig(
        api_key=api_key,
        endpoint=endpoint,
        service_name=service_name
        or os.getenv("TERRAX_SERVICE_NAME", "terrax-python"),
        service_version=service_version
        or os.getenv("TERRAX_SERVICE_VERSION", "0.1.0"),
        environment=environment
        or os.getenv("TERRAX_ENVIRONMENT", "development"),
    )

    return _config


def get_config() -> TerraxConfig:
    if _config is None:
        raise RuntimeError(
            "Terrax is not configured. Call configure() first."
        )

    return _config