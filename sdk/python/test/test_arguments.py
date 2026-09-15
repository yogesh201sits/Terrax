from terrax.serialization import (
    bind_arguments,
    safe_serialize,
)


def test_positional_arguments():
    def search(query, limit):
        pass

    result = bind_arguments(
        search,
        ("OpenTelemetry", 5),
        {},
    )

    assert result == {
        "query": "OpenTelemetry",
        "limit": 5,
    }


def test_keyword_arguments():
    def search(query, limit):
        pass

    result = bind_arguments(
        search,
        (),
        {
            "query": "OpenTelemetry",
            "limit": 5,
        },
    )

    assert result == {
        "query": "OpenTelemetry",
        "limit": 5,
    }


def test_default_arguments():
    def search(query, limit=10):
        pass

    result = bind_arguments(
        search,
        ("OpenTelemetry",),
        {},
    )

    assert result == {
        "query": "OpenTelemetry",
        "limit": 10,
    }


def test_mixed_arguments():
    def search(
        query,
        limit=10,
        include_metadata=False,
    ):
        pass

    result = bind_arguments(
        search,
        ("OpenTelemetry",),
        {
            "include_metadata": True,
        },
    )

    assert result == {
        "query": "OpenTelemetry",
        "limit": 10,
        "include_metadata": True,
    }


def test_serialize_primitives():
    result = safe_serialize(
        {
            "query": "OpenTelemetry",
            "limit": 5,
            "enabled": True,
        }
    )

    assert result == (
        '{"query": "OpenTelemetry", '
        '"limit": 5, '
        '"enabled": true}'
    )


def test_serialize_nested_data():
    result = safe_serialize(
        {
            "query": "OpenTelemetry",
            "filters": {
                "language": "python",
                "limit": 5,
            },
            "tags": ["otel", "tracing"],
        }
    )

    assert result == (
        '{"query": "OpenTelemetry", '
        '"filters": {"language": "python", "limit": 5}, '
        '"tags": ["otel", "tracing"]}'
    )


def test_serialize_tuple_and_set():
    result = safe_serialize(
        {
            "values": (1, 2, 3),
            "tags": {"otel", "tracing"},
        }
    )

    assert '"values": [1, 2, 3]' in result
    assert '"tags": [' in result


def test_serialize_unknown_object():
    class User:
        def __repr__(self):
            return "User(name='Yogesh')"

    result = safe_serialize(
        {
            "user": User(),
        }
    )

    assert result == (
        '{"user": "User(name=\'Yogesh\')"}'
    )


def test_serialize_circular_reference():
    data = {
        "name": "test",
    }

    data["self"] = data

    result = safe_serialize(data)

    assert "<circular_reference>" in result

def test_serialize_truncates_large_payload():
    result = safe_serialize(
        {
            "data": "x" * 10_000,
        },
        max_size=100,
    )

    assert len(result) <= 100
    assert result.endswith("...<truncated>")
