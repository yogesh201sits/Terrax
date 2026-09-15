from typing import Any

from opentelemetry.trace import Status, StatusCode

from .client import ensure_initialized
from .metadata import set_common_metadata
from .otel import get_tracer
from .semantic import SpanType


class Span:
    def __init__(
        self,
        name: str,
        *,
        kind: SpanType | str = SpanType.GENERIC,
        attributes: dict[str, Any] | None = None,
    ):
        try:
            self.kind = SpanType(kind)
        except ValueError:
            valid_kinds = ", ".join(
                item.value
                for item in SpanType
            )

            raise ValueError(
                f"Invalid span kind: {kind!r}. "
                f"Expected one of: {valid_kinds}"
            ) from None

        self.name = name
        self.attributes = attributes

        self._span = None
        self._context_manager = None

    def __enter__(self):
        ensure_initialized()

        tracer = get_tracer()

        self._context_manager = (
            tracer.start_as_current_span(self.name)
        )

        self._span = self._context_manager.__enter__()

        set_common_metadata(self._span)

        self._span.set_attribute(
            "terrax.span.type",
            self.kind.value,
        )

        if self.attributes:
            self.set_attributes(self.attributes)

        return self

    def __exit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ):
        if exc_value is not None:
            self.record_exception(exc_value)
            self.set_status(StatusCode.ERROR)

        return self._context_manager.__exit__(
            exc_type,
            exc_value,
            traceback,
        )

    def set_attribute(
        self,
        key: str,
        value: Any,
    ) -> None:
        self._require_active()

        self._span.set_attribute(
            key,
            value,
        )

    def set_attributes(
        self,
        attributes: dict[str, Any],
    ) -> None:
        self._require_active()

        for key, value in attributes.items():
            self._span.set_attribute(
                key,
                value,
            )

    def add_event(
        self,
        name: str,
        *,
        attributes: dict[str, Any] | None = None,
    ) -> None:
        self._require_active()

        self._span.add_event(
            name,
            attributes=attributes,
        )

    def record_exception(
        self,
        exception: BaseException,
    ) -> None:
        self._require_active()

        self._span.record_exception(exception)

    def set_status(
        self,
        status: Status | StatusCode,
        description: str | None = None,
    ) -> None:
        self._require_active()

        if isinstance(status, StatusCode):
            status = Status(
                status,
                description,
            )

        self._span.set_status(status)

    def _require_active(self) -> None:
        if self._span is None:
            raise RuntimeError(
                "Span is not active. "
                "Use it inside a with block."
            )


def span(
    name: str,
    *,
    kind: SpanType | str = SpanType.GENERIC,
    attributes: dict[str, Any] | None = None,
) -> Span:
    return Span(
        name,
        kind=kind,
        attributes=attributes,
    )