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
    "terrax-langchain-test",
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

# IMPORTANT:
# LangSmith/LangChain will detect this provider
trace.set_tracer_provider(provider)


# --------------------------------------------------
# Tool
# --------------------------------------------------

@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city."""

    return "The weather in " + city + " is sunny and 28°C."


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
    tools=[get_weather],
    system_prompt="You are a helpful assistant.",
)


# --------------------------------------------------
# Run
# --------------------------------------------------

print("Running LangChain agent...")

result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "What is the weather in Pune?",
            }
        ]
    }
)


# --------------------------------------------------
# Result
# --------------------------------------------------

print("\nAgent result:")

for message in result["messages"]:
    print("\n---")
    print(type(message).__name__)
    print(message.content)


# --------------------------------------------------
# Flush
# --------------------------------------------------

print("\nFlushing OpenTelemetry spans...")

processor.force_flush()

print("Trace exported to Terrax")