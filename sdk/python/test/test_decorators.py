from terrax import tool, workflow


def test_tool_creates_tool_span(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @tool()
    def search_web(query):
        return f"Results for {query}"

    result = search_web("OpenTelemetry")

    assert result == "Results for OpenTelemetry"

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert span.name == "search_web"
    assert span.attributes["terrax.span.type"] == "tool"
    assert span.attributes["terrax.function.name"] == "search_web"


def test_workflow_creates_workflow_span(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @workflow()
    def research(query):
        return f"Researching {query}"

    result = research("OpenTelemetry")

    assert result == "Researching OpenTelemetry"

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert span.name == "research"
    assert span.attributes["terrax.span.type"] == "workflow"
    assert span.attributes["terrax.function.name"] == "research"


def test_tool_supports_custom_name(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @tool(name="web.search")
    def search(query):
        return query

    search("OpenTelemetry")

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert span.name == "web.search"
    assert span.attributes["terrax.span.type"] == "tool"


def test_workflow_supports_capture(setup_tracing):
    exporter = setup_tracing
    exporter.clear()

    @workflow(
        capture_input=True,
        capture_output=True,
    )
    def research(query):
        return {"answer": query}

    research("OpenTelemetry")

    spans = exporter.get_finished_spans()

    assert len(spans) == 1

    span = spans[0]

    assert span.attributes["terrax.input"] == (
        '{"query": "OpenTelemetry"}'
    )

    assert span.attributes["terrax.output"] == (
        '{"answer": "OpenTelemetry"}'
    )