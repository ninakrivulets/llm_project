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
    answer = await agent.ainvoke(req.history)
    return ChatResponse(answer=answer)


@app.get("/api/recipes/count")
async def recipes_count():
    return {"count": await vs.count()}
