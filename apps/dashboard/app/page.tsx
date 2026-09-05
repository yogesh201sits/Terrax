import Link from "next/link";

const features = [
  {
    title: "AI Agent Tracing",
    description:
      "Follow complete agent workflows and understand how every step contributes to a trace.",
  },
  {
    title: "LLM Observability",
    description:
      "Monitor LLM calls, latency, errors, token usage, and the behavior of your AI applications.",
  },
  {
    title: "Tool & Retrieval Monitoring",
    description:
      "See how tools, retrieval systems, and external operations perform inside your agent workflows.",
  },
];

const metrics = ["Traces", "Latency", "Errors", "Token Usage", "Cost"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#e8e8e8] text-[#202020]">
      {/* Navigation */}
      <header className="border-b border-[#d5d5d5] bg-[#e8e8e8]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex size-11 items-center justify-center">
              <img
                src="/logo.png"
                alt="Terrax"
                className="size-25 scale-250 object-contain brightness-0"
              />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Terrax
            </span>
          </Link>

          <Link
            href="/overview"
            className="rounded-xl bg-[#e8e8e8] px-5 py-2.5 text-sm font-semibold shadow-[5px_5px_10px_#c9c9c9,-5px_-5px_10px_#ffffff] transition-all hover:shadow-[3px_3px_6px_#c9c9c9,-3px_-3px_6px_#ffffff] active:translate-y-px active:shadow-[inset_3px_3px_6px_#c9c9c9,inset_-3px_-3px_6px_#ffffff]"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
     <section className="relative overflow-hidden border-b border-[#d5d5d5]">
      {/* Minimal neumorphic trace shape */}
        <div
          className="
            pointer-events-none absolute
            left-1/2 top-[50%]
            h-[220px] w-[760px]
            -translate-x-1/2
            rounded-[45%]
            bg-[#e8e8e8]
            opacity-50
            shadow-[inset_18px_18px_35px_#d1d1d1,inset_-18px_-18px_35px_#ffffff]
          "
        />

        <div
          className="
            pointer-events-none absolute
            left-1/2 top-[45%]
            h-[90px] w-[430px]
            -translate-x-[10%]
            rotate-[-18deg]
            rounded-[50%]
            bg-[#e8e8e8]
            opacity-35
            shadow-[inset_10px_10px_22px_#d1d1d1,inset_-10px_-10px_22px_#ffffff]
          "
        />
        <div
          className="
            pointer-events-none absolute
            left-1/4 top-[45%]
            h-[90px] w-[430px]
            -translate-x-[10%]
            rotate-[18deg]
            rounded-[50%]
            bg-[#e8e8e8]
            opacity-35
            shadow-[inset_10px_10px_22px_#d1d1d1,inset_-10px_-10px_22px_#ffffff]
          "
        />

        <div className="relative z-10 mx-auto flex min-h-[650px] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mb-10 flex items-center justify-center gap-4 sm:gap-6 md:gap-10">
            <div className="relative size-16 shrink-0 sm:size-20 md:size-24">
              <img
                src="/logo.png"
                alt="Terrax"
                className="
                  absolute left-1/2 top-1/2
                  size-45
                  -translate-x-1/2 -translate-y-1/2
                  scale-450
                  object-contain
                  brightness-0
                  drop-shadow-[3px_3px_2px_#c4c4c4]
                  drop-shadow-[-2px_-2px_2px_#ffffff]
                "
              />
            </div>

            <span className="whitespace-nowrap text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Terrax
            </span>
          </div>

          <p className="mb-5 text-sm font-semibold tracking-wide text-[#777]">
            OpenTelemetry-powered observability
          </p>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Observability for
            <br />
            AI Agents
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-[#707070] sm:text-lg">
            Trace, monitor, and understand your AI applications with
            OpenTelemetry-powered observability built for agents, LLMs, tools,
            and retrieval workflows.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/overview"
              className="rounded-xl bg-[#202020] px-7 py-3.5 text-sm font-semibold text-white shadow-[6px_6px_12px_#c3c3c3] transition-all hover:-translate-y-0.5 hover:shadow-[8px_8px_16px_#c0c0c0] active:translate-y-0 active:shadow-[inset_3px_3px_6px_#111]"
            >
              Open Dashboard
            </Link>

            <Link
              href="/traces"
              className="rounded-xl bg-[#e8e8e8] px-7 py-3.5 text-sm font-semibold shadow-[6px_6px_12px_#c7c7c7,-6px_-6px_12px_#ffffff] transition-all hover:-translate-y-0.5 hover:shadow-[8px_8px_16px_#c5c5c5,-8px_-8px_16px_#ffffff] active:translate-y-0 active:shadow-[inset_3px_3px_6px_#c5c5c5,inset_-3px_-3px_6px_#ffffff]"
            >
              Explore Traces
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-5">
            {metrics.map((metric) => (
              <div
                key={metric}
                className="flex items-center gap-2 rounded-full bg-[#e8e8e8] px-4 py-2 text-xs font-medium text-[#707070] shadow-[3px_3px_7px_#c9c9c9,-3px_-3px_7px_#ffffff]"
              >
                <span className="size-1.5 rounded-full bg-[#202020]" />
                {metric}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Terrax Does */}
      <section className="border-b border-[#d5d5d5]">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#777]">
              Built for AI systems
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Understand what your agents are actually doing.
            </h2>

            <p className="mt-5 leading-7 text-[#707070]">
              AI applications are more than a single request and response.
              Terrax helps you observe the complete workflow behind your
              agents.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-[#e8e8e8] p-7 shadow-[9px_9px_18px_#c7c7c7,-9px_-9px_18px_#ffffff] transition-all duration-200 hover:-translate-y-1 hover:shadow-[12px_12px_24px_#c4c4c4,-12px_-12px_24px_#ffffff]"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#e8e8e8] text-sm font-bold text-[#555] shadow-[inset_3px_3px_6px_#c9c9c9,inset_-3px_-3px_6px_#ffffff]">
                  0{index + 1}
                </div>

                <h3 className="mt-7 text-lg font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#707070]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OpenTelemetry */}
      <section className="border-b border-[#d5d5d5]">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold text-[#777]">
                OpenTelemetry native
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Built on OpenTelemetry.
                <br />
                Designed for AI.
              </h2>

              <p className="mt-6 max-w-xl leading-7 text-[#707070]">
                Terrax uses OpenTelemetry as its foundation, giving your AI
                applications an open and extensible observability layer
                without replacing the telemetry ecosystem you already use.
              </p>

            <div className="mt-9 inline-flex rounded-2xl bg-[#e8e8e8] p-1.5 shadow-[8px_8px_18px_#c5c5c5,-8px_-8px_18px_#ffffff] transition-all duration-300 hover:shadow-[10px_10px_22px_#c2c2c2,-10px_-10px_22px_#ffffff]">
              <Link
                href="/overview"
                className="
                  group
                  relative
                  inline-flex
                  items-center
                  gap-2
                  overflow-hidden
                  rounded-xl
                  bg-[#e8e8e8]
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-zinc-800
                  shadow-[inset_2px_2px_5px_#c6c6c6,inset_-2px_-2px_5px_#ffffff]
                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:shadow-[6px_6px_12px_#c5c5c5,-6px_-6px_12px_#ffffff]

                  active:translate-y-0
                  active:shadow-[inset_4px_4px_8px_#c3c3c3,inset_-4px_-4px_8px_#ffffff]
                "
              >
                <span className="relative z-10">
                  View your telemetry
                </span>

                <span
                  className="
                    relative
                    z-10
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    bg-[#e8e8e8]
                    text-zinc-600
                    shadow-[2px_2px_5px_#c5c5c5,-2px_-2px_5px_#ffffff]
                    transition-all
                    duration-300
                    group-hover:translate-x-0.5
                    group-hover:text-zinc-900
                  "
                >
                  →
                </span>

                <span
                  className="
                    absolute
                    inset-x-6
                    top-0
                    h-px
                    bg-white/80
                  "
                />
              </Link>
            </div>
              
            </div>

            {/* Telemetry Visual */}
            <div className="rounded-3xl bg-[#e8e8e8] p-5 shadow-[inset_5px_5px_10px_#cfcfcf,inset_-5px_-5px_10px_#ffffff]">
              <div className="rounded-2xl bg-[#e8e8e8] p-6 shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff]">
                <div className="flex items-center justify-between border-b border-[#d3d3d3] pb-5">
                  <div>
                    <p className="text-sm font-semibold">
                      AI Agent Trace
                    </p>

                    <p className="mt-1 text-xs text-[#858585]">
                      trace_8f21c9
                    </p>
                  </div>

                  <span className="rounded-full bg-[#e8e8e8] px-3 py-1.5 text-xs font-medium shadow-[inset_2px_2px_4px_#c9c9c9,inset_-2px_-2px_4px_#ffffff]">
                    Completed
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <TraceItem
                    name="Agent"
                    duration="2.41s"
                    status="Completed"
                  />

                  <TraceItem
                    name="LLM Call"
                    duration="1.32s"
                    status="Completed"
                    indent
                  />

                  <TraceItem
                    name="Retrieval"
                    duration="420ms"
                    status="Completed"
                    indent
                  />

                  <TraceItem
                    name="Tool Call"
                    duration="610ms"
                    status="Completed"
                    indent
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-[#d5d5d5]">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#777]">
              AI-native visibility
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to understand performance.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#707070]">
              Start with traces and progressively add deeper observability
              across latency, errors, tokens, cost, and AI workflows.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {metrics.map((metric) => (
              <div
                key={metric}
                className="rounded-2xl bg-[#e8e8e8] px-6 py-9 text-center shadow-[7px_7px_14px_#c8c8c8,-7px_-7px_14px_#ffffff] transition-all hover:-translate-y-1"
              >
                <p className="text-sm font-semibold">{metric}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-32 text-center">
          <div className="rounded-3xl bg-[#e8e8e8] px-8 py-12 shadow-[12px_12px_24px_#c5c5c5,-12px_-12px_24px_#ffffff] sm:px-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Start observing your AI agents.
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-[#707070]">
              Explore your traces, understand your agent workflows, and build
              better AI applications with Terrax.
            </p>

            <Link
              href="/overview"
              className="mt-9 inline-flex rounded-xl bg-[#202020] px-7 py-3.5 text-sm font-semibold text-white shadow-[6px_6px_12px_#c1c1c1] transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Open Terrax Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d5d5d5]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-[#777] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#e8e8e8] shadow-[3px_3px_6px_#c9c9c9,-3px_-3px_6px_#ffffff]">
              <img
                src="/logo.png"
                alt=""
                className="size-5 object-contain brightness-0"
              />
            </div>

            <span className="font-medium">Terrax</span>
          </div>

          <p>Observability for AI Agents</p>
        </div>
      </footer>
    </main>
  );
}

function TraceItem({
  name,
  duration,
  status,
  indent = false,
}: {
  name: string;
  duration: string;
  status: string;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl bg-[#e8e8e8] px-4 py-3.5 ${
        indent ? "ml-5" : ""
      } shadow-[inset_3px_3px_6px_#cccccc,inset_-3px_-3px_6px_#ffffff]`}
    >
      <div className="flex items-center gap-3">
        <span className="size-2 rounded-full bg-[#202020]" />

        <span className="text-sm font-medium">{name}</span>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#777]">
        <span>{duration}</span>
        <span>{status}</span>
      </div>
    </div>
  );
}
