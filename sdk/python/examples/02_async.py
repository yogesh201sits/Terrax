import asyncio

from config import initialize_terrax
from terrax import observe, shutdown


initialize_terrax()


@observe(name="async_agent")
async def run_agent(query: str):
    await asyncio.sleep(0.1)

    return {
        "query": query,
        "result": "async result",
    }


async def main():
    result = await run_agent("test async tracing")
    print(result)


asyncio.run(main())

shutdown()
