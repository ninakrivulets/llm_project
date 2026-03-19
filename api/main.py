from config import phoenix_settings

# Instrument LangChain with Phoenix before importing agent
if phoenix_settings.collector_endpoint:
    from phoenix.otel import register
    from openinference.instrumentation.langchain import LangChainInstrumentor

    tracer_provider = register(
        project_name="recipe-ai",
        endpoint=phoenix_settings.collector_endpoint,
    )
    LangChainInstrumentor().instrument(tracer_provider=tracer_provider)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import ChatRequest, ChatResponse

import agent
from vector_store import vector_store as vs

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    answer, sources = await agent.ainvoke(req.history)
    return ChatResponse(answer=answer, sources=sources)


@app.get("/api/recipes/count")
async def recipes_count():
    return {"count": await vs.count()}
