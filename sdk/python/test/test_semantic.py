import pytest

from terrax import SpanType


def test_span_type_values():
    assert SpanType.GENERIC.value == "generic"
    assert SpanType.AGENT.value == "agent"
    assert SpanType.WORKFLOW.value == "workflow"
    assert SpanType.LLM.value == "llm"
    assert SpanType.TOOL.value == "tool"
    assert SpanType.RETRIEVER.value == "retriever"
    assert SpanType.EMBEDDING.value == "embedding"


def test_span_type_from_string():
    assert SpanType("agent") == SpanType.AGENT


def test_invalid_span_type():
    with pytest.raises(ValueError):
        SpanType("invalid")