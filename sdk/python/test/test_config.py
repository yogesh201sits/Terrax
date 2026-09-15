from terrax import configure
import pytest


def test_capture_input_from_environment(monkeypatch):
    monkeypatch.setenv("TERRAX_API_KEY", "test-key")
    monkeypatch.setenv("TERRAX_CAPTURE_INPUT", "true")

    config = configure()

    assert config.capture_input is True
def test_capture_output_from_environment(monkeypatch):
    monkeypatch.setenv("TERRAX_API_KEY", "test-key")
    monkeypatch.setenv("TERRAX_CAPTURE_OUTPUT", "true")

    config = configure()

    assert config.capture_output is True
def test_redact_from_environment(monkeypatch):
    monkeypatch.setenv("TERRAX_API_KEY", "test-key")
    monkeypatch.setenv(
        "TERRAX_REDACT",
        "password, token, api_key",
    )

    config = configure()

    assert config.redact == [
        "password",
        "token",
        "api_key",
    ]
def test_explicit_config_overrides_environment(monkeypatch):
    monkeypatch.setenv("TERRAX_API_KEY", "test-key")
    monkeypatch.setenv("TERRAX_CAPTURE_INPUT", "true")
    monkeypatch.setenv("TERRAX_CAPTURE_OUTPUT", "true")

    config = configure(
        capture_input=False,
        capture_output=False,
    )

    assert config.capture_input is False
    assert config.capture_output is False
def test_init_configures_terrax(monkeypatch):
    from terrax import init

    monkeypatch.setenv("TERRAX_API_KEY", "test-key")

    config = init()

    assert config.api_key == "test-key"
def test_configure_sets_payload_limits():
    config = configure(
        api_key="test-key",
        max_input_size=5_000,
        max_output_size=2_000,
    )

    assert config.max_input_size == 5_000
    assert config.max_output_size == 2_000


def test_configure_rejects_negative_input_size():
    with pytest.raises(
        ValueError,
        match="max_input_size must be greater than or equal to 0",
    ):
        configure(
            api_key="test-key",
            max_input_size=-1,
        )


def test_configure_rejects_negative_output_size():
    with pytest.raises(
        ValueError,
        match="max_output_size must be greater than or equal to 0",
    ):
        configure(
            api_key="test-key",
            max_output_size=-1,
        )


def test_configure_reads_payload_limits_from_environment(
    monkeypatch,
):
    monkeypatch.setenv(
        "TERRAX_MAX_INPUT_SIZE",
        "5000",
    )
    monkeypatch.setenv(
        "TERRAX_MAX_OUTPUT_SIZE",
        "2000",
    )

    config = configure(
        api_key="test-key",
    )

    assert config.max_input_size == 5_000
    assert config.max_output_size == 2_000
