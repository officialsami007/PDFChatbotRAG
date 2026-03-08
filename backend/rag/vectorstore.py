import chromadb
from typing import List
import os


def get_client() -> chromadb.PersistentClient:
    persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    os.makedirs(persist_dir, exist_ok=True)
    return chromadb.PersistentClient(path=persist_dir)


def store_chunks(session_id: str, chunks: List[str], embeddings: List[List[float]]) -> None:
    """Store text chunks and their embeddings in a per-session collection."""
    client = get_client()
    collection = client.get_or_create_collection(
        name=f"session_{session_id}",
        metadata={"hnsw:space": "cosine"}  # cosine similarity for semantic search
    )
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[f"chunk_{i}" for i in range(len(chunks))]
    )


def retrieve_chunks(session_id: str, query_embedding: List[float], top_k: int = 5) -> List[str]:
    """Retrieve the top-k most semantically similar chunks for a query."""
    client = get_client()
    try:
        collection = client.get_collection(f"session_{session_id}")
    except Exception:
        return []

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count())
    )
    return results["documents"][0] if results["documents"] else []


def delete_session(session_id: str) -> None:
    """Delete all vector data for a session (cleanup)."""
    client = get_client()
    try:
        client.delete_collection(f"session_{session_id}")
    except Exception:
        pass
