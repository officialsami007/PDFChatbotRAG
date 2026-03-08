from sentence_transformers import SentenceTransformer
from typing import List

# Downloaded once (~80MB), then cached locally — completely free
_model = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print("Loading embedding model (first run takes ~30 seconds)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Embedding model loaded.")
    return _model


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Embed a list of text chunks. Returns list of 384-dim vectors."""
    model = get_model()
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    return embeddings.tolist()


def embed_query(query: str) -> List[float]:
    """Embed a single query string for similarity search."""
    model = get_model()
    embedding = model.encode([query], convert_to_numpy=True, show_progress_bar=False)
    return embedding[0].tolist()
