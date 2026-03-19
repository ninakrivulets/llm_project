from pydantic import BaseModel
from langchain_core.documents import Document

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class RecipeSource(BaseModel):
    title: str
    ingredients: str
    steps: list[str]


class ChatResponse(BaseModel):
    answer: str
    sources: list[RecipeSource] = []


class Recipe(BaseModel):
    title: str
    ingredients: str
    steps: list[str]

    def to_document(self) -> Document:
        parts = [f"{self.title}.", f"Ингредиенты: {self.ingredients}."]
        if self.steps:
            steps_text = " ".join(
                f"{i}. {s}" for i, s in enumerate(self.steps, 1)
            )
            parts.append(f"Шаги: {steps_text}")
        return Document(
            page_content="\n".join(parts),
            metadata=self.model_dump(),
        )
