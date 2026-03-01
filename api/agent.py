from langchain.agents import create_agent
from langchain_core.tools import tool

from config import openai_settings
from vector_store import vector_store as vs


@tool
async def search_recipe(query: str):
    """Search recipes by query"""
    print(f"tool invoked: {query}")
    return await vs.search(query)

_agent = create_agent(
    system_prompt="Ты 'Recipe AI' - полезный помощник для рецептов. Отвечай ТОЛЬКО по базе знаний, ничего не выдумывай",
    model=openai_settings.llm,
    tools=[search_recipe]
)

async def ainvoke(messages: list) -> str:
    result = await _agent.ainvoke({"messages": messages})
    message = result["messages"][-1]
    return message.content
