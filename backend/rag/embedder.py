from langchain_huggingface import HuggingFaceEmbeddings

_embeddings = None


def get_embeddings() -> HuggingFaceEmbeddings:
    """Singleton — model loads once and is reused across all requests."""
    global _embeddings
    if _embeddings is None:
        print("Loading embedding model (first run takes ~30 seconds)...")
        _embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        print("Embedding model loaded.")
    return _embeddings