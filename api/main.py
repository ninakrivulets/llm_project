from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import agent

from config import openai_settings
from vector_store import vector_store

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_RECIPES_COUNT = 12_483


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    filters: dict = {}


class ChatResponse(BaseModel):
    answer: str




@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    answer = await agent.ainvoke(req.history)
    return ChatResponse(answer=answer)


@app.get("/api/recipes/count")
async def recipes_count():
    return {"count": await vector_store.count()}
