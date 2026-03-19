from pathlib import Path

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from pydantic_settings import BaseSettings, SettingsConfigDict as Config
from qdrant_client import QdrantClient, AsyncQdrantClient

ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT / ".env"


class AppSettings(BaseSettings):
    model_config = Config(extra="ignore", env_file=str(ENV_PATH))


class OpenAISettings(AppSettings):
    api_key: str
    api_base: str | None = None
    embedding_model: str = "text-embedding-3-small"
    chat_model: str = "gpt-5-mini"
    proxy: str | None = None

    model_config = Config(env_prefix="OPENAI_")

    @property
    def llm(self) -> ChatOpenAI:
        return ChatOpenAI(
            api_key=self.api_key,
            model=self.chat_model,
            openai_proxy=self.proxy,
        )

    @property
    def embedding(self) -> OpenAIEmbeddings:
        return OpenAIEmbeddings(
            api_key=self.api_key,
            model=self.embedding_model,
            openai_proxy=self.proxy,
        )

class QdrantSettings(AppSettings):
    url: str = "http://localhost:6333"
    collection: str = "recipes"

    model_config = Config(env_prefix="QDRANT_")

    @property
    def client(self):
        return QdrantClient(url=self.url)

    @property
    def async_client(self):
        return AsyncQdrantClient(url=self.url)


class PhoenixSettings(AppSettings):
    collector_endpoint: str | None = None

    model_config = Config(env_prefix="PHOENIX_")


openai_settings = OpenAISettings()
qdrant_settings = QdrantSettings()
phoenix_settings = PhoenixSettings()
