from contextvars import ContextVar

from langchain.agents import create_agent
from langchain_core.tools import tool

from config import openai_settings
from models import RecipeSource
from vector_store import vector_store as vs

_sources: ContextVar[list[RecipeSource]] = ContextVar("sources", default=[])


@tool
async def search_recipe(query: str):
    """Search recipes by query"""
    results = await vs.search(query)
    collected = _sources.get()
    for r in results:
        meta = r.get("metadata", {})
        collected.append(RecipeSource(
            title=meta.get("title", ""),
            ingredients=meta.get("ingredients", ""),
            steps=meta.get("steps", []),
        ))
    return results

_agent = create_agent(
    system_prompt=(
        "Ты 'Recipe AI' - полезный помощник для рецептов. "
        "Отвечай ТОЛЬКО по базе знаний, ничего не выдумывай. "
        "Если для рецепта нет шагов приготовления, просто не упоминай шаги — "
        "выведи только название и ингредиенты."
    ),
    model=openai_settings.llm,
    tools=[search_recipe]
)

async def ainvoke(messages: list) -> tuple[str, list[RecipeSource]]:
    collected: list[RecipeSource] = []
    _sources.set(collected)
    result = await _agent.ainvoke({"messages": messages})
    message = result["messages"][-1]
    return message.content, collected
