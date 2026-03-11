import os
os.environ["ANONYMIZED_TELEMETRY"] = "False"
os.environ["CHROMA_TELEMETRY"] = "False"

from typing import List
from langchain_chroma import Chroma
from langchain.schema import Document
from rag.embedder import get_embeddings


def _collection_name(session_id: str) -> str:
    return f"session_{session_id}"


def _persist_dir() -> str:
    path = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    os.makedirs(path, exist_ok=True)
    return path


def store_chunks(session_id: str, chunks: List[str]) -> Chroma:
    documents = [Document(page_content=chunk) for chunk in chunks]
    vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=get_embeddings(),
        collection_name=_collection_name(session_id),
        persist_directory=_persist_dir(),
        collection_metadata={"hnsw:space": "cosine"},
    )
    return vectorstore


def get_vectorstore(session_id: str) -> Chroma:
    return Chroma(
        collection_name=_collection_name(session_id),
        embedding_function=get_embeddings(),
        persist_directory=_persist_dir(),
        collection_metadata={"hnsw:space": "cosine"},
    )


def delete_session(session_id: str) -> None:
    try:
        vs = get_vectorstore(session_id)
        vs.delete_collection()
    except Exception:
        pass