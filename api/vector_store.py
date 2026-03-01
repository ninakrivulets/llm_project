from langchain_qdrant import QdrantVectorStore

from config import qdrant_settings, openai_settings
from models import Recipe

class VectorStore:
    def __init__(self):
        self.collection = qdrant_settings.collection
        client = qdrant_settings.client

        try:
            exists = client.collection_exists(qdrant_settings.collection)
        except Exception:
            raise ConnectionError("Отсутствует подключение к Qdrant")

        self._client = client
        self._async_client = qdrant_settings.async_client

        if exists:
            self._store = QdrantVectorStore.from_existing_collection(
                embedding=openai_settings.embedding,
                collection_name=self.collection,
                location=qdrant_settings.url,
            )
        else:
            self._store = QdrantVectorStore.from_documents(
                [],
                embedding=openai_settings.embedding,
                collection_name=self.collection,
                location=qdrant_settings.url,
            )

    async def add_recipes(self, recipes: list[Recipe]) -> list[str]:
        docs = [r.to_document() for r in recipes]
        return self._store.add_documents(docs)

    async def count(self) -> int:
        return (await self._async_client.count(self.collection)).count

    async def search(
        self,
        query: str,
        k: int = 5,
    ) -> list[dict]:
        kwargs = {}

        results = await self._store.asimilarity_search_with_score(query, k=k, **kwargs)
        return [
            {
                "metadata": doc.metadata,
                "score": score,
                "page_content": doc.page_content,
            }
            for doc, score in results
        ]

vector_store = VectorStore()
