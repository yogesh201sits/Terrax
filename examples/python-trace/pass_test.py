import os

from dotenv import load_dotenv

# --------------------------------------------------
# Load .env FIRST
# --------------------------------------------------

load_dotenv()

# Enable LangChain -> OpenTelemetry integration
os.environ["LANGSMITH_OTEL_ENABLED"] = "true"
os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_OTEL_ONLY"] = "true"


from langchain.agents import create_agent
from langchain.tools import tool
from langchain_groq import ChatGroq

from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import (
    OTLPSpanExporter,
)


# --------------------------------------------------
# Configuration
# --------------------------------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

TERRAX_ENDPOINT = os.getenv(
    "TERRAX_ENDPOINT",
    "http://localhost:3000/v1/traces",
)

TERRAX_API_KEY = os.getenv("TERRAX_API_KEY")

SERVICE_NAME = os.getenv(
    "OTEL_SERVICE_NAME",
    "terrax-langchain-success-failure-test",
)


if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not set")

if not TERRAX_API_KEY:
    raise RuntimeError("TERRAX_API_KEY is not set")


# --------------------------------------------------
# OpenTelemetry -> Terrax
# --------------------------------------------------

resource = Resource.create(
    {
        "service.name": SERVICE_NAME,
    }
)

provider = TracerProvider(
    resource=resource
)

exporter = OTLPSpanExporter(
    endpoint=TERRAX_ENDPOINT,
    headers={
        "Authorization": "Bearer " + TERRAX_API_KEY,
    },
)

processor = BatchSpanProcessor(exporter)

provider.add_span_processor(processor)

trace.set_tracer_provider(provider)


# --------------------------------------------------
# Successful Tool
# --------------------------------------------------

@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city successfully."""

    print("\nSUCCESS TOOL called for:", city)

    return (
        "The weather in "
        + city
        + " is sunny with a temperature of 28°C."
    )


# --------------------------------------------------
# Failing Tool
# --------------------------------------------------

@tool
def get_weather_failure(city: str) -> str:
    """Get weather but intentionally fails."""

    print("\nFAILURE TOOL called for:", city)

    raise RuntimeError(
        "Weather service unavailable for " + city
    )


# --------------------------------------------------
# Groq
# --------------------------------------------------

model = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0,
    api_key=GROQ_API_KEY,
)


# --------------------------------------------------
# Agent
# --------------------------------------------------

agent = create_agent(
    model=model,
    tools=[
        get_weather,
        get_weather_failure,
    ],
    system_prompt="""
You are a testing assistant.

When the user asks you to test the weather tools:

1. Call get_weather for Pune.
2. Call get_weather_failure for Mumbai.
3. Do NOT stop after the first tool.
4. Execute both tools.
5. If the second tool fails, continue and report the failure.
""",
)


# --------------------------------------------------
# Run
# --------------------------------------------------

print("Running LangChain agent...")

try:

    result = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": (
                        "Test both weather tools. "
                        "First get the weather in Pune using "
                        "get_weather, then test Mumbai using "
                        "get_weather_failure. "
                        "I want to see one successful tool call "
                        "and one failed tool call."
                    ),
                }
            ]
        }
    )

    print("\nAgent result:")

    for message in result["messages"]:

        print("\n---")
        print(type(message).__name__)

        print(message.content)

except Exception as error:

    print("\nAgent failed:")
    print("Error type:", type(error).__name__)
    print("Error message:", str(error))


finally:

    # --------------------------------------------------
    # Flush OpenTelemetry
    # --------------------------------------------------

    print("\nFlushing OpenTelemetry spans...")

    processor.force_flush()

    print("Trace exported to Terrax")
