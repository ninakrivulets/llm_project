from pydantic import BaseModel
from langchain_core.documents import Document

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class ChatResponse(BaseModel):
    answer: str


class Recipe(BaseModel):
    title: str
    ingredients: str
    steps: list[str]

    def to_document(self) -> Document:
        return Document(
            page_content=f"{self.title}.\nИнгредиенты: {self.ingredients}.\nШаги: {self.steps}",
            metadata=self.model_dump(),
        )
