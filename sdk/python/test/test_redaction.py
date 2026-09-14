from terrax.redaction import redact_data


def test_redacts_matching_keys():
    result = redact_data(
        {
            "username": "yogesh",
            "password": "secret",
            "api_key": "abc123",
        },
        ["password", "api_key"],
    )

    assert result == {
        "username": "yogesh",
        "password": "[REDACTED]",
        "api_key": "[REDACTED]",
    }


def test_redaction_is_case_insensitive():
    result = redact_data(
        {
            "Password": "secret",
            "API_KEY": "abc123",
        },
        ["password", "api_key"],
    )

    assert result["Password"] == "[REDACTED]"
    assert result["API_KEY"] == "[REDACTED]"


def test_redacts_nested_values():
    result = redact_data(
        {
            "user": {
                "name": "Yogesh",
                "credentials": {
                    "token": "secret",
                },
            },
        },
        ["token"],
    )

    assert result["user"]["name"] == "Yogesh"
    assert result["user"]["credentials"]["token"] == "[REDACTED]"