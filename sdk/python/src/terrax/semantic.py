from enum import StrEnum


class SpanType(StrEnum):
    GENERIC = "generic"
    AGENT = "agent"
    WORKFLOW = "workflow"
    LLM = "llm"
    TOOL = "tool"
    RETRIEVER = "retriever"
    EMBEDDING = "embedding"