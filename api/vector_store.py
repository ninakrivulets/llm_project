from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from pydantic import BaseModel

from config import qdrant_settings, openai_settings


class Recipe(BaseModel):
    title: str
    ingredients: str
    steps: list[str]

    def to_document(self) -> Document:
        return Document(
            page_content=f"{self.title}.\nИнгредиенты: {self.ingredients}.\nШаги: {self.steps}",
            metadata=self.model_dump(),
        )


class VectorStore:
    def __init__(self):
        self.collection = qdrant_settings.collection
        client = qdrant_settings.client
        exists = client.collection_exists(qdrant_settings.collection)
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

    def search(
        self,
        query: str,
        k: int = 5,
    ) -> list[dict]:
        kwargs = {}

        results = self._store.similarity_search_with_score(query, k=k, **kwargs)
        return [
            {
                "metadata": doc.metadata,
                "score": score,
                "page_content": doc.page_content,
            }
            for doc, score in results
        ]

vector_store = VectorStore()


if __name__ == "__main__":
    import asyncio

    recipes = [
        Recipe(
            title="Борщ",
            ingredients="свёкла, капуста, картофель, морковь, лук, томатная паста, говядина, чеснок, сметана",
            steps=[
                "Сварить бульон из говядины (~1.5 часа).",
                "Натереть свёклу, обжарить с томатной пастой 10 минут.",
                "Добавить морковь и лук, пассеровать 5 минут.",
                "Картофель нарезать кубиками, добавить в бульон.",
                "Нашинковать капусту, добавить в суп.",
                "Добавить зажарку со свёклой, варить 15 минут.",
                "Посолить, добавить чеснок. Подавать со сметаной.",
            ],
        ),
        Recipe(
            title="Паста Карбонара",
            ingredients="спагетти, бекон, яйца, пармезан, чеснок, чёрный перец",
            steps=[
                "Отварить спагетти до состояния аль денте.",
                "Обжарить бекон с чесноком на сковороде.",
                "Взбить яйца с тёртым пармезаном и перцем.",
                "Смешать горячие спагетти с беконом, снять с огня.",
                "Добавить яично-сырную смесь, быстро перемешать.",
                "Подавать сразу, посыпав пармезаном.",
            ],
        ),
        Recipe(
            title="Греческий салат",
            ingredients="огурцы, помидоры, болгарский перец, красный лук, маслины, сыр фета, оливковое масло, орегано",
            steps=[
                "Нарезать огурцы, помидоры и перец крупными кусками.",
                "Лук нарезать полукольцами.",
                "Смешать овощи, добавить маслины.",
                "Выложить сверху кусочки феты.",
                "Полить оливковым маслом, посыпать орегано.",
            ],
        ),
        Recipe(
            title="Куриный суп с лапшой",
            ingredients="курица, морковь, лук, сельдерей, яичная лапша, петрушка, лавровый лист, соль, перец",
            steps=[
                "Сварить курицу с луком и лавровым листом (~1 час).",
                "Вынуть курицу, нарезать мясо, бульон процедить.",
                "Добавить в бульон морковь и сельдерей, варить 10 минут.",
                "Добавить лапшу, варить ещё 7 минут.",
                "Вернуть мясо, посолить, поперчить.",
                "Подавать с петрушкой.",
            ],
        ),
        Recipe(
            title="Блины",
            ingredients="мука, молоко, яйца, сахар, соль, сливочное масло, растительное масло для жарки",
            steps=[
                "Смешать яйца с сахаром и солью.",
                "Добавить молоко, постепенно всыпать муку, перемешать до однородности.",
                "Добавить растопленное сливочное масло.",
                "Разогреть сковороду, смазать маслом.",
                "Наливать тесто тонким слоем, жарить по 1-2 минуты с каждой стороны.",
            ],
        ),
    ]

    async def main():
        vs = VectorStore()

        print("Добавляем рецепты...")
        ids = await vs.add_recipes(recipes)
        print(f"Добавлено {len(ids)} рецептов: {ids}\n")

        queries = ["Борщ", "паста с беконом", "лёгкий салат", "суп с курицей"]
        for query in queries:
            print(f"Поиск: '{query}'")
            results = vs.search(query, k=2)
            for r in results:
                print(f"  [{r['score']:.3f}] {r['metadata']['title']}")
            print()

    asyncio.run(main())