from langchain.agents import create_agent
from langchain_core.tools import tool

from config import openai_settings
from vector_store import VectorStore


@tool
def search_recipe(query: str):
    """Search recipes by query"""
    vs = VectorStore()
    print(f"tool invoked: {query}")
    return vs.search(query)

_agent = create_agent(
    system_prompt="Ты 'Recipe AI' - полезный помощник для рецептов. Отвечай ТОЛЬКО по базе знаний, ничего не выдумывай",
    model=openai_settings.llm,
    tools=[search_recipe]
)

async def ainvoke(messages: list) -> str:
    result = await _agent.ainvoke({"messages": messages})
    message = result["messages"][-1]
    return message.content
