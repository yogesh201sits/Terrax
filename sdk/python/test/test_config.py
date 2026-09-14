from terrax import configure


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